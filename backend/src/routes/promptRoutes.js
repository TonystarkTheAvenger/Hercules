import { Router } from 'express';
import { getPromptConfig, savePromptConfig } from '../controllers/promptController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/config', optionalAuth, getPromptConfig);
router.post('/config', optionalAuth, savePromptConfig);

export default router;
