const axios = require("axios");

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
  const response = await axios.post(
    `${PYTHON_RAG_URL}/api/rag/process`,
    {
      documentId,
      filePath,
      userId,
    },
    {
      timeout: 120000,
    }
  );

  return response.data;
};


// ==========================================
// CHAT WITH DOCUMENT
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