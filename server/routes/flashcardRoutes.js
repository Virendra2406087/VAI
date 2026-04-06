// server/routes/flashcardRoutes.js
const express = require("express");
const router = express.Router();

const {
  createFlashcard,
  getFlashcards,
  deleteFlashcard,
  generateFlashcards,
} = require("../controllers/flashcardController");

// ✅ AI route MUST be before "/:id" routes to avoid conflict
router.post("/generate", generateFlashcards);

// CRUD
router.post("/", createFlashcard);
router.get("/", getFlashcards);
router.delete("/:id", deleteFlashcard);

module.exports = router;