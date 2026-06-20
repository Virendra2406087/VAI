// server/controllers/flashcardController.js
const Flashcard  = require("../models/Flashcard");
const { generateWithGemini } = require("../config/aiConfig");
const { saveEvent } = require("./HistoryController");
const jwt         = require("jsonwebtoken");

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return token ? jwt.verify(token, process.env.JWT_SECRET).id : null;
  } catch { return null; }
};

exports.createFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.create(req.body);
    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    const { topicId } = req.query;
    const flashcards = await Flashcard.find(topicId ? { topicId } : {});
    res.json({ success: true, data: flashcards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlashcardsByTopic = async (req, res) => {
  try {
    const topic = decodeURIComponent(req.params.topic);
    const cards = await Flashcard.find(
      { topic: { $regex: topic, $options: "i" } }
    ).sort({ createdAt: -1 }).limit(50);
    if (!cards.length) return res.status(404).json({ success: false, message: "No flashcards found for this topic" });
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFlashcard = async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateFlashcards = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

    const prompt = `
Generate 5 flashcards for topic: ${topic}
Return ONLY a valid JSON array with no extra text, no markdown, no code fences:
[
  {
    "question": "string",
    "answer": "string",
    "difficulty": "easy"
  }
]
`;

    const text = await generateWithGemini(prompt);
    let cards = [];
    try {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      cards = JSON.parse(cleanText);
      if (!Array.isArray(cards)) throw new Error("Not an array");
    } catch {
      return res.status(500).json({ success: false, message: "AI returned invalid JSON. Try again." });
    }

    // ✅ Save userId with every flashcard
    const userId = getUserId(req);
    const saved = await Flashcard.insertMany(
      cards.map((c) => ({
        question:   c.question,
        answer:     c.answer,
        difficulty: c.difficulty || "medium",
        topic,
        userId: userId || null, // ✅ attach userId
      }))
    );

    if (userId) {
      await saveEvent({
        userId,
        type:       "flashcard",
        title:      `Flashcards: ${topic}`,
        detail:     `Generated ${saved.length} flashcards on "${topic}"`,
        resourceId: saved[0]?._id?.toString() || "",
        meta:       { topic, count: saved.length },
      });
    }

    res.json({ success: true, data: saved });
  } catch (error) {
    if (error.status === 429) return res.status(429).json({ success: false, message: "AI quota exceeded." });
    res.status(500).json({ success: false, message: error.message });
  }
};