import React, { createContext, useContext, useState } from 'react';
import type { Document } from '../types';
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

const API_BASE_URL = 'http://localhost:8000';

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [indexingStatusText, setIndexingStatusText] = useState('');
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  // Fetch initial documents from backend
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/documents`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      })
      .catch(err => console.error("Error fetching documents:", err));
  }, []);

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

  const deleteDocument = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setSelectedDocIds((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const uploadDocument = async (file: File): Promise<Document> => {
    setIsUploading(true);
    setUploadProgress(20);
    setIndexingStatusText('Uploading to server...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('course', 'CS401');

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      
      setUploadProgress(70);
      setIndexingStatusText('Parsing and indexing document...');
      
      const newDoc = await res.json();
      
      setUploadProgress(100);
      setIndexingStatusText('Complete');

      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocIds((prev) => [...prev, newDoc.id]);
      
      setIsUploading(false);
      setUploadProgress(0);
      setIndexingStatusText('');

      return newDoc;
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setIndexingStatusText('');
      throw error;
    }
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
