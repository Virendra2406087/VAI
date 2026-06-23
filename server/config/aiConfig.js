const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithGemini = async (prompt, retries = 3) => {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🤖 Trying model: ${model} (attempt ${attempt})`);

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        console.log(`✅ Success with model: ${model}`);
        return response.text;

      } catch (error) {
        lastError = error;
        const status = error.status || error.code;
        if (status === 503 || status === 429 || error.message?.includes("UNAVAILABLE") || error.message?.includes("overloaded")) {
          const delay = attempt * 2000; // 2s, 4s, 6s
          console.warn(`⚠️  Model ${model} unavailable (attempt ${attempt}/${retries}). Retrying in ${delay/1000}s...`);
          await wait(delay);
          continue;
        }
        if (status === 400) {
          console.warn(`⚠️  Model ${model} bad request. Trying next model...`);
          break;
        }
        if (status === 401) {
          throw new Error("Invalid Gemini API key. Check your .env file.");
        }
        console.warn(`⚠️  Model ${model} failed: ${error.message}. Trying next model...`);
        break;
      }
    }
  }

  const status = lastError?.status || lastError?.code;
  if (status === 503) throw { status: 503, message: "Gemini is overloaded right now. Please try again in a minute." };
  if (status === 429) throw { status: 429, message: "AI quota exceeded. Please try again later." };
  throw lastError || new Error("All AI models failed.");
};

module.exports = { generateWithGemini };