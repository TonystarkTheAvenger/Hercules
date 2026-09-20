import React, { createContext, useContext, useState } from 'react';
import type { Message, QuizQuestion } from '../types';
import { sendChatMessage, generateQuiz } from '../api/client';
import { useDocuments } from '../context/DocumentContext';

interface ChatContextType {
  messages: Message[];
  isThinking: boolean;
  activeTopic: string;
  isQuizOpen: boolean;
  currentQuiz: QuizQuestion[];
  isGeneratingQuiz: boolean;
  sendMessage: (content: string) => Promise<void>;
  requestHint: () => Promise<void>;
  resetChat: () => void;
  openQuiz: () => Promise<void>;
  closeQuiz: () => void;
  quickPrompt: (promptText: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('AVL Tree Rotations');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const { documents, selectedDocIds } = useDocuments();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isThinking) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: activeTopic,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const activeDocs = documents.filter((d) => selectedDocIds.includes(d.id));
      // Do not include userMsg in history, as the backend appends the new message manually
      const response = await sendChatMessage(content, messages, activeDocs);

      if (response.topic) {
        setActiveTopic(response.topic);
      }

      setMessages((prev) => [...prev, response]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        content: "Let's pause and consider: what fundamental assumption is being made here, and how would you test it with a smaller example?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const requestHint = async () => {
    await sendMessage("I'm feeling stuck on this step. Could you give me a small Herculean hint?");
  };

  const quickPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const resetChat = () => {
    setMessages([]);
    setActiveTopic('General Concepts');
  };

  const openQuiz = async () => {
    setIsGeneratingQuiz(true);
    setIsQuizOpen(true);
    try {
      const questions = await generateQuiz(activeTopic);
      setCurrentQuiz(questions);
    } catch (err) {
      console.error('Quiz error:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const closeQuiz = () => {
    setIsQuizOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isThinking,
        activeTopic,
        isQuizOpen,
        currentQuiz,
        isGeneratingQuiz,
        sendMessage,
        requestHint,
        resetChat,
        openQuiz,
        closeQuiz,
        quickPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
