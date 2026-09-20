import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import { seedDatabase } from './scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for frontend Vite development server & production builds
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint (used by frontend to detect live backend status)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Node.js (Express)',
    uptime: Math.round(process.uptime()),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prompts', promptRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'Socratica Socratic AI Platform API',
    version: '1.0.0',
    status: 'active',
    documentation: {
      health: 'GET /health',
      departments: 'GET /api/departments',
      courses: 'GET /api/courses',
      documents: 'GET /api/documents',
      chat: 'POST /api/chat',
      quiz: 'POST /api/quiz/generate',
      analytics: 'GET /api/analytics',
      auth: 'POST /api/auth/login',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Ensure seed data is present on launch
seedDatabase(false);

// Start HTTP server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Socratica Node.js Backend is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🏛️ Departments API: http://localhost:${PORT}/api/departments`);
  console.log(`=======================================================`);
});

export default app;
