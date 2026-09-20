import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';

export async function listDepartments(req, res) {
  try {
    const departments = db.getTable('departments');
    const courses = db.getTable('courses');
    const users = db.getTable('users');

    const result = departments.map((dept) => {
      const deptCourses = courses.filter((c) => c.departmentId === dept.id);
      const deptStudents = users.filter((u) => u.departmentId === dept.id && u.role === 'student');
      const deptFaculty = users.filter((u) => u.departmentId === dept.id && u.role === 'professor');

      return {
        ...dept,
        courseCount: deptCourses.length,
        studentCount: deptStudents.length,
        facultyCount: deptFaculty.length,
        courses: deptCourses.map((c) => ({ id: c.id, code: c.code, title: c.title })),
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('List departments error:', err);
    return res.status(500).json({ error: 'Server error listing departments' });
  }
}

export async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;
    const department = db.findOne('departments', (d) => d.id === id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const courses = db.find('courses', (c) => c.departmentId === id);
    const faculty = db.find('users', (u) => u.departmentId === id && u.role === 'professor').map((f) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      avatar: f.avatar,
    }));
    const documents = db.find('documents', (d) => d.departmentId === id);

    return res.json({
      ...department,
      courses,
      faculty,
      documentCount: documents.length,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error retrieving department' });
  }
}

export async function createDepartment(req, res) {
  try {
    const { name, code, headOfDepartment, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }

    const existing = db.findOne('departments', (d) => d.code.toUpperCase() === code.toUpperCase());
    if (existing) {
      return res.status(409).json({ error: `Department with code ${code} already exists` });
    }

    const newDept = {
      id: `dept_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}_${uuidv4().substring(0, 4)}`,
      name,
      code: code.toUpperCase(),
      headOfDepartment: headOfDepartment || 'Unassigned',
      description: description || '',
      totalStudents: 0,
      totalFaculty: 0,
      createdAt: new Date().toISOString(),
    };

    db.insert('departments', newDept);
    return res.status(201).json(newDept);
  } catch (err) {
    console.error('Create department error:', err);
    return res.status(500).json({ error: 'Server error creating department' });
  }
}

export async function getDepartmentAnalytics(req, res) {
  try {
    const { id } = req.params;
    const department = db.findOne('departments', (d) => d.id === id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const queries = db.find('student_queries', (q) => q.departmentId === id);
    const strugglingCount = queries.filter((q) => q.status === 'struggling' || q.exchanges >= 4).length;
    const resolvedCount = queries.filter((q) => q.status === 'resolved').length;
    const totalExchanges = queries.reduce((sum, q) => sum + (q.exchanges || 1), 0);
    const avgTurns = queries.length > 0 ? (totalExchanges / queries.length).toFixed(1) : '0.0';

    return res.json({
      departmentId: id,
      departmentName: department.name,
      departmentCode: department.code,
      totalInquiries: queries.length,
      averageTurns: parseFloat(avgTurns),
      struggleRate: queries.length > 0 ? Math.round((strugglingCount / queries.length) * 100) : 0,
      resolutionRate: queries.length > 0 ? Math.round((resolvedCount / queries.length) * 100) : 0,
      activeBottlenecks: strugglingCount,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching department analytics' });
  }
}
