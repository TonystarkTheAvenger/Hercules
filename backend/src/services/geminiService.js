import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database.js';

const GEMINI_API_KEYS = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

function getAiClient() {
  if (GEMINI_API_KEYS.length === 0) return null;
  const key = GEMINI_API_KEYS[currentKeyIndex];
  // Rotate to the next key for the next request
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e.message);
    return null;
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

  const systemInstruction = `You are a helpful and highly accurate AI tutor.
CRITICAL INSTRUCTIONS TO SAVE TOKENS:
1. Talk freely and give direct, accurate answers to whatever the user asks.
2. You MUST keep your responses extremely concise. Use small sentences.
3. Your ENTIRE response MUST be 2-3 sentences MAXIMUM. This is a strict token-saving limit. Do NOT generate long explanations.
${contextText}
At the very end of your reply, ALWAYS include a topic tag wrapped in square brackets, e.g.: [Topic: AVL Tree Rotations]`;

  // If Gemini API Key is configured, use real Gemini LLM
  let aiClient = getAiClient();
  if (aiClient) {
    let retries = Math.max(3, GEMINI_API_KEYS.length);
    let delay = 1000;
    while (retries > 0) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.6-flash',
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
        if (apiErr.message.includes('503') || apiErr.status === 503 || apiErr.message.includes('UNAVAILABLE')) {
          console.warn(`Gemini API 503 error, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(r => setTimeout(r, delay));
          retries--;
          delay *= 2;
        } else if (apiErr.message.includes('429') || apiErr.status === 429 || apiErr.message.includes('RESOURCE_EXHAUSTED')) {
          console.warn('Gemini API Rate Limit Exceeded (429). Rotating key and retrying...');
          aiClient = getAiClient(); // Try next key
          if (retries === 1 && GEMINI_API_KEYS.length === 1) {
             return {
                reply: "I'm receiving too many requests right now and hit a rate limit. Please wait about a minute and try asking again!",
                topic: "System Limits",
                citations: [],
                is_hint: false,
             };
          }
          await new Promise(r => setTimeout(r, delay));
          retries--;
          if (GEMINI_API_KEYS.length === 1) delay *= 2;
        } else if (apiErr.status === 401 || apiErr.status === 403 || apiErr.status === 400 || apiErr.message.includes('UNAUTHENTICATED') || apiErr.message.includes('invalid authentication credentials')) {
          console.warn(`Gemini API Auth Error (${apiErr.status}). The current key might be invalid. Rotating key and retrying...`);
          aiClient = getAiClient(); // Try next key
          if (retries === 1 && GEMINI_API_KEYS.length === 1) {
             console.error('Gemini API call failed with auth error, falling back to heuristics:', apiErr.message);
             break;
          }
          await new Promise(r => setTimeout(r, delay));
          retries--;
        } else {
          console.error('Gemini API call failed, falling back to intelligent Socratic heuristics:', apiErr.message);
          break; // break loop and fall back
        }
      }
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
  let aiClient = getAiClient();
  if (aiClient) {
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

    let retries = Math.max(3, GEMINI_API_KEYS.length);
    let delay = 1000;
    while (retries > 0) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        break; // success or invalid format, stop retrying
      } catch (apiErr) {
        if (apiErr.message.includes('503') || apiErr.status === 503 || apiErr.message.includes('UNAVAILABLE')) {
          console.warn(`Gemini API 503 error in quiz, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(r => setTimeout(r, delay));
          retries--;
          delay *= 2;
        } else if (apiErr.message.includes('429') || apiErr.status === 429 || apiErr.message.includes('RESOURCE_EXHAUSTED')) {
          console.warn('Gemini API Rate Limit Exceeded (429) in quiz. Rotating key and retrying...');
          aiClient = getAiClient();
          if (retries === 1 && GEMINI_API_KEYS.length === 1) {
             break; // Let it fall back to curated questions so the UI doesn't break
          }
          await new Promise(r => setTimeout(r, delay));
          retries--;
          if (GEMINI_API_KEYS.length === 1) {
             delay *= 2;
          }
        } else if (apiErr.status === 401 || apiErr.status === 403 || apiErr.status === 400 || apiErr.message.includes('UNAUTHENTICATED') || apiErr.message.includes('invalid authentication credentials')) {
          console.warn(`Gemini API Auth Error (${apiErr.status}) in quiz. The current key might be invalid. Rotating key and retrying...`);
          aiClient = getAiClient();
          if (retries === 1 && GEMINI_API_KEYS.length === 1) {
             break;
          }
          await new Promise(r => setTimeout(r, delay));
          retries--;
        } else {
          console.warn('Quiz generation with Gemini failed, using curated question bank:', apiErr.message);
          break;
        }
      }
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
