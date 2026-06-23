const Quiz         = require("../models/Quiz");
const { generateWithGemini } = require("../config/aiConfig");
const { saveEvent } = require("./HistoryController");
const jwt           = require("jsonwebtoken");

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return token ? jwt.verify(token, process.env.JWT_SECRET).id : null;
  } catch { return null; }
};

exports.generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

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
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      questions = JSON.parse(cleanText);
      if (!Array.isArray(questions)) throw new Error("Not an array");
    } catch {
      return res.status(500).json({ success: false, message: "AI returned invalid JSON. Try again." });
    }

    const userId = getUserId(req);
    const saved = await Quiz.insertMany(
      questions.map((q) => ({
        question:      q.question,
        options:       q.options,
        correctAnswer: q.correctAnswer,
        explanation:   q.explanation || "",
        topic,
        userId: userId || null,
      }))
    );

    if (userId) {
      await saveEvent({
        userId,
        type:       "quiz",
        title:      `Quiz: ${topic}`,
        detail:     `Generated ${saved.length} questions on "${topic}"`,
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

exports.getQuizzes = async (req, res) => {
  try {
    const { topicId } = req.query;
    const quizzes = await Quiz.find(topicId ? { topicId } : {});
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizByTopic = async (req, res) => {
  try {
    const topic = decodeURIComponent(req.params.topic);
    const quizzes = await Quiz.find(
      { topic: { $regex: topic, $options: "i" } }
    ).sort({ createdAt: -1 }).limit(20);
    if (!quizzes.length) return res.status(404).json({ success: false, message: "No quizzes found for this topic" });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitQuizResult = async (req, res) => {
  try {
    const { topic, score, total } = req.body;
    const userId = getUserId(req);

    if (userId && score !== undefined && total !== undefined) {
      await Quiz.updateMany(
        { topic: { $regex: topic, $options: "i" }, userId },
        { $set: { score, total } }
      );
    }

    if (userId) {
      await saveEvent({
        userId,
        type:   "quiz",
        title:  `Quiz Result: ${topic}`,
        detail: `Scored ${score}/${total} on "${topic}"`,
        meta:   { topic, score, total },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};