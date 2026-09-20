import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { db } from '../db/database.js';

export async function listDocuments(req, res) {
  try {
    const { departmentId, course } = req.query;
    let docs = db.getTable('documents');

    if (departmentId) {
      docs = docs.filter((d) => d.departmentId === departmentId);
    }
    if (course) {
      docs = docs.filter((d) => d.course === course);
    }

    return res.json(docs);
  } catch (err) {
    console.error('List documents error:', err);
    return res.status(500).json({ error: 'Server error fetching documents' });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { departmentId = 'dept_cs', course = 'CS201' } = req.body;

    let parsedText = '';
    let pageCount = 1;

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      parsedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } catch (pdfErr) {
      console.warn('PDF parse warning, using fallback text chunker:', pdfErr.message);
      parsedText = `Uploaded document: ${file.originalname}`;
    }

    const docId = `doc_${uuidv4().substring(0, 8)}`;
    const title = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const filesizeMB = (file.size / (1024 * 1024)).toFixed(1);

    // Semantic chunking: split by paragraphs or ~500 character boundaries
    const paragraphs = parsedText.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    const chunks = [];
    let currentChunk = '';
    let pageIdx = 1;

    for (const para of paragraphs) {
      if ((currentChunk + para).length > 600) {
        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: `chk_${uuidv4().substring(0, 8)}`,
            documentId: docId,
            documentTitle: title,
            pageNumber: Math.min(pageIdx++, pageCount),
            content: currentChunk.trim(),
          });
        }
        currentChunk = para;
      } else {
        currentChunk += ' ' + para;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `chk_${uuidv4().substring(0, 8)}`,
        documentId: docId,
        documentTitle: title,
        pageNumber: Math.min(pageIdx, pageCount),
        content: currentChunk.trim(),
      });
    }

    // Save chunks to db
    for (const chunk of chunks) {
      db.insert('document_chunks', chunk);
    }

    const newDoc = {
      id: docId,
      title,
      filename: file.originalname,
      filesize: `${filesizeMB} MB`,
      pages: pageCount,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'indexed',
      chunksCount: chunks.length || 1,
      course,
      departmentId,
      extractedTopics: ['Course Material', 'Lecture Content', title],
      description: `Indexed ${pageCount} pages into ${chunks.length || 1} semantic vector chunks.`,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      mimeType: file.mimetype || 'application/pdf',
    };

    db.insert('documents', newDoc);

    return res.status(201).json(newDoc);
  } catch (err) {
    console.error('Upload document error:', err);
    return res.status(500).json({ error: 'Server error processing document upload' });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    db.delete('documents', (d) => d.id === id);
    db.delete('document_chunks', (c) => c.documentId === id);
    return res.json({ success: true, message: `Document ${id} deleted` });
  } catch (err) {
    return res.status(500).json({ error: 'Server error deleting document' });
  }
}
