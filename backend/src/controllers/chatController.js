import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { generateSocraticResponse } from '../services/geminiService.js';

export async function handleChatMessage(req, res) {
  try {
    const { message, history = [], document_ids = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Count user turns in the conversation to track struggle depth
    const userTurnCount = history.filter((h) => h.role === 'user' || h.role === 'student').length + 1;

    // Generate Socratic response with RAG citations
    const result = await generateSocraticResponse({
      message,
      history,
      documentIds: document_ids,
      turnCount: userTurnCount,
    });

    // Log query into student_queries telemetry table
    const studentUser = req.user || {
      id: 'usr_student_01',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      courseId: 'course_cs201',
    };

    const status = userTurnCount >= 4 ? 'struggling' : userTurnCount >= 2 ? 'resolved' : 'in_progress';
    const difficulty = userTurnCount >= 4 ? 'Advanced' : userTurnCount >= 2 ? 'Intermediate' : 'Foundational';

    const logEntry = {
      id: `log_${uuidv4().substring(0, 8)}`,
      studentId: studentUser.id,
      studentName: studentUser.name || 'Alex Rivera',
      studentAvatar: studentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      queryText: message,
      timestamp: 'Just now',
      topic: result.topic,
      exchanges: userTurnCount,
      status,
      difficulty,
      departmentId: studentUser.departmentId || 'dept_cs',
      courseId: studentUser.courseId || 'course_cs201',
      createdAt: new Date().toISOString(),
    };

    db.insert('student_queries', logEntry);

    return res.json({
      reply: result.reply,
      content: result.reply,
      topic: result.topic,
      citations: result.citations,
      is_hint: result.is_hint,
    });
  } catch (err) {
    console.error('Chat controller error:', err);
    return res.status(500).json({ error: 'Server error generating chat response' });
  }
}
