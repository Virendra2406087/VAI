const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PYTHON_RAG_URL =
  process.env.PYTHON_RAG_URL ||
  "http://127.0.0.1:8000";

// ==========================================
// PROCESS DOCUMENT
// ==========================================

const processDocument = async ({
  documentId,
  filePath,
  userId,
}) => {
  const form = new FormData();
  form.append("documentId", documentId);
  form.append("userId", userId);
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    `${PYTHON_RAG_URL}/api/rag/process`,
    form,
    {
      headers: form.getHeaders(),
      timeout: 120000,
    }
  );

  return response.data;
};

// ==========================================
// CHAT WITH DOCUMENT (unchanged, no file involved)
// ==========================================

const askDocument = async ({
  documentId,
  question,
  userId,
}) => {
  const response = await axios.post(
    `${PYTHON_RAG_URL}/api/rag/chat`,
    {
      documentId,
      question,
      userId,
    },
    {
      timeout: 120000,
    }
  );

  return response.data;
};

module.exports = {
  processDocument,
  askDocument,
};