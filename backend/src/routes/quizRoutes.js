import { Router } from 'express';
import { generateQuiz, submitQuiz } from '../controllers/quizController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/generate', optionalAuth, generateQuiz);
router.post('/submit', optionalAuth, submitQuiz);

export default router;
