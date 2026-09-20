import React, { useState, useRef } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { UploadCloud, FileText, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/Badge';

export const DocumentManagerPage: React.FC = () => {
  const { documents, uploadDocument, deleteDocument, isUploading, uploadProgress, indexingStatusText } =
    useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadDocument(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`p-6 liquid-panel border border-dashed transition-colors cursor-pointer text-center ${
          dragActive
            ? 'border-[#D4AF37] bg-[#111111]'
            : 'border-white/10 hover:border-white/30 bg-transparent shadow-none'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />

        <div className="max-w-sm mx-auto space-y-2">
          <div className="w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.08] text-app-text-primary flex items-center justify-center mx-auto">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-sm font-medium text-app-text-primary">
              {isUploading ? 'Ingesting Document...' : 'Upload Course Material'}
            </h4>
            <p className="text-xs text-app-text-muted mt-0.5">
              Drag & drop lecture notes or syllabus to chunk & index into ChromaDB
            </p>
          </div>

          {isUploading && (
            <div className="pt-2 space-y-1.5 text-left">
              <div className="flex items-center justify-between text-xs text-app-text-primary">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-app-text-primary" />
                  {indexingStatusText}
                </span>
                <span className="text-app-text-primary font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-lg bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 rounded-lg"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="liquid-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#111111]">
          <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
            Indexed Course Sources
          </h4>
          <span className="text-xs text-app-text-muted">
            {documents.length} Files &bull; {documents.reduce((acc, c) => acc + c.chunksCount, 0)} Chunks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.01] text-app-text-muted border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Size</th>
                <th className="px-4 py-2.5 font-medium">Chunks</th>
                <th className="px-4 py-2.5 font-medium">Concepts</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222e]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-app-bg transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-app-text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-app-text-primary">{doc.title}</p>
                        <p className="text-[11px] text-app-text-primary">{doc.filename}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-app-text-primary text-[11px]">
                    {doc.pages}p · {doc.filesize}
                  </td>
                  <td className="px-4 py-3 text-app-text-primary">
                    {doc.chunksCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {doc.extractedTopics.slice(0, 2).map((topic, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-app-bg text-app-text-primary border border-app-border"
                        >
                          {topic}
                        </span>
                      ))}
                      {doc.extractedTopics.length > 2 && (
                        <span className="text-[10px] text-app-text-primary">
                          +{doc.extractedTopics.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success" size="sm">
                      Indexed
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-app-text-primary hover:text-rose-400 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
