const express = require("express");
const router  = express.Router();
const {
  createFlashcard,
  getFlashcards,
  getFlashcardsByTopic,
  deleteFlashcard,
  generateFlashcards,
} = require("../Controllers/flashcardController");
const { protect } = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimit");

router.post("/generate",       protect, aiRateLimiter, generateFlashcards);
router.get("/topic/:topic",    getFlashcardsByTopic);
router.post("/",               createFlashcard);
router.get("/",                getFlashcards);
router.delete("/:id",          deleteFlashcard);

module.exports = router;