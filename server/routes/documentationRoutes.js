const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const {
  generateDocumentation,
  getDocumentation,
  getDocumentationById,
  getDocumentationByTopic,
} = require("../Controllers/documentationController");
const { protect } = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimit");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/topic/:topic", getDocumentationByTopic);
router.get("/:id",          getDocumentationById);
router.get("/",             getDocumentation);
router.post(
  "/generate",
  protect,
  aiRateLimiter,
  upload.single("file"),
  generateDocumentation
);

module.exports = router;