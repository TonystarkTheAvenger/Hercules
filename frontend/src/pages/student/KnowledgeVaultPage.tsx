import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { Search, FileText, X, Book, Eye } from 'lucide-react';

interface KnowledgeVaultPageProps {
  onClose?: () => void;
}

export const KnowledgeVaultPage: React.FC<KnowledgeVaultPageProps> = ({ onClose }) => {
  const { documents, selectedDocIds, toggleSelectDoc, selectAllDocs, deselectAllDocs, setViewingDocId, viewingDocId } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.extractedTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="h-full animate-fade-in flex flex-col liquid-panel border-y-0 border-l-0 rounded-none bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-app-text-primary flex items-center gap-2">
            <Book className="w-4 h-4 text-app-text-secondary" />
            Knowledge Vault
          </h2>
          <p className="text-[11px] text-app-text-muted mt-1 leading-relaxed">
            Course sources available to Hercules
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-app-text-muted hover:text-app-text-primary transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Document Search Field */}
      <div className="px-4 pb-4 space-y-3 shrink-0">
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-app-text-muted group-focus-within:text-app-accent transition-colors" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-surface border border-transparent hover:border-app-border rounded-md pl-9 pr-3 py-1.5 text-[13px] text-app-text-primary placeholder:text-app-text-muted focus:outline-none focus:border-app-accent focus:bg-app-hover transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-app-text-muted px-1">
          <span className="font-medium tracking-wide text-[10px] uppercase">
            COURSE MATERIAL
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllDocs}
              className="hover:text-app-text-primary transition-colors"
            >
              All
            </button>
            <span className="opacity-40">A</span>
            <button
              onClick={deselectAllDocs}
              className="hover:text-app-text-primary transition-colors"
            >
              None
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-10 text-[12px] text-app-text-muted">
            No sources available
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            const isViewing = viewingDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => toggleSelectDoc(doc.id)}
                className={`group px-3 py-2.5 animate-slide-in-from-bottom rounded-md transition-colors cursor-pointer select-none relative flex items-start gap-3 ${
                  isSelected ? 'bg-app-hover' : 'hover:bg-app-surface'
                } ${isViewing ? 'ring-1 ring-app-accent' : ''}`}
              >
                {/* Thin left accent indicator when selected */}
                {isSelected && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-app-accent rounded-r-full" />
                )}

                <div className="mt-0.5 text-app-text-muted shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`text-[13px] leading-snug truncate ${
                        isSelected
                          ? 'text-app-text-primary font-medium'
                          : 'text-app-text-secondary group-hover:text-app-text-primary'
                      }`}
                    >
                      {doc.title}
                    </h3>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingDocId(isViewing ? null : doc.id);
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        isViewing ? 'opacity-100 text-app-accent' : 'text-app-text-muted hover:text-white'
                      }`}
                      title={isViewing ? "Close PDF" : "View PDF"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-app-text-muted">
                    <span>{doc.pages} pages</span>
                    <span>A</span>
                    <span>{doc.chunksCount} chunks</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="p-4 bg-app-bg/50 border-t border-app-border text-[11px] text-app-text-muted flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          Indexed & Ready
        </span>
      </div>
    </aside>
  );
};
