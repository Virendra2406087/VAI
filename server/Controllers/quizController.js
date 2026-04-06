// server/controllers/quizController.js
const Quiz = require("../models/Quiz");
const { generateWithGemini } = require("../config/aiConfig"); // ✅ new SDK

// ✅ AI GENERATE QUIZ
exports.generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const prompt = `
Generate 5 multiple choice quiz questions about: ${topic}

Return ONLY a valid JSON array with no extra text, no markdown, no code fences:
[
  {
    "question": "string",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": "option A",
    "explanation": "short explanation why this is correct"
  }
]

Rules:
- options array must have exactly 4 items
- correctAnswer must exactly match one of the options
- keep questions clear and concise
`;

    const text = await generateWithGemini(prompt);

    let questions = [];

    try {
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      questions = JSON.parse(cleanText);

      if (!Array.isArray(questions)) {
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
    const saved = await Quiz.insertMany(
      questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      }))
    );

    res.json({
      success: true,
      data: saved,
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

// ✅ GET ALL QUIZZES
exports.getQuizzes = async (req, res) => {
  try {
    const { topicId } = req.query;
    const quizzes = await Quiz.find(topicId ? { topicId } : {});
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE QUIZ
exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};