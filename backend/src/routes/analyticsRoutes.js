import { Router } from 'express';
import { getAnalytics, getBottlenecks } from '../controllers/analyticsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getAnalytics);
router.get('/bottlenecks', optionalAuth, getBottlenecks);

export default router;
