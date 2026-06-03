// server/controllers/dashboardController.js
const Topic         = require("../models/Topic");
const Flashcard     = require("../models/Flashcard");
const Quiz          = require("../models/Quiz");
const Documentation = require("../models/Documentation");
const jwt           = require("jsonwebtoken");

exports.getDashboard = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token   = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId        = decoded.id;
      } catch {}
    }

    if (!userId) {
      return res.json({
        success: true,
        streak: 0, topicsCompleted: 0, flashcardsReviewed: 0,
        quizAccuracy: 0, totalDocs: 0, totalQuizzes: 0,
        recommendedTopics: [], recentNotes: [], continueLearning: null,
        weeklyActivity: [], dailyProgress: [],
      });
    }

    const filter = { userId };

    const [topics, flashcards, quizzes, docs] = await Promise.all([
      Topic.find(filter).sort({ createdAt: -1 }),
      Flashcard.find(filter).sort({ createdAt: -1 }),
      Quiz.find(filter).sort({ createdAt: -1 }),
      Documentation.find(filter).sort({ createdAt: -1 }),
    ]);

    // ✅ Real quiz accuracy from scores
    let quizAccuracy = 0;
    if (quizzes.length > 0) {
      const scores = quizzes
        .filter(q => q.score !== undefined && q.total !== undefined && q.total > 0)
        .map(q => Math.round((q.score / q.total) * 100));
      quizAccuracy = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    }

    // ✅ Weekly activity — count of items created per day for last 7 days
    const now   = new Date();
    const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);

      const count =
        topics.filter(x => new Date(x.createdAt) >= d && new Date(x.createdAt) < next).length +
        docs.filter(x => new Date(x.createdAt) >= d && new Date(x.createdAt) < next).length +
        flashcards.filter(x => new Date(x.createdAt) >= d && new Date(x.createdAt) < next).length +
        quizzes.filter(x => new Date(x.createdAt) >= d && new Date(x.createdAt) < next).length;

      return { day: days[d.getDay()], count, date: d.toDateString() };
    });

    // ✅ Daily progress — cumulative % of total items created up to each day
    const totalItems = topics.length + docs.length + flashcards.length + quizzes.length;
    let cumulative = 0;
    const dailyProgress = weeklyActivity.map(w => {
      cumulative += w.count;
      const progress = totalItems > 0 ? Math.round((cumulative / totalItems) * 100) : 0;
      return { day: w.day, progress: Math.min(progress, 100) };
    });

    res.json({
      success:            true,
      streak:             0,
      topicsCompleted:    topics.length,
      flashcardsReviewed: flashcards.length,
      quizAccuracy,
      totalDocs:          docs.length,
      totalQuizzes:       quizzes.length,
      recommendedTopics:  topics.slice(0, 5).map(t => t.title),
      recentNotes:        docs.slice(0, 4).map(d => d.title || d.topic || "Untitled"),
      continueLearning:   topics.length > 0
        ? { topic: topics[0].title, cardsLeft: flashcards.length }
        : null,
      weeklyActivity,
      dailyProgress,
    });

  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};