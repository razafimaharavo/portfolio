import express from "express";
import {
  handleContactForm,
  handleWeatherLookup,
  handleAIChat,
  handleVoiceFetch,
  handleGetDocsList,
  handleGetDocContent,
} from "../controllers/portfolioController.ts";

const router = express.Router();

// Define interactive API endpoints
router.post("/contact", handleContactForm);
router.post("/weather", handleWeatherLookup);
router.post("/chat", handleAIChat);
router.post("/voice", handleVoiceFetch);

// Documentation endpoints
router.get("/docs", handleGetDocsList);
router.get("/docs/:id", handleGetDocContent);

router.get("/ping", (_req, res) => {
  res.json({ success: true });
});

export default router;
