// server/routes/quizRoutes.js
const express = require("express");
const router  = express.Router();
const {
  generateQuiz,
  getQuizzes,
  getQuizByTopic,
  deleteQuiz,
  submitQuizResult,
} = require("../Controllers/quizController");

// ⚠️ specific routes BEFORE /:id
router.post("/generate",       generateQuiz);
router.post("/submit",         submitQuizResult);
router.get("/topic/:topic",    getQuizByTopic);   // GET /api/quiz/topic/Binary+Search
router.get("/",                getQuizzes);
router.delete("/:id",          deleteQuiz);

module.exports = router;