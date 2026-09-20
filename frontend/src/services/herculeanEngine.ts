import type { Citation, Message, Document } from '../types';

interface HerculeanResponse {
  content: string;
  topic: string;
  isHint?: boolean;
  citations?: Citation[];
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function generateHerculeanResponse(
  userMessage: string,
  history: Message[] = [],
  activeDocuments: Document[] = []
): Promise<HerculeanResponse> {
  try {
    const contents: any[] = [];
    
    // Process history to ensure proper alternating structure (user -> model)
    for (const msg of history) {
        const role = msg.sender === 'user' ? 'user' : 'model';
        
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += '\n\n' + msg.content;
        } else {
            contents.push({
                role: role,
                parts: [{ text: msg.content }]
            });
        }
    }

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
    }

    // Attach document bytes directly to the latest user message so Gemini can read them!
    const activeDocsWithBytes = activeDocuments.filter(d => d.base64Data);
    if (activeDocsWithBytes.length > 0) {
        const lastUserTurn = contents[contents.length - 1];
        
        // Add a text prefix so it knows what the files are
        lastUserTurn.parts.unshift({
            text: 'I have attached some course documents for you to reference. Please read them and answer my question based on them if relevant.'
        });

        // Add the actual base64 inlineData for each document
        for (const doc of activeDocsWithBytes) {
            lastUserTurn.parts.push({
                inlineData: {
                    mimeType: doc.mimeType || 'application/pdf',
                    data: doc.base64Data
                }
            });
        }
    }

    const docTitles = activeDocuments.map(d => d.filename);
    const systemPrompt = `You are Hercules. Follow these exact instructions:
- Short when the question is simple.
- Detailed when the topic actually needs it.
- Talk naturally, not like a textbook.
- For coding → logic first, code second.
- For learning → let the user think first, give hints when appropriate.
- No unnecessary "Sure! Here's a comprehensive explanation" filler.
- If the user says you're wrong, accept it directly.
- Use examples when they actually help.
- Don't repeat things the user already knows.
- Keep the conversation flowing instead of turning every answer into an essay.
- **CRITICAL**: If the user provides attached documents (like PDFs), you MUST read them and use them to inform your answer. Give citations (e.g. "According to the syllabus...") if you pull information from them.

Currently active documents: ${docTitles.join(', ') || 'None'}.
At the end of your response, ALWAYS append a topic tag wrapped in brackets, e.g. [Topic: Graph Traversals].`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's break this down. What do you think is the first step?";

    let topic = 'Computer Science';
    const topicMatch = text.match(/\[Topic:\s*(.*?)\]/i);
    if (topicMatch) {
      topic = topicMatch[1].trim();
      text = text.replace(topicMatch[0], '').trim();
    }

    // Attempt to parse out citations if the AI mentions any documents
    const generatedCitations: Citation[] = [];
    if (activeDocsWithBytes.length > 0 && text.toLowerCase().includes('according to')) {
        generatedCitations.push({
            documentTitle: activeDocsWithBytes[0].filename,
            pageNumber: 1,
            snippet: 'Sourced directly from the attached document.',
        });
    }

    return {
      content: text,
      topic: topic,
      isHint: text.toLowerCase().includes('hint'),
      citations: generatedCitations.length > 0 ? generatedCitations : undefined
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      content: "I'm having trouble thinking clearly right now. Let's try breaking down your question again.",
      topic: "System Error"
    };
  }
}
