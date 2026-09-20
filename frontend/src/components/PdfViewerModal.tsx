import React, { useEffect, useRef } from 'react';
import { useDocuments } from '../context/DocumentContext';

export const PdfViewerModal: React.FC = () => {
  const { documents, viewingDocId, setViewingDocId } = useDocuments();
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const viewingDoc = documents.find(d => d.id === viewingDocId);

  useEffect(() => {
    if (viewingDocId && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!viewingDocId && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [viewingDocId]);

  return (
    <dialog 
      ref={dialogRef}
      onClose={() => setViewingDocId(null)}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-sm w-[90vw] h-[90vh] max-w-5xl bg-[#111] border border-white/10 rounded-lg p-0 text-white shadow-2xl m-auto"
    >
      {viewingDoc && (
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between items-center p-3 border-b border-white/10 shrink-0">
            <h3 className="font-medium truncate pr-4">{viewingDoc.title}</h3>
            <button 
              onClick={() => setViewingDocId(null)} 
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
            >
              Close
            </button>
          </div>
          {viewingDoc.url ? (
            <iframe src={viewingDoc.url} className="w-full flex-1 border-none bg-white" />
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/50">No preview available</div>
          )}
        </div>
      )}
    </dialog>
  );
};
