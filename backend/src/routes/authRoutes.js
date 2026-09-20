import { Router } from 'express';
import { login, register, getMe, getAllUsers, deleteUser } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, requireRole('admin'), getAllUsers);
router.delete('/users/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
