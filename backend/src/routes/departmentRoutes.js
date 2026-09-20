import { Router } from 'express';
import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  getDepartmentAnalytics,
} from '../controllers/departmentController.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listDepartments);
router.get('/:id', optionalAuth, getDepartmentById);
router.get('/:id/analytics', optionalAuth, getDepartmentAnalytics);
router.post('/', authenticateToken, requireRole('admin', 'professor'), createDepartment);

export default router;
