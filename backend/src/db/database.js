import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultSchema = {
  departments: [],
  courses: [],
  users: [],
  documents: [],
  document_chunks: [],
  student_queries: [],
  prompt_configs: {
    systemPrompt: `You are a Herculean tutor for a university course.
Never give direct answers.
Always reply with 1–2 guiding questions that help the student discover the concept themselves.
Keep replies short and encouraging.
If the student is stuck after 2–3 exchanges, give a small hint.`,
    hintThreshold: 3,
    strictness: 'High',
  },
  quizzes: []
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, using defaults:', e.message);
    }
    this.save(defaultSchema);
    return JSON.parse(JSON.stringify(defaultSchema));
  }

  save(data = this.data) {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Error persisting database:', e.message);
    }
  }

  // Generic helpers
  getTable(tableName) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
      this.save();
    }
    return this.data[tableName];
  }

  find(tableName, predicate) {
    const table = this.getTable(tableName);
    return table.filter(predicate);
  }

  findOne(tableName, predicate) {
    const table = this.getTable(tableName);
    return table.find(predicate) || null;
  }

  insert(tableName, record) {
    const table = this.getTable(tableName);
    table.push(record);
    this.save();
    return record;
  }

  update(tableName, predicate, updates) {
    const table = this.getTable(tableName);
    const index = table.findIndex(predicate);
    if (index !== -1) {
      table[index] = { ...table[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return table[index];
    }
    return null;
  }

  delete(tableName, predicate) {
    const table = this.getTable(tableName);
    const initialLen = table.length;
    this.data[tableName] = table.filter((item) => !predicate(item));
    this.save();
    return initialLen !== this.data[tableName].length;
  }

  getPromptConfig() {
    return this.data.prompt_configs || defaultSchema.prompt_configs;
  }

  savePromptConfig(config) {
    this.data.prompt_configs = {
      ...this.getPromptConfig(),
      ...config,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.prompt_configs;
  }
}

export const db = new Database();
