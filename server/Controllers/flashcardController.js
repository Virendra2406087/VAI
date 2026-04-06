// server/controllers/flashcardController.js
const Flashcard = require("../models/Flashcard");
const { generateWithGemini } = require("../config/aiConfig"); // ✅ new SDK

// ✅ CREATE
exports.createFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.create(req.body);
    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET
exports.getFlashcards = async (req, res) => {
  try {
    const { topicId } = req.query;
    const flashcards = await Flashcard.find(topicId ? { topicId } : {});
    res.json({ success: true, data: flashcards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE
exports.deleteFlashcard = async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔥 AI GENERATE
exports.generateFlashcards = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

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

    // ✅ use new generateWithGemini
    const text = await generateWithGemini(prompt);

    let cards = [];

    try {
      // ✅ strip any leftover markdown fences just in case
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      cards = JSON.parse(cleanText);

      if (!Array.isArray(cards)) {
        throw new Error("Response is not an array");
      }

    } catch (err) {
      console.error("❌ JSON parse error:", err);
      console.error("Raw AI text:", text);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON. Try again.",
      });
    }

    // ✅ Save to MongoDB
    const saved = await Flashcard.insertMany(
      cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || "medium",
      }))
    );

    res.json({
      success: true,
      data: saved, // ✅ return saved docs with _id
    });

  } catch (error) {
    console.error("❌ ERROR:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI quota exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};