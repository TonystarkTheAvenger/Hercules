import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { ArrowUp, Lightbulb, Zap, Sparkles } from 'lucide-react';

export const ChatInput: React.FC = () => {
  const { sendMessage, isThinking, requestHint, openQuiz, isGeneratingQuiz } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    'Why does an unbalanced BST degrade to O(n)?',
    'How does AVL rotation restore balance?',
    'Explain BFS vs DFS traversal order',
  ];

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* Subtle Horizontal Suggestions */}
        <div className="flex flex-wrap gap-2 text-[12px] pb-1">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(suggestion)}
              disabled={isThinking}
              className="px-3 py-1.5 rounded-full bg-app-surface hover:bg-app-hover text-app-text-muted hover:text-app-text-primary border border-app-border transition-colors text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Composer Box */}
        <div className="liquid-panel bg-[#0C0C0C] rounded-xl p-3 transition-all relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or explain your reasoning..."
            rows={1}
            disabled={isThinking}
            className="w-full bg-transparent text-app-text-primary placeholder:text-app-text-muted text-[15px] focus:outline-none resize-none max-h-40 leading-relaxed py-1"
          />

          {/* Bottom Controls Bar */}
          <div className="flex items-center justify-between pt-3 mt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={requestHint}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-app-text-secondary hover:text-app-text-primary hover:bg-app-hover transition-colors disabled:opacity-40"
                title="Request a progressive Herculean hint without revealing the answer"
              >
                <Lightbulb className="w-4 h-4 text-app-text-muted" />
                <span>Get Hint</span>
              </button>

              <button
                type="button"
                onClick={openQuiz}
                disabled={isGeneratingQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-app-text-secondary hover:text-app-text-primary hover:bg-app-hover transition-colors disabled:opacity-40"
                title="Generate an instant 3-question MCQ quiz based on current context"
              >
                <Zap className="w-4 h-4 text-app-accent" />
                <span>{isGeneratingQuiz ? 'Generating...' : 'Instant Quiz'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-app-accent hover:bg-app-accent/90 text-app-text-primary disabled:opacity-30 disabled:bg-app-border transition-colors shadow-sm"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-app-text-muted px-2">
          <span>Shift + Enter for new line</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Herculean Protocol Active
          </span>
        </div>
      </div>
    </div>
  );
};
