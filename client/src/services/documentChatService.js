import axios from "axios";
import { API_BASE_URL } from "../config"; // adjust path to wherever config.js actually lives
const API_URL = `${API_BASE_URL}/api`;

const getAuthConfig = () => {
  const token =
    localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// Upload PDF
export const uploadDocument = async (
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await axios.post(
      `${API_URL}/document-chat/upload`,
      formData,
      {
        ...getAuthConfig(),

        headers: {
          ...getAuthConfig().headers,

          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};


// Get documents
export const getDocuments = async () => {
  const response =
    await axios.get(
      `${API_URL}/document-chat/documents`,
      getAuthConfig()
    );

  return response.data;
};


// Delete document
export const deleteDocument = async (
  documentId
) => {
  const response =
    await axios.delete(
      `${API_URL}/document-chat/documents/${documentId}`,
      getAuthConfig()
    );

  return response.data;
};


// Chat
export const sendMessage = async (
  documentId,
  question
) => {
  const response =
    await axios.post(
      `${API_URL}/document-chat/chat`,
      {
        documentId,
        question,
      },
      getAuthConfig()
    );

  return response.data;
};


// Chat history
export const getChatHistory = async (
  documentId
) => {
  const response =
    await axios.get(
      `${API_URL}/document-chat/history/${documentId}`,
      getAuthConfig()
    );

  return response.data;
};