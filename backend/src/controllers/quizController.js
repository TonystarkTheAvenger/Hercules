import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { generateQuizQuestions } from '../services/geminiService.js';

export async function generateQuiz(req, res) {
  try {
    const { topic = 'AVL Tree Rotations' } = req.body;
    const questions = await generateQuizQuestions(topic);
    return res.json({ questions });
  } catch (err) {
    console.error('Quiz controller error:', err);
    return res.status(500).json({ error: 'Server error generating quiz' });
  }
}

export async function submitQuiz(req, res) {
  try {
    const { studentId, topic, score, total } = req.body;
    const record = {
      id: `quiz_attempt_${uuidv4().substring(0, 8)}`,
      studentId: studentId || (req.user ? req.user.id : 'usr_student_01'),
      topic: topic || 'General Concepts',
      score: score || 0,
      total: total || 3,
      percentage: Math.round(((score || 0) / (total || 3)) * 100),
      submittedAt: new Date().toISOString(),
    };

    db.insert('quizzes', record);
    return res.status(201).json({ success: true, record });
  } catch (err) {
    return res.status(500).json({ error: 'Server error saving quiz results' });
  }
}
