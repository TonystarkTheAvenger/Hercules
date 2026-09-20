export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  course: string;
  department?: string;
}

export interface Citation {
  documentTitle: string;
  pageNumber: number;
  snippet: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  topic?: string;
  isHint?: boolean;
  citations?: Citation[];
  turnCount?: number;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  filesize: string;
  pages: number;
  uploadDate: string;
  status: 'indexed' | 'indexing' | 'failed';
  chunksCount: number;
  course: string;
  extractedTopics: string[];
  description?: string;
  progress?: number;
  base64Data?: string;
  mimeType?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  herculeanHint: string;
  topic: string;
}

export interface TopicInsight {
  topic: string;
  questionCount: number;
  studentCount: number;
  percentage: number;
  avgFollowUps: number;
  difficulty: 'High' | 'Medium' | 'Low';
  isBottleneck?: boolean;
}

export interface StudentQueryLog {
  id: string;
  studentName: string;
  studentAvatar: string;
  queryText: string;
  timestamp: string;
  topic: string;
  exchanges: number;
  status: 'resolved' | 'in_progress' | 'struggling';
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
}
