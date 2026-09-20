import { Router } from 'express';
import { listCourses, createCourse } from '../controllers/courseController.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listCourses);
router.post('/', authenticateToken, requireRole('admin', 'professor'), createCourse);

export default router;
