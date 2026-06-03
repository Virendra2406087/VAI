// server/routes/documentationRoutes.js
const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const {
  generateDocumentation,
  getDocumentation,
  getDocumentationById,
  getDocumentationByTopic,
} = require("../controllers/documentationController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ⚠️ specific routes BEFORE /:id
router.get("/topic/:topic", getDocumentationByTopic);  // GET /api/docs/topic/Binary+Search
router.get("/:id",          getDocumentationById);     // GET /api/docs/64abc123...
router.get("/",             getDocumentation);         // GET /api/docs
router.post("/generate",    upload.single("file"), generateDocumentation);

module.exports = router;