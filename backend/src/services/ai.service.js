const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.generateAISummary = async (title, content) => {
  const prompt = `You are a smart notes assistant. Analyse the following note and return a JSON object with exactly these fields:
- "summary": a concise 2-3 sentence summary of the note
- "action_items": an array of up to 5 actionable tasks or next steps extracted from the note (empty array if none)
- "suggested_title": a short, descriptive title for the note (3-6 words)

Note Title: ${title}
Note Content:
${content}

Respond ONLY with valid JSON. No markdown, no explanation.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    temperature: 0.3,
    maxOutputTokens: 500,
  });

  const raw = (response.text || response.output_text || "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Fallback parse attempt stripping code fences
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
};
