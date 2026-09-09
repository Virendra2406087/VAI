const { GoogleGenAI } = require("@google/genai");
const { saveEvent }   = require("./HistoryController");
const HistoryEvent    = require("../models/HistoryEvent");
const jwt             = require("jsonwebtoken");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Model fallback chain: try each in order until one works ──
// gemini-1.5-flash / gemini-1.5-pro were fully retired and now 404 —
// they can't serve as fallbacks anymore. gemini-2.5-flash-lite is a
// cheaper/faster sibling that's often available when 2.5-flash is
// overloaded; gemini-2.5-pro is the highest-quality last resort.
// All three are GA-stable (scheduled shutdown is Oct 16, 2026, not yet).
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

const generateWithFallback = async (params) => {
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ ...params, model });
      return response;
    } catch (err) {
      // 503 = overloaded, 429 = quota — try next model
      if (err.status === 503 || err.status === 429) {
        console.warn(`⚠️ Model ${model} unavailable (${err.status}), trying next...`);
        lastError = err;
        await new Promise(r => setTimeout(r, 1500)); // wait 1.5s before retry
        continue;
      }
      throw err; // other errors — don't retry
    }
  }
  throw lastError; // all models failed
};

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

      const response = await generateWithFallback({
        contents: [{ role: "user", parts }],
      });
      answer = response.text;

    } else {
      const response = await generateWithFallback({
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
        // Store the FULL question/answer in meta so a real conversation
        // view can be rebuilt later — title/detail above stay short
        // because they're also used by the generic activity feed.
        meta:   { question, answer },
      });
    }

    res.json({ answer });

  } catch (error) {
    console.error("❌ Tutor Error:", error);
    if (error.status === 429) return res.status(429).json({ error: "AI quota exceeded. Try again later." });
    if (error.status === 503) return res.status(503).json({ error: "AI is overloaded right now. Please try again in a moment." });
    res.status(500).json({ error: error.message || "AI not working" });
  }
};

// ── Return this user's past tutor Q&A, oldest first, ready to
//    render straight into a chat thread if you ever want one. ──
exports.getTutorHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    const events = await HistoryEvent.find({ userId, type: "tutor" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Oldest first, so it reads top-to-bottom like a real conversation.
    const conversation = events
      .reverse()
      .map(ev => ({
        id:       ev._id,
        question: ev.meta?.question ?? ev.title?.replace(/^AI Tutor: /, "") ?? "",
        answer:   ev.meta?.answer   ?? ev.detail ?? "",
        time:     ev.createdAt,
      }));

    res.json({ success: true, data: conversation, total: conversation.length });
  } catch (error) {
    console.error("❌ Tutor history error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};