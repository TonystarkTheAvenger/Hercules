import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';

export async function listCourses(req, res) {
  try {
    const { departmentId } = req.query;
    let courses = db.getTable('courses');

    if (departmentId) {
      courses = courses.filter((c) => c.departmentId === departmentId);
    }

    const result = courses.map((course) => {
      const dept = db.findOne('departments', (d) => d.id === course.departmentId);
      const docs = db.find('documents', (d) => d.courseId === course.id || d.course === course.code);
      return {
        ...course,
        departmentName: dept ? dept.name : 'Unknown Department',
        documentCount: docs.length,
      };
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Server error listing courses' });
  }
}

export async function createCourse(req, res) {
  try {
    const { departmentId, code, title, instructor, term, description } = req.body;
    if (!departmentId || !code || !title) {
      return res.status(400).json({ error: 'departmentId, code, and title are required' });
    }

    const dept = db.findOne('departments', (d) => d.id === departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const newCourse = {
      id: `course_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      departmentId,
      code,
      title,
      instructor: instructor || 'Staff',
      term: term || 'Fall 2026',
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    db.insert('courses', newCourse);
    return res.status(201).json(newCourse);
  } catch (err) {
    return res.status(500).json({ error: 'Server error creating course' });
  }
}
