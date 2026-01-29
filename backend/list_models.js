import { genAI } from "./src/config/ai.js";

async function listModels() {
  try {
    // There isn't a direct listModels in the SDK easily accessible without additional config sometimes
    // but we can try to use the fetch API to call the endpoint
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
