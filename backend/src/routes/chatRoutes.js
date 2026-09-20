import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, handleChatMessage);

export default router;
