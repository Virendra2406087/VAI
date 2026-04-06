const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // 📁 folder auto created

const {
  generateDocumentation,
  getDocumentation,
} = require("../controllers/documentationController");

// 🔥 POST with file upload
router.post("/generate", upload.single("file"), generateDocumentation);

// GET docs
router.get("/", getDocumentation);

module.exports = router;