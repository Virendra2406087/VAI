const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Fallback model chain ──
const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];

const generateContent = async (prompt) => {
  let lastError;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 503 || status === 429) {
        console.warn(`⚠️ Model ${modelName} unavailable (${status}), trying next...`);
        lastError = err;
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      throw err; // other errors — don't retry
    }
  }

  throw lastError;
};

module.exports = generateContent;