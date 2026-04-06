// server/routes/quizRoutes.js
const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");

// ✅ AI generate route FIRST (before /:id)
router.post("/generate", quizController.generateQuiz);
router.get("/", quizController.getQuizzes);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;