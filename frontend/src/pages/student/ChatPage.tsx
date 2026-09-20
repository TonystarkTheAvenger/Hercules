import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useDocuments } from '../../context/DocumentContext';
import { KnowledgeVaultPage } from '../../pages/student/KnowledgeVaultPage';
import { ChatBubble } from '../../components/ChatBubble';
import { ChatInput } from '../../components/ChatInput';
import { QuizPage } from '../../pages/student/QuizPage';
import { BookOpen, RotateCcw, Zap, Sparkles } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { messages, isThinking, activeTopic, openQuiz, resetChat } = useChat();
  const { selectedDocIds } = useDocuments();
  const [isVaultOpenMobile, setIsVaultOpenMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 flex overflow-hidden relative bg-transparent animate-fade-in">
      {/* Knowledge Vault Sidebar (Desktop) */}
      <div className="hidden lg:block w-72 shrink-0 h-full">
        <KnowledgeVaultPage />
      </div>

      {/* Mobile Drawer for Knowledge Vault */}
      {isVaultOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-app-bg/60 backdrop-blur-sm"
            onClick={() => setIsVaultOpenMobile(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
            <KnowledgeVaultPage onClose={() => setIsVaultOpenMobile(false)} />
          </div>
        </div>
      )}

      {/* Main Herculean Learning Interface */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-app-border">
        {/* Subtle Chat Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVaultOpenMobile(true)}
              className="lg:hidden p-1.5 text-app-text-muted hover:text-app-text-primary rounded-md"
              title="Open Knowledge Vault"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-[13px]">
              <span className="font-semibold text-app-text-primary text-[14px]">{activeTopic}</span>
              <span className="text-app-border">|</span>
              <span className="text-app-text-muted">
                {selectedDocIds.length} sources active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-app-text-primary bg-app-surface hover:bg-app-hover border border-app-border transition-colors shadow-sm"
              title="Generate a 3-question MCQ quiz on this concept"
            >
              <Zap className="w-3.5 h-3.5 text-app-accent" />
              <span>Test Knowledge</span>
            </button>

            <button
              onClick={resetChat}
              className="p-1.5 text-app-text-muted hover:text-app-text-primary rounded-md hover:bg-app-surface transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread (Centered Editorial Column) */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 pb-6 space-y-6">
          <div className="max-w-[860px] mx-auto w-full pt-4">
            {/* Herculean Protocol Context Element */}
            <div className="flex items-center justify-center gap-2 text-[12px] text-app-text-muted pb-8 mb-6 border-b border-app-border/50">
              <Sparkles className="w-3.5 h-3.5 text-app-accent opacity-80" />
              <span className="font-medium text-app-text-primary">Herculean mode</span>
              <span className="opacity-50">—</span>
              <span>Hercules guides your reasoning instead of giving the answer.</span>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-app-surface border border-app-border flex items-center justify-center text-app-text-muted mb-2">
                  <Sparkles className="w-5 h-5 text-app-accent" />
                </div>
                <h3 className="text-lg font-medium text-app-text-primary">Start thinking.</h3>
                <p className="text-[14px] text-app-text-muted max-w-sm leading-relaxed">
                  Ask Hercules a question, or explain how you currently understand the problem.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
              </div>
            )}

            {/* Subtle Typing Indicator */}
            {isThinking && (
              <div className="mt-6 flex items-center gap-3 text-[13px] text-app-text-muted animate-fade-in pl-12">
                <Sparkles className="w-3.5 h-3.5 text-app-accent opacity-50" />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-text-muted/40 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-app-text-muted/40 animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-app-text-muted/40 animate-pulse delay-200" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Composer */}
        <div className="w-full shrink-0 flex justify-center px-4 pb-6">
          <div className="max-w-[860px] w-full">
            <ChatInput />
          </div>
        </div>
      </div>

      {/* Instant Quiz Modal */}
      <QuizPage />
    </div>
  );
};
