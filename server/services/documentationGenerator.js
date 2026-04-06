const { generateAIResponse } = require("./aiService");

const generateDocumentation = async (topic) => {

  const prompt = `
  Write structured study notes for ${topic}.
  
  Include:
  - Explanation
  - Key Points
  - Examples
  `;

  const docs = await generateAIResponse(prompt);

  return docs;
};

module.exports = { generateDocumentation };