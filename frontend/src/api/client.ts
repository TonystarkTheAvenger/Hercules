import type { Message, Document, QuizQuestion, TopicInsight, StudentQueryLog } from '../types';

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
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

  if (!res.ok) throw new Error('Chat API failed');
  
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

export async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function generateQuiz(topic?: string): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: topic || 'trees' }),
  });
  if (!res.ok) throw new Error('Failed to generate quiz');
  const data = await res.json();
  return data.questions;
}

export async function fetchProfessorAnalytics(): Promise<{
  insights: TopicInsight[];
  queries: StudentQueryLog[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchBottlenecks(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/bottlenecks`);
  if (!res.ok) throw new Error('Failed to fetch bottlenecks');
  return res.json();
}
