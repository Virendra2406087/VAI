const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  chatWithDocument,
  getChatHistory,
} = require("../Controllers/documentChatController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// MULTER
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "../uploads")
    );
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ".pdf";

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF files are allowed")
      );
    }
  },
});

// ==========================================
// ROUTES
// ==========================================

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/documents",
  protect,
  getDocuments
);

router.delete(
  "/documents/:id",
  protect,
  deleteDocument
);

router.post(
  "/chat",
  protect,
  chatWithDocument
);

router.get(
  "/history/:documentId",
  protect,
  getChatHistory
);

module.exports = router;