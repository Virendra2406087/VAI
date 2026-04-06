const { generateAIResponse } = require("./aiService");

const generateQuiz = async (topic) => {

  const prompt = `
  Generate 5 multiple choice quiz questions about ${topic}.
  
  Format:
  Question
  A)
  B)
  C)
  D)
  Correct Answer:
  `;

  const quiz = await generateAIResponse(prompt);

  return quiz;
};

module.exports = { generateQuiz };