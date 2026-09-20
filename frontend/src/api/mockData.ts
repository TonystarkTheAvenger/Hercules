import type { User, Document, Message, QuizQuestion, TopicInsight, StudentQueryLog } from '../types';

export const DEMO_USERS: Record<string, User> = {
  student: {
    id: 'usr_student_01',
    email: 'student@demo.com',
    name: 'Alex Rivera',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    course: 'CS201: Data Structures & Algorithms',
    department: 'Computer Science',
  },
  professor: {
    id: 'usr_prof_01',
    email: 'prof@demo.com',
    name: 'Dr. Evelyn Vance',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    course: 'CS201: Data Structures & Algorithms',
    department: 'Faculty of Computer Science',
  },
};

export const INITIAL_DOCUMENTS: Document[] = [];
export const INITIAL_CHAT_MESSAGES: Message[] = [];
export const MOCK_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {};
export const TOPIC_INSIGHTS: TopicInsight[] = [];
export const RECENT_STUDENT_QUERIES: StudentQueryLog[] = [];
