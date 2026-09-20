import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'socratica_super_secret_jwt_key_2026';

function formatUserResponse(user) {
  const department = user.departmentId
    ? db.findOne('departments', (d) => d.id === user.departmentId)
    : null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    course: user.course || 'CS201',
    courseId: user.courseId,
    departmentId: user.departmentId,
    department: department ? department.name : user.department || 'Computer Science'
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'student', departmentId = 'dept_cs', course = 'CS201' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      name,
      email,
      passwordHash,
      role: role.toLowerCase(),
      departmentId,
      course,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    db.insert('users', newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: formatUserResponse(newUser),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
}

export async function getMe(req, res) {
  try {
    const user = db.findOne('users', (u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: formatUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = db.getTable('users').map((u) => formatUserResponse(u));
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching users' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = db.delete('users', (u) => u.id === id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, message: `User ${id} removed` });
  } catch (err) {
    return res.status(500).json({ error: 'Server error deleting user' });
  }
}
