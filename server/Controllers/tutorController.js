// server/controllers/tutorController.js
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are VAI, an expert AI tutor for programming, DSA, physics, mathematics, and computer science.

FORMATTING RULES:
1. MATH FORMULAS: Use LaTeX — block: $$ formula $$ — inline: $formula$
2. DIAGRAMS: NEVER use ASCII art. Generate clean SVG in \`\`\`svg blocks with dark theme colors (#1e293b bg, #94a3b8 lines, #f1f5f9 text, #a855f7 accent), width="500"
3. CODE: Fenced code blocks with language tag
4. THEORY: Proper markdown — ##, **bold**, bullets, tables

If an image is provided, analyze it thoroughly and answer the question about it.
If a file is provided, use its content to inform your answer.
Always produce visual, readable, book-quality output.`;

exports.askTutor = async (req, res) => {
  try {
    const { question, attachments } = req.body;

    if (!question && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Question or attachment is required" });
    }

    const hasAttachments = attachments && attachments.length > 0;

    if (hasAttachments) {
      // ✅ Correct format for @google/genai SDK multimodal
      const parts = [];

      // System instruction first
      parts.push({ text: SYSTEM_PROMPT });

      // Add each attachment as correct part type
      for (const att of attachments) {
        if (att.isImage) {
          // ✅ Image part — correct SDK format
          parts.push({
            inlineData: {
              mimeType: att.type,
              data:     att.base64,   // raw base64 string (no data: prefix)
            }
          });
        } else {
          // ✅ Text file — decode base64 to text and inject
          try {
            const decoded = Buffer.from(att.base64, "base64").toString("utf-8");
            parts.push({
              text: `\n--- Uploaded file: ${att.name} ---\n${decoded.slice(0, 4000)}\n--- End of file ---\n`
            });
          } catch (e) {
            parts.push({ text: `\n[Could not read file: ${att.name}]\n` });
          }
        }
      }

      // User question
      parts.push({
        text: question
          ? `Student question: ${question}`
          : "Please analyze the uploaded content and provide a detailed explanation."
      });

      // ✅ Correct API call for new SDK with parts array
      const response = await ai.models.generateContent({
        model:    "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
      });

      return res.json({ answer: response.text });
    }

    // ✅ Text only
    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash",
      contents: `${SYSTEM_PROMPT}\n\nStudent question: ${question}`,
    });

    res.json({ answer: response.text });

  } catch (error) {
    console.error("❌ Tutor Error:", error);
    if (error.status === 429) return res.status(429).json({ error: "AI quota exceeded. Try again later." });
    res.status(500).json({ error: error.message || "AI not working" });
  }
};

exports.getTutorHistory = (req, res) => {
  res.json({ message: "History working" });
};