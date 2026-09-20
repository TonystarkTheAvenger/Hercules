import React, { useState } from 'react';
import type { Message } from '../types';
import { ChevronDown, ChevronUp, FileText, CornerDownRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAssistant = message.sender === 'assistant';
  const [showCitations, setShowCitations] = useState(false);

  if (!isAssistant) {
    return (
      <div className="flex justify-end my-6 animate-slide-in-from-bottom">
        <div className="max-w-[85%] bg-[#111111]/80 backdrop-blur-md border border-[#262626] rounded-2xl rounded-tr-sm px-5 py-3.5 text-[15px] text-app-text-primary shadow-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="mt-1.5 text-[11px] text-app-text-muted text-right">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // Assistant: Editorial reading layout with clear hierarchy
  return (
    <div className="my-8 max-w-full animate-slide-in-from-bottom text-app-text-primary pl-0 lg:pl-4">
      {/* Herculean AI Header */}
      <div className="flex items-center gap-2 mb-3 text-[12px] font-medium text-app-text-secondary">
        <div className="w-6 h-6 rounded-md bg-app-surface border border-app-border flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-app-accent" />
        </div>
        <span className="text-app-text-primary font-semibold">Hercules</span>
        <span className="opacity-40">&middot;</span>
        <span className="text-app-text-muted">{message.timestamp}</span>
        {message.topic && (
          <>
            <span className="opacity-40">&middot;</span>
            <span className="text-app-text-muted bg-app-surface px-2 py-0.5 rounded-full border border-app-border/50">{message.topic}</span>
          </>
        )}
      </div>

      {/* Markdown Body */}
      <div className={`ml-8 text-[15px] leading-relaxed text-app-text-primary prose prose-invert max-w-none ${message.isHint ? 'border-l-2 border-app-accent pl-5 py-1 my-3' : ''}`}>
        {message.isHint && (
          <span className="block font-semibold text-app-accent text-[11px] uppercase tracking-wider mb-2">
            Herculean Hint
          </span>
        )}
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-4 text-app-text-primary" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-5 mb-3 text-app-text-primary" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-md font-semibold mt-4 mb-2 text-app-text-primary" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed text-[#D4D4D4]" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-[#D4D4D4] space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-[#D4D4D4] space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            code: ({node, inline, className, children, ...props}: any) => 
              inline ? (
                <code className="px-1.5 py-0.5 rounded-md bg-[#262626] text-app-text-primary font-mono text-[13px] border border-[#333333]" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="my-4 p-4 bg-[#111111] text-app-text-primary rounded-lg font-mono text-[13px] overflow-x-auto border border-[#333333] leading-relaxed">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ),
            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#555555] pl-4 italic text-[#A3A3A3] my-4" {...props} />,
            a: ({node, ...props}) => <a className="text-[#FFFFFF] underline decoration-[#555555] hover:decoration-[#FFFFFF] underline-offset-2 transition-colors" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-app-text-primary" {...props} />
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Grounded Source (RAG) Disclosure */}
      {message.citations && message.citations.length > 0 && (
        <div className="mt-4 pt-2 ml-8">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="inline-flex items-center gap-1.5 text-[12px] text-app-text-muted hover:text-app-text-primary transition-colors font-medium py-1 group"
          >
            <CornerDownRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
            <span>
              Grounded in {message.citations.length} course source{message.citations.length > 1 ? 's' : ''}
            </span>
            {showCitations ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCitations && (
            <div className="mt-3 pl-5 border-l border-app-border space-y-4 text-[13px]">
              {message.citations.map((c, i) => (
                <div key={i} className="py-1">
                  <div className="flex items-center gap-2 text-app-text-primary font-medium">
                    <FileText className="w-3.5 h-3.5 text-app-text-muted" />
                    <span>{c.documentTitle}</span>
                    <span className="text-app-text-muted text-[11px] font-normal px-1.5 py-0.5 bg-app-surface rounded-md border border-app-border">Page {c.pageNumber}</span>
                  </div>
                  <p className="mt-2 text-app-text-secondary italic text-[13px] leading-relaxed">
                    "{c.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
