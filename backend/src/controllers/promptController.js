import { db } from '../db/database.js';

export async function getPromptConfig(req, res) {
  try {
    const config = db.getPromptConfig();
    return res.json(config);
  } catch (err) {
    return res.status(500).json({ error: 'Server error retrieving prompt config' });
  }
}

export async function savePromptConfig(req, res) {
  try {
    const { systemPrompt, hintThreshold, strictness } = req.body;
    const updated = db.savePromptConfig({
      systemPrompt,
      hintThreshold: Number(hintThreshold) || 3,
      strictness: strictness || 'High',
    });
    return res.json({ success: true, config: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating prompt config' });
  }
}
