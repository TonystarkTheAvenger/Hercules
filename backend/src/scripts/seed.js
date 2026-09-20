import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';

export function seedDatabase(force = false) {
  const existingDepts = db.getTable('departments');
  if (existingDepts.length > 0 && !force) {
    console.log('Database already populated, skipping seed.');
    return;
  }

  console.log('Seeding database with Academic Departments, Courses, Users, and Telemetry...');

  // 1. Academic Departments
  const departments = [
    {
      id: 'dept_cs',
      name: 'Faculty of Computer Science',
      code: 'CS',
      headOfDepartment: 'Dr. Alan Turing',
      description: 'Undergraduate and Graduate studies in Computing, Algorithms, and Software Systems.',
      totalStudents: 142,
      totalFaculty: 18,
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'dept_ece',
      name: 'Department of Electrical & Computer Engineering',
      code: 'ECE',
      headOfDepartment: 'Dr. Claude Shannon',
      description: 'Hardware architectures, Embedded Systems, Signal Processing, and Microelectronics.',
      totalStudents: 98,
      totalFaculty: 12,
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'dept_math',
      name: 'Department of Mathematics & Statistics',
      code: 'MATH',
      headOfDepartment: 'Dr. Emmy Noether',
      description: 'Foundational discrete mathematics, linear algebra, calculus, and probability.',
      totalStudents: 115,
      totalFaculty: 14,
      createdAt: '2026-01-10T08:00:00.000Z'
    }
  ];

  // 2. Courses
  const courses = [
    {
      id: 'course_cs201',
      departmentId: 'dept_cs',
      code: 'CS201',
      title: 'Data Structures & Algorithms',
      term: 'Fall 2026',
      instructor: 'Dr. Evelyn Vance',
      description: 'Trees, balanced search trees, graph algorithms, asymptotic analysis, and dynamic programming.'
    },
    {
      id: 'course_cs301',
      departmentId: 'dept_cs',
      code: 'CS301',
      title: 'Database Systems & Data Modeling',
      term: 'Fall 2026',
      instructor: 'Dr. Edgar Codd',
      description: 'Relational algebra, SQL, index structures, query execution, and ACID transactions.'
    },
    {
      id: 'course_ece210',
      departmentId: 'dept_ece',
      code: 'ECE210',
      title: 'Digital Logic & Computer Organization',
      term: 'Fall 2026',
      instructor: 'Dr. John von Neumann',
      description: 'Boolean algebra, combinational & sequential logic, ALU design, and RISC-V pipelining.'
    },
    {
      id: 'course_math101',
      departmentId: 'dept_math',
      code: 'MATH101',
      title: 'Linear Algebra & Vector Spaces',
      term: 'Fall 2026',
      instructor: 'Dr. Gilbert Strang',
      description: 'Vector spaces, matrix decomposition, eigenvalues/eigenvectors, and linear transformations.'
    }
  ];

  // 3. Demo Users
  const passwordHash = bcrypt.hashSync('password123', 10);
  const users = [
    {
      id: 'usr_student_01',
      email: 'student@demo.com',
      passwordHash,
      name: 'Alex Rivera',
      role: 'student',
      departmentId: 'dept_cs',
      courseId: 'course_cs201',
      course: 'CS201',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_prof_01',
      email: 'prof@demo.com',
      passwordHash,
      name: 'Dr. Evelyn Vance',
      role: 'professor',
      departmentId: 'dept_cs',
      courseId: 'course_cs201',
      course: 'CS201',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_admin_01',
      email: 'admin@demo.com',
      passwordHash,
      name: 'System Admin',
      role: 'admin',
      departmentId: 'dept_cs',
      course: 'System Operations',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    }
  ];

  // 4. Documents & RAG chunks
  const documents = [
    {
      id: 'doc_avl_01',
      title: 'Lecture 04: AVL Balanced Trees and Rotations',
      filename: 'CS201_Lecture_04_AVL_Rotations.pdf',
      filesize: '2.4 MB',
      pages: 28,
      uploadDate: '2026-09-12',
      status: 'indexed',
      chunksCount: 84,
      departmentId: 'dept_cs',
      course: 'CS201',
      courseId: 'course_cs201',
      extractedTopics: ['AVL Trees', 'Left-Right Rotations', 'Balance Factor', 'Tree Rebalancing'],
      description: 'Comprehensive guide to maintaining O(log n) invariant in binary search trees via single and double rotations.'
    },
    {
      id: 'doc_graph_01',
      title: 'Lecture 07: Graph Traversals (BFS vs DFS)',
      filename: 'CS201_Lecture_07_Graph_Traversals.pdf',
      filesize: '3.1 MB',
      pages: 34,
      uploadDate: '2026-09-15',
      status: 'indexed',
      chunksCount: 96,
      departmentId: 'dept_cs',
      course: 'CS201',
      courseId: 'course_cs201',
      extractedTopics: ['Breadth-First Search', 'Depth-First Search', 'Adjacency Lists', 'Topological Sort'],
      description: 'Queue and recursion-based systematic traversals with asymptotic proofs.'
    }
  ];

  const document_chunks = [
    {
      id: 'chk_avl_01',
      documentId: 'doc_avl_01',
      documentTitle: 'Lecture 04: AVL Balanced Trees and Rotations',
      pageNumber: 14,
      content: 'Definition: An AVL tree is a self-balancing binary search tree where the difference between heights of left and right subtrees (Balance Factor = Height(Left) - Height(Right)) cannot exceed 1 or be less than -1 for all nodes.'
    },
    {
      id: 'chk_avl_02',
      documentId: 'doc_avl_01',
      documentTitle: 'Lecture 04: AVL Balanced Trees and Rotations',
      pageNumber: 18,
      content: 'Left-Right (LR) Double Rotation: Occurs when a node has a balance factor of +2 and its left child has a balance factor of -1. Resolution requires first performing a Left Rotation on the left child, followed by a Right Rotation on the imbalanced ancestor node.'
    },
    {
      id: 'chk_graph_01',
      documentId: 'doc_graph_01',
      documentTitle: 'Lecture 07: Graph Traversals (BFS vs DFS)',
      pageNumber: 8,
      content: 'Breadth-First Search (BFS) explores all vertices at the present depth level before moving on to vertices at the next depth level, using a First-In-First-Out (FIFO) queue data structure. The shortest path in an unweighted graph is guaranteed.'
    }
  ];

  // 5. Student telemetry logs
  const student_queries = [
    {
      id: 'log_01',
      studentName: 'Maya Patel',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      queryText: 'Why does an AVL Left-Right imbalance require two rotations instead of just one simple rotation?',
      timestamp: '10 mins ago',
      topic: 'AVL Tree Rotations',
      exchanges: 4,
      status: 'struggling',
      difficulty: 'Advanced',
      departmentId: 'dept_cs',
      courseId: 'course_cs201'
    },
    {
      id: 'log_02',
      studentName: 'David Kim',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      queryText: 'Can DFS guarantee the shortest path in an unweighted graph if I use recursion?',
      timestamp: '25 mins ago',
      topic: 'Graph Traversals',
      exchanges: 2,
      status: 'resolved',
      difficulty: 'Intermediate',
      departmentId: 'dept_cs',
      courseId: 'course_cs201'
    },
    {
      id: 'log_03',
      studentName: 'Sophia Chen',
      studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      queryText: 'What is the space complexity of BFS when the branching factor is b and depth is d?',
      timestamp: '42 mins ago',
      topic: 'Graph Traversals',
      exchanges: 3,
      status: 'resolved',
      difficulty: 'Foundational',
      departmentId: 'dept_cs',
      courseId: 'course_cs201'
    }
  ];

  db.data.departments = departments;
  db.data.courses = courses;
  db.data.users = users;
  db.data.documents = documents;
  db.data.document_chunks = document_chunks;
  db.data.student_queries = student_queries;
  db.save();

  console.log('Database seeded successfully!');
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase(true);
}
