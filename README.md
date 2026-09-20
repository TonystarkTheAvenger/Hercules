# Socratica — AI Socratic Learning Platform 🦉

> An interactive university learning platform that enforces true Socratic pedagogy — guiding students through deep inquiry rather than spoon-feeding answers — backed by course document RAG and professor analytics.

---

## 🌟 Hackathon Demo Highlights

- **Student Portal**:
  - **Socratic Tutor Chat**: Strict Socratic prompt enforcing guided questioning instead of revealing direct solutions.
  - **Progressive Hint Engine**: Provides gentle clues only after repeated struggle turns.
  - **Knowledge Vault**: Grounded in indexed lecture PDFs and course materials with source citations.
  - **Instant Socratic Quiz**: Generates 3 conceptual MCQs directly from the ongoing discussion context with instant feedback & confetti celebration.
- **Professor Portal**:
  - **Document & RAG Manager**: Drag-and-drop PDF upload with real-time vector chunking & ChromaDB status.
  - **Topic Frequency Insights**: Visual breakdown of student inquiries and question volume.
  - **Bottleneck Detection**: Automatically identifies high-struggle topics (e.g. AVL Left-Right Double Rotations) where students take 4+ turns.
  - **Live Telemetry Stream**: Real-time monitor of student question depths and resolution states.
  - **Socratic Prompt Tuning**: Interface to adjust hint thresholds, strictness, and pedagogical tone.
- **1-Click Demo Bar**:
  - Top floating toolbar for judges to switch roles instantly (`Student View` ↔ `Professor View`), reset the conversation, and check FastAPI backend status.

---

## 🔑 Demo Accounts

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `demo123` | Alex Rivera (CS201) |
| **Professor** | `prof@demo.com` | `demo123` | Dr. Evelyn Vance (Faculty) |

*You can also click the quick-login buttons on the login screen or use the top Demo Bar.*

---

## 🚀 Running the Frontend

```bash
# Navigate to frontend folder
cd frontend

# Start Vite development server
npm run dev
```

The application will launch on `http://localhost:5173`.

### Backend Resilience (Dual-Mode)
- **Live FastAPI Mode**: If FastAPI is running on `http://localhost:8000`, the frontend automatically communicates with `/api/chat`, `/api/documents`, `/api/quiz`, and `/api/analytics`.
- **Demo Simulator Mode**: If FastAPI is not running, the frontend gracefully falls back to an embedded client-side Socratic engine and preloaded realistic telemetry — ensuring a 100% flawless presentation during live judging!

---

## 📂 Project Architecture

```
hackthon/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # LoginView with 1-click role presets
│   │   │   ├── layout/         # DemoBar, Navbar
│   │   │   ├── student/        # ChatMessageItem, ChatInput, KnowledgeVault, QuizModal, StudentDashboard
│   │   │   ├── professor/      # DocumentManager, KeywordInsights, BottleneckAlerts, StudentFeed, PromptConfigView
│   │   │   └── common/         # StatCard, Badge
│   │   ├── context/            # AuthContext, ChatContext, DocumentContext
│   │   ├── lib/                # api.ts (FastAPI + fallback), socraticEngine.ts, mockData.ts
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Root orchestrator
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```
