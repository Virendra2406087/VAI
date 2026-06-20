// server/routes/flashcardRoutes.js
const express = require("express");
const router  = express.Router();
const {
  createFlashcard,
  getFlashcards,
  getFlashcardsByTopic,
  deleteFlashcard,
  generateFlashcards,
} = require("../Controllers/flashcardController");

// ⚠️ specific routes BEFORE /:id
router.post("/generate",       generateFlashcards);
router.get("/topic/:topic",    getFlashcardsByTopic); // GET /api/flashcards/topic/Binary+Search
router.post("/",               createFlashcard);
router.get("/",                getFlashcards);
router.delete("/:id",          deleteFlashcard);

module.exports = router;