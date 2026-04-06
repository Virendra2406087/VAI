const { generateAIResponse } = require("./aiService");

const generateFlashcards = async (topic) => {

  const prompt = `
  Create 5 flashcards for studying ${topic}.
  Format:
  Question:
  Answer:
  `;

  const result = await generateAIResponse(prompt);

  return result;
};

module.exports = { generateFlashcards };