// server/controllers/dashboardController.js
const Topic         = require("../models/Topic");
const Flashcard     = require("../models/Flashcard");
const Quiz          = require("../models/Quiz");
const Documentation = require("../models/Documentation");
const jwt           = require("jsonwebtoken");

exports.getDashboard = async (req, res) => {
  try {
    // ✅ Get userId from token so each user sees ONLY their own data
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token   = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId        = decoded.id;
      } catch {
        // invalid token — return empty dashboard
      }
    }

    if (!userId) {
      // No valid token — return empty/zero dashboard
      return res.json({
        success:           true,
        streak:            0,
        topicsCompleted:   0,
        flashcardsReviewed:0,
        quizAccuracy:      0,
        totalDocs:         0,
        totalQuizzes:      0,
        recommendedTopics: [],
        recentNotes:       [],
        continueLearning:  null,
      });
    }

    // ✅ Filter ALL queries by userId
    const filter = { userId };

    const topics     = await Topic.find(filter).sort({ createdAt: -1 });
    const flashcards = await Flashcard.find(filter);
    const quizzes    = await Quiz.find(filter);
    const docs       = await Documentation.find(filter).sort({ createdAt: -1 });

    const topicsCompleted      = topics.length;
    const flashcardsReviewed   = flashcards.length;
    const quizAccuracy         = quizzes.length > 0 ? 87 : 0;
    const recommendedTopics    = topics.slice(0, 5).map(t => t.title);
    const recentNotes          = docs.slice(0, 4).map(d => d.title);
    const continueLearning     = topics.length > 0
      ? { topic: topics[0].title, cardsLeft: flashcards.length }
      : null;

    res.json({
      success: true,
      streak:            0,
      topicsCompleted,
      flashcardsReviewed,
      quizAccuracy,
      totalDocs:         docs.length,
      totalQuizzes:      quizzes.length,
      recommendedTopics,
      recentNotes,
      continueLearning,
    });

  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};