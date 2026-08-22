const path = require("path");
const fs = require("fs");

const Document = require("../models/Document");
const ChatMessage = require("../models/ChatMessage");

const {
  processDocument,
  askDocument,
} = require("../services/ragService");


// ==========================================
// UPLOAD DOCUMENT
// ==========================================

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    if (
      req.file.mimetype !==
      "application/pdf"
    ) {
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }

    const document = await Document.create({
      userId: req.user.id,

      fileName: req.file.filename,

      originalName: req.file.originalname,

      filePath: req.file.path,

      mimeType: req.file.mimetype,

      fileSize: req.file.size,

      status: "processing",
    });

    // Start RAG processing
    processDocument({
      documentId: document._id.toString(),

      filePath: req.file.path,

      userId: req.user.id.toString(),
    })
      .then(async (result) => {
        await Document.findByIdAndUpdate(
          document._id,
          {
            status: "ready",

            totalPages:
              result.totalPages || 0,

            totalChunks:
              result.totalChunks || 0,
          }
        );
      })
      .catch(async (error) => {
        console.error(
          "RAG processing error:",
          error.message
        );

        await Document.findByIdAndUpdate(
          document._id,
          {
            status: "error",

            errorMessage:
              error.message,
          }
        );
      });

    res.status(201).json({
      _id: document._id,

      fileName: document.originalName,

      status: document.status,

      fileSize: document.fileSize,

      totalChunks: 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to upload document",
    });
  }
};


// ==========================================
// GET DOCUMENTS
// ==========================================

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-filePath -__v");

    const formatted = documents.map((doc) => ({
      _id: doc._id,
      fileName: doc.originalName,   //  always send the real name as fileName
      status: doc.status,
      fileSize: doc.fileSize,
      totalPages: doc.totalPages,
      totalChunks: doc.totalChunks,
      createdAt: doc.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};


// ==========================================
// DELETE DOCUMENT
// ==========================================

const deleteDocument = async (req, res) => {
  try {
    const document =
      await Document.findOne({
        _id: req.params.id,

        userId: req.user.id,
      });

    if (!document) {
      return res.status(404).json({
        message:
          "Document not found",
      });
    }

    // Delete physical PDF
    if (
      document.filePath &&
      fs.existsSync(document.filePath)
    ) {
      fs.unlinkSync(
        document.filePath
      );
    }

    // Delete chat history
    await ChatMessage.deleteMany({
      documentId: document._id,

      userId: req.user.id,
    });

    // Delete document
    await Document.findByIdAndDelete(
      document._id
    );

    res.json({
      message:
        "Document deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete document",
    });
  }
};


// ==========================================
// CHAT WITH DOCUMENT
// ==========================================

const chatWithDocument = async (
  req,
  res
) => {
  try {
    const {
      documentId,
      question,
    } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        message:
          "documentId and question are required",
      });
    }

    const document =
      await Document.findOne({
        _id: documentId,

        userId: req.user.id,
      });

    if (!document) {
      return res.status(404).json({
        message:
          "Document not found",
      });
    }

    if (
      document.status !== "ready"
    ) {
      return res.status(400).json({
        message:
          "Document is still processing",
      });
    }

    // Save user question
    await ChatMessage.create({
      userId: req.user.id,

      documentId,

      role: "user",

      content: question,
    });

    // Ask Python RAG
    const result =
      await askDocument({
        documentId:
          documentId.toString(),

        question,

        userId:
          req.user.id.toString(),
      });

    // Save AI response
    await ChatMessage.create({
      userId: req.user.id,

      documentId,

      role: "assistant",

      content: result.answer,

      sources:
        result.sources || [],
    });

    res.json({
      answer: result.answer,

      sources:
        result.sources || [],
    });
  } catch (error) {
    console.error(
      "Chat error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to process question",
    });
  }
};


// ==========================================
// CHAT HISTORY
// ==========================================

const getChatHistory = async (
  req,
  res
) => {
  try {
    const messages =
      await ChatMessage.find({
        userId: req.user.id,

        documentId:
          req.params.documentId,
      })
        .sort({
          createdAt: 1,
        })
        .select("-__v");

    res.json(messages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch chat history",
    });
  }
};


module.exports = {
  uploadDocument,

  getDocuments,

  deleteDocument,

  chatWithDocument,

  getChatHistory,
};