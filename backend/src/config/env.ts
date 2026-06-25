import dotenv from "dotenv";

// Load local .env if present
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  weatherApiKey: process.env.WEATHER_API_KEY || "",
  emailHost: process.env.EMAIL_HOST || "smtp.ethereal.email",
  emailPort: parseInt(process.env.EMAIL_PORT || "587", 10),
  emailUser: process.env.EMAIL_USER || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
