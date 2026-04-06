// server/config/aiConfig.js
const { GoogleGenAI } = require("@google/genai"); // ✅ NEW SDK (not @google/generative-ai)

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Generate content using new SDK
const generateWithGemini = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // ✅ current free tier model (March 2026)
    contents: prompt,
  });

  return response.text;
};

module.exports = { generateWithGemini };