import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let aiClient = null;
if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e.message);
  }
}

/**
 * Finds relevant document chunks based on simple keyword / token overlap
 */
export function findRelevantChunks(query, documentIds = []) {
  const allChunks = db.getTable('document_chunks');
  const filteredChunks = documentIds.length > 0
    ? allChunks.filter((c) => documentIds.includes(c.documentId))
    : allChunks;

  if (filteredChunks.length === 0) return [];

  const queryTerms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const scoredChunks = filteredChunks.map((chunk) => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    for (const term of queryTerms) {
      if (contentLower.includes(term)) score += 1;
    }
    return { chunk, score };
  });

  return scoredChunks
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.chunk);
}

/**
 * Socratic Chat Generation
 */
export async function generateSocraticResponse({ message, history = [], documentIds = [], turnCount = 1 }) {
  const promptConfig = db.getPromptConfig();
  const hintThreshold = promptConfig.hintThreshold || 3;
  const isStruggle = turnCount >= hintThreshold;

  // Retrieve relevant document chunks for RAG grounding
  const relevantChunks = findRelevantChunks(message, documentIds);
  const citations = relevantChunks.map((c) => ({
    documentTitle: c.documentTitle,
    pageNumber: c.pageNumber,
    snippet: c.content.substring(0, 140) + '...',
  }));

  const contextText = relevantChunks.length > 0
    ? `\nRelevant Course Document Snippets:\n` +
      relevantChunks.map((c, i) => `[Source ${i + 1} - ${c.documentTitle}, Page ${c.pageNumber}]: ${c.content}`).join('\n')
    : '';

  const systemInstruction = `${promptConfig.systemPrompt}
Direct Answer Prevention: Strict.
Pedagogical Rule: NEVER spoon-feed code or direct solutions. Use Socratic inquiry to guide the student towards formulating the answer themselves.
${isStruggle ? 'NOTE: The student has taken multiple turns and appears stuck. Provide a gentle scaffolded hint, but still end with an empowering question.' : ''}
${contextText}
At the very end of your reply, ALWAYS include a topic tag wrapped in square brackets, e.g.: [Topic: AVL Tree Rotations]`;

  // If Gemini API Key is configured, use real Gemini LLM
  if (GEMINI_API_KEY && aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...history.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const rawText = response.text || '';
      let topic = 'Computer Science';
      const topicMatch = rawText.match(/\[Topic:\s*(.*?)\]/i);
      if (topicMatch) {
        topic = topicMatch[1].trim();
      }

      const cleanReply = rawText.replace(/\[Topic:\s*.*?\]/i, '').trim();

      return {
        reply: cleanReply,
        topic,
        citations,
        is_hint: isStruggle,
      };
    } catch (apiErr) {
      console.error('Gemini API call failed, falling back to intelligent Socratic heuristics:', apiErr.message);
    }
  }

  // Fallback intelligent Socratic engine (ensures 100% resilience offline)
  let reply = '';
  let topic = 'Data Structures & Algorithms';

  const lower = message.toLowerCase();
  if (lower.includes('avl') || lower.includes('rotation') || lower.includes('balance')) {
    topic = 'AVL Tree Rotations';
    if (isStruggle) {
      reply = "Notice how the node with balance factor +2 has a left child with balance factor -1. If you only rotate right around the ancestor, will the grandchild end up in the correct BST position? What if we first rotate the left child so both balance factors point in the same direction?";
    } else {
      reply = "When an AVL tree is imbalanced with a Left-Right zigzag shape, what happens to the intermediate grandchild node during a single right rotation? How might doing a preliminary left rotation on the child simplify the structure?";
    }
  } else if (lower.includes('graph') || lower.includes('bfs') || lower.includes('dfs')) {
    topic = 'Graph Traversals';
    if (isStruggle) {
      reply = "Hint: Consider how a Queue explores level-by-level (breadth), whereas a Stack or recursion explores deeply along a single path. If every edge has an equal weight of 1, which data structure visits the destination in the minimum number of steps?";
    } else {
      reply = "Think about the mechanism of vertex exploration: when you are seeking the shortest unweighted path between two nodes, what invariant does a FIFO queue maintain that recursion cannot?";
    }
  } else {
    reply = "Let's examine the premise closely. What is the fundamental property or rule that governs this operation, and what would happen if you traced a small 3-element example by hand?";
  }

  return {
    reply,
    topic,
    citations,
    is_hint: isStruggle,
  };
}

