const express = require("express");
const router  = express.Router();
const {
  generateQuiz,
  getQuizzes,
  getQuizByTopic,
  deleteQuiz,
  submitQuizResult,
} = require("../Controllers/quizController");
const { protect } = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimit");

router.post("/generate",       protect, aiRateLimiter, generateQuiz);
router.post("/submit",         submitQuizResult);
router.get("/topic/:topic",    getQuizByTopic);
router.get("/",                getQuizzes);
router.delete("/:id",          deleteQuiz);

module.exports = router;