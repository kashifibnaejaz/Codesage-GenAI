const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = "AIzaSyC5hWJ8lkWlr_97OxKI3KmBpjspOwYkWBs";
  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig = {
    temperature: 0.2,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: generationConfig
  });
  
    export const chatSession = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
      ],
    });
    