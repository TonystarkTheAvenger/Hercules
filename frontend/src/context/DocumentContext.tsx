import React, { createContext, useContext, useState } from 'react';
import type { Document } from '../types';
import { INITIAL_DOCUMENTS } from '../api/mockData';

interface DocumentContextType {
  documents: Document[];
  selectedDocIds: string[];
  toggleSelectDoc: (id: string) => void;
  selectAllDocs: () => void;
  deselectAllDocs: () => void;
  uploadDocument: (file: File) => Promise<Document>;
  deleteDocument: (id: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  indexingStatusText: string;
  viewingDocId: string | null;
  setViewingDocId: (id: string | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [indexingStatusText, setIndexingStatusText] = useState('');
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllDocs = () => {
    setSelectedDocIds(documents.map((d) => d.id));
  };

  const deselectAllDocs = () => {
    setSelectedDocIds([]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((i) => i !== id));
  };

  const uploadDocument = async (file: File): Promise<Document> => {
    setIsUploading(true);
    setUploadProgress(15);
    setIndexingStatusText('Reading document bytes & extracting pages...');

    // Read the file as base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setUploadProgress(45);
    setIndexingStatusText('Parsing text hierarchy & code blocks...');

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(75);
    setIndexingStatusText('Generating semantic vectors & chunking...');

    await new Promise((r) => setTimeout(r, 300));
    setUploadProgress(100);
    setIndexingStatusText('Indexing chunks in ChromaDB vector store...');

    await new Promise((r) => setTimeout(r, 200));

    const estPages = Math.max(2, Math.floor(file.size / (1024 * 70)));
    const estChunks = estPages * 4;

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      filename: file.name,
      filesize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      pages: estPages,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'indexed',
      chunksCount: estChunks,
      course: 'CS201',
      extractedTopics: ['Lecture Slides', 'Algorithms', 'Core Concepts'],
      description: `Newly indexed course document parsed into ${estChunks} semantic vector chunks.`,
      base64Data,
      mimeType: file.type || 'application/pdf',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocIds((prev) => [...prev, newDoc.id]);
    setIsUploading(false);
    setUploadProgress(0);
    setIndexingStatusText('');

    return newDoc;
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        selectedDocIds,
        toggleSelectDoc,
        selectAllDocs,
        deselectAllDocs,
        uploadDocument,
        deleteDocument,
        isUploading,
        uploadProgress,
        indexingStatusText,
        viewingDocId,
        setViewingDocId,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