/**
 * Quiz Question Generator
 */
export async function generateQuizQuestions(topic = 'AVL Trees') {
  if (GEMINI_API_KEY && aiClient) {
    try {
      const prompt = `Generate exactly 3 multiple-choice conceptual questions testing understanding of: "${topic}".
Output MUST be valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Why this is correct",
    "herculeanHint": "A guiding Socratic hint for a student who got it wrong",
    "topic": "${topic}"
  }
]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Quiz generation with Gemini failed, using curated question bank:', e.message);
    }
  }

  // High-quality curated default question sets
  if (topic.toLowerCase().includes('graph')) {
    return [
      {
        id: 'q_graph_1',
        question: 'Which graph traversal algorithm is guaranteed to find the shortest path in an unweighted graph?',
        options: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Topological Sort', 'Pre-order Traversal'],
        correctAnswerIndex: 0,
        explanation: 'BFS explores vertices layer by layer using a FIFO queue, guaranteeing minimal edge distance.',
        herculeanHint: 'Think about how vertices at distance d are visited before vertices at distance d+1.',
        topic: 'Graph Traversals',
      },
      {
        id: 'q_graph_2',
        question: 'What is the time complexity of Breadth-First Search when using an Adjacency List representation?',
        options: ['O(V + E)', 'O(V²)', 'O(E log V)', 'O(V * E)'],
        correctAnswerIndex: 0,
        explanation: 'Each vertex is enqueued once and each edge is inspected twice (or once in directed graphs).',
        herculeanHint: 'How many times do you dequeue a vertex, and how many incident edges do you iterate through?',
        topic: 'Graph Traversals',
      },
      {
        id: 'q_graph_3',
        question: 'What underlying data structure is typically used in the iterative implementation of DFS?',
        options: ['Stack (LIFO)', 'Queue (FIFO)', 'Priority Queue', 'Circular Buffer'],
        correctAnswerIndex: 0,
        explanation: 'Depth-first pursuit relies on a Last-In-First-Out stack to backtrack once a branch reaches a dead end.',
        herculeanHint: 'Consider how recursive function call stacks work when backtracking.',
        topic: 'Graph Traversals',
      },
    ];
  }

  return [
    {
      id: 'q_avl_1',
      question: 'What is the maximum allowed difference between the heights of the left and right subtrees in an AVL tree?',
      options: ['1', '0', '2', 'log(n)'],
      correctAnswerIndex: 0,
      explanation: 'The AVL balance factor invariant requires height(left) - height(right) to be within {-1, 0, +1}.',
      herculeanHint: 'What balance factors trigger an automatic rotation?',
      topic: 'AVL Tree Rotations',
    },
    {
      id: 'q_avl_2',
      question: 'Which rotation sequence is required to rebalance an AVL tree experiencing a Left-Right (LR) imbalance?',
      options: [
        'Left rotation on left child, then Right rotation on ancestor',
        'Right rotation on left child, then Left rotation on ancestor',
        'Single Right rotation on ancestor',
        'Double Right rotation on ancestor',
      ],
      correctAnswerIndex: 0,
      explanation: 'A left rotation straightens the zigzag into a Left-Left line, which is then restored by a right rotation.',
      herculeanHint: 'Notice how the zigzag must first be straightened into a single collinear line.',
      topic: 'AVL Tree Rotations',
    },
    {
      id: 'q_avl_3',
      question: 'What is the worst-case time complexity of an insertion operation in an AVL tree with n nodes?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
      correctAnswerIndex: 0,
      explanation: 'Searching down to the leaf takes O(log n), and at most two rotations taking O(1) are needed to restore balance.',
      herculeanHint: 'Does the height of an AVL tree ever grow beyond logarithmic bounds?',
      topic: 'AVL Tree Rotations',
    },
  ];
}
