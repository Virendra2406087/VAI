// server/controllers/tutorController.js
const { GoogleGenAI } = require("@google/genai");
const { saveEvent }   = require("./HistoryController");
const jwt             = require("jsonwebtoken");

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

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return token ? jwt.verify(token, process.env.JWT_SECRET).id : null;
  } catch { return null; }
};

exports.askTutor = async (req, res) => {
  try {
    const { question, attachments } = req.body;

    if (!question && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Question or attachment is required" });
    }

    const hasAttachments = attachments && attachments.length > 0;
    let answer = "";

    if (hasAttachments) {
      const parts = [];
      parts.push({ text: SYSTEM_PROMPT });

      for (const att of attachments) {
        if (att.isImage) {
          parts.push({ inlineData: { mimeType: att.type, data: att.base64 } });
        } else {
          try {
            const decoded = Buffer.from(att.base64, "base64").toString("utf-8");
            parts.push({ text: `\n--- Uploaded file: ${att.name} ---\n${decoded.slice(0, 4000)}\n--- End of file ---\n` });
          } catch (e) {
            parts.push({ text: `\n[Could not read file: ${att.name}]\n` });
          }
        }
      }

      parts.push({
        text: question
          ? `Student question: ${question}`
          : "Please analyze the uploaded content and provide a detailed explanation."
      });

      const response = await ai.models.generateContent({
        model:    "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
      });
      answer = response.text;
    } else {
      const response = await ai.models.generateContent({
        model:    "gemini-2.5-flash",
        contents: `${SYSTEM_PROMPT}\n\nStudent question: ${question}`,
      });
      answer = response.text;
    }

    // ── Save to history ──
    const userId = getUserId(req);
    if (userId && question) {
      const shortQ = question.length > 80 ? question.slice(0, 80) + "…" : question;
      await saveEvent({
        userId,
        type:   "tutor",
        title:  `AI Tutor: ${shortQ}`,
        detail: answer.slice(0, 400),
        meta:   { question: shortQ },
      });
    }

    res.json({ answer });

  } catch (error) {
    console.error("❌ Tutor Error:", error);
    if (error.status === 429) return res.status(429).json({ error: "AI quota exceeded. Try again later." });
    res.status(500).json({ error: error.message || "AI not working" });
  }
};

exports.getTutorHistory = (req, res) => {
  res.json({ message: "History working" });
};