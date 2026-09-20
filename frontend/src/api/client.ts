import type { Message, Document, QuizQuestion, TopicInsight, StudentQueryLog } from '../types';
import { generateHerculeanResponse } from '../services/herculeanEngine';
import { INITIAL_DOCUMENTS, MOCK_QUIZ_QUESTIONS, TOPIC_INSIGHTS, RECENT_STUDENT_QUERIES } from '../api/mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

let backendAvailable: boolean | null = null;

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    backendAvailable = response.ok;
    return response.ok;
  } catch (err) {
    backendAvailable = false;
    return false;
  }
}

export function isBackendOnline(): boolean {
  return backendAvailable === true;
}

export async function sendChatMessage(
  content: string,
  history: Message[],
  activeDocuments: Document[]
): Promise<Message> {
  // If backend is available or untested, try calling real FastAPI endpoint
  if (backendAvailable !== false) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: history.map((h) => ({ role: h.sender, content: h.content })),
          document_ids: activeDocuments.map((d) => d.id),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        backendAvailable = true;
        const data = await res.json();
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          content: data.reply || data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topic: data.topic,
          citations: data.citations || [],
          isHint: data.is_hint,
        };
      }
    } catch (e) {
      backendAvailable = false;
    }
  }

  // Graceful client-side Herculean fallback
  await new Promise((resolve) => setTimeout(resolve, 600)); // natural reading pause
  const herculean = await generateHerculeanResponse(content, history, activeDocuments);

  return {
    id: `msg_${Date.now()}`,
    sender: 'assistant',
    content: herculean.content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    topic: herculean.topic,
    isHint: herculean.isHint,
    citations: herculean.citations,
  };
}

export async function fetchDocuments(): Promise<Document[]> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`);
      if (res.ok) {
        backendAvailable = true;
        return await res.json();
      }
    } catch (e) {
      backendAvailable = false;
    }
  }
  return INITIAL_DOCUMENTS;
}

export async function generateQuiz(topic?: string): Promise<QuizQuestion[]> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || 'trees' }),
      });
      if (res.ok) {
        backendAvailable = true;
        const data = await res.json();
        return data.questions;
      }
    } catch (e) {
      backendAvailable = false;
    }
  }

  // Graceful fallback
  await new Promise((resolve) => setTimeout(resolve, 450));
  if (topic && topic.toLowerCase().includes('graph')) {
    return MOCK_QUIZ_QUESTIONS.graphs;
  }
  return MOCK_QUIZ_QUESTIONS.trees;
}

export async function fetchProfessorAnalytics(): Promise<{
  insights: TopicInsight[];
  queries: StudentQueryLog[];
}> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics`);
      if (res.ok) {
        backendAvailable = true;
        return await res.json();
      }
    } catch (e) {
      backendAvailable = false;
    }
  }

  return {
    insights: TOPIC_INSIGHTS,
    queries: RECENT_STUDENT_QUERIES,
  };
}
