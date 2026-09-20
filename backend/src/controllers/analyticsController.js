import { db } from '../db/database.js';

export async function getAnalytics(req, res) {
  try {
    const { departmentId, courseId } = req.query;
    let queries = db.getTable('student_queries');

    if (departmentId) {
      queries = queries.filter((q) => q.departmentId === departmentId);
    }
    if (courseId) {
      queries = queries.filter((q) => q.courseId === courseId);
    }

    // Aggregate topic insights
    const topicMap = {};
    const totalQueries = queries.length || 1;

    for (const q of queries) {
      const topicName = q.topic || 'General Algorithms';
      if (!topicMap[topicName]) {
        topicMap[topicName] = {
          topic: topicName,
          questionCount: 0,
          students: new Set(),
          totalExchanges: 0,
          difficultyScores: [],
        };
      }
      topicMap[topicName].questionCount += 1;
      if (q.studentName) topicMap[topicName].students.add(q.studentName);
      topicMap[topicName].totalExchanges += q.exchanges || 1;
      topicMap[topicName].difficultyScores.push(q.exchanges || 1);
    }

    const insights = Object.values(topicMap).map((item) => {
      const avgFollowUps = parseFloat((item.totalExchanges / item.questionCount).toFixed(1));
      const percentage = Math.round((item.questionCount / totalQueries) * 100);
      const isBottleneck = avgFollowUps >= 3.5;
      const difficulty = avgFollowUps >= 3.5 ? 'High' : avgFollowUps >= 2.5 ? 'Medium' : 'Low';

      return {
        topic: item.topic,
        questionCount: item.questionCount,
        studentCount: item.students.size || 1,
        percentage,
        avgFollowUps,
        difficulty,
        isBottleneck,
      };
    });

    // Sort by question volume
    insights.sort((a, b) => b.questionCount - a.questionCount);

    // Recent queries sorted newest first
    const recentQueries = [...queries].reverse().slice(0, 20);

    return res.json({
      insights,
      queries: recentQueries,
    });
  } catch (err) {
    console.error('Analytics controller error:', err);
    return res.status(500).json({ error: 'Server error retrieving analytics' });
  }
}

export async function getBottlenecks(req, res) {
  try {
    const { departmentId } = req.query;
    let queries = db.getTable('student_queries');

    if (departmentId) {
      queries = queries.filter((q) => q.departmentId === departmentId);
    }

    // Filter topics where avg exchanges >= 3.5
    const topicMap = {};
    for (const q of queries) {
      const topicName = q.topic || 'General';
      if (!topicMap[topicName]) {
        topicMap[topicName] = { topic: topicName, queries: [] };
      }
      topicMap[topicName].queries.push(q);
    }

    const bottlenecks = [];
    for (const [topic, data] of Object.entries(topicMap)) {
      const totalExchanges = data.queries.reduce((sum, q) => sum + (q.exchanges || 1), 0);
      const avgTurns = parseFloat((totalExchanges / data.queries.length).toFixed(1));
      if (avgTurns >= 3.5 || data.queries.some((q) => q.status === 'struggling')) {
        bottlenecks.push({
          id: `btnk_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          topic,
          severity: avgTurns >= 4.0 ? 'Critical (4+ Turns)' : 'Elevated (3+ Turns)',
          avgTurns,
          affectedStudents: new Set(data.queries.map((q) => q.studentName)).size,
          rootCause: `Students repeatedly require multiple turns to resolve ${topic}. Key struggle points include prerequisite invariants and state transitions.`,
          resolved: false,
        });
      }
    }

    return res.json(bottlenecks);
  } catch (err) {
    return res.status(500).json({ error: 'Server error retrieving bottlenecks' });
  }
}
