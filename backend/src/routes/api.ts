import express from "express";
import { handleContactForm, handleWeatherLookup, handleAIChat, handleVoiceFetch } from "../controllers/portfolioController.ts";

const router = express.Router();

// Define interactive API endpoints
router.post("/contact", handleContactForm);
router.post("/weather", handleWeatherLookup);
router.post("/chat", handleAIChat);
router.post("/voice", handleVoiceFetch);

export default router;
