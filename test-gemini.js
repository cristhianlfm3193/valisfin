require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI, Type } = require('@google/genai');

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hola' }] }],
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e.message, e.stack);
  }
}
main();
