const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API key from environment, or use a mock logic if not present
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  if (!genAI) {
    console.warn("No GEMINI_API_KEY found, using mock AI response.");
    return {
      description: "Looks like assorted baked goods and bread.",
      freshnessScore: 85,
      isEdible: true
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Analyze this image of surplus food. Describe what items are visible and estimate their freshness. Return a JSON object with strictly these keys: description (string), freshnessScore (number from 0-100), and isEdible (boolean).";
    
    const imageParts = [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    // Simple parsing to extract JSON if it is wrapped in markdown blocks
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze food image.");
  }
};

const chatWithBot = async (message, history = []) => {
  if (!genAI) {
    return "This is a mock AI response. Please configure GEMINI_API_KEY to use the real Chatbot.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      generationConfig: {
        maxOutputTokens: 150,
      },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Chatbot Error:", error);
    throw new Error("Failed to generate response.");
  }
};

module.exports = {
  analyzeFoodImage,
  chatWithBot
};
