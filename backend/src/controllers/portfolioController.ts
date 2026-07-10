import { Request, Response } from "express";
import { sendContactEmail } from "../mail/mailer.ts";
import { fetchWeather } from "../weather/weatherService.ts";
import { askRazma, generateVoice } from "../ai/aiService.ts";
import { resolveGeoLocation, parseUserAgent } from "../services/geoService.ts";
import fs from "fs/promises";
import path from "path";

const titleMap: Record<string, string> = {
  "README": "README",
  "Architecture": "Architecture",
  "Frontend": "Frontend",
  "Backend": "Backend",
  "RazmaIA": "Razma IA",
  "VoiceAssistant": "Voice Assistant",
  "EmailSystem": "Email System",
  "Localization": "Localization",
  "Translations": "Translations",
  "Weather": "Weather",
  "Geolocation": "Geolocation",
  "ThreeJS": "ThreeJS",
  "Deployment": "Deployment",
  "EnvironmentVariables": "Environment Variables"
};

export async function handleGetDocsList(req: Request, res: Response): Promise<void> {
  try {
    const docsDir = path.join(process.cwd(), "docs");
    const files = await fs.readdir(docsDir);
    
    const mdFiles = files
      .filter(file => file.endsWith(".md"))
      .map(file => {
        const id = path.basename(file, ".md");
        let title = titleMap[id] || id.replace(/([A-Z])/g, " $1").trim();
        // Capitalize first letter of title if fallback was used
        if (!titleMap[id] && title.length > 0) {
          title = title.charAt(0).toUpperCase() + title.slice(1);
        }
        return { id, title };
      });

    // Order of documents as requested or logical flow
    const preferredOrder = [
      "README",
      "Architecture",
      "Frontend",
      "Backend",
      "RazmaIA",
      "VoiceAssistant",
      "EmailSystem",
      "Localization",
      "Translations",
      "Weather",
      "Geolocation",
      "ThreeJS",
      "Deployment",
      "EnvironmentVariables"
    ];

    mdFiles.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.id);
      const indexB = preferredOrder.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.title.localeCompare(b.title);
    });

    res.status(200).json(mdFiles);
  } catch (err: any) {
    res.status(500).json({ error: "Impossible de lister la documentation.", details: err?.message || String(err) });
  }
}

export async function handleGetDocContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Safety check for path traversal
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: "Identifiant de document invalide." });
      return;
    }

    const docsDir = path.join(process.cwd(), "docs");
    const filePath = path.join(docsDir, `${id}.md`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      let title = titleMap[id] || id.replace(/([A-Z])/g, " $1").trim();
      if (!titleMap[id] && title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
      res.status(200).json({ id, title, content });
    } catch {
      res.status(404).json({ error: "Document non trouvé." });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors du chargement du document.", details: err?.message || String(err) });
  }
}

export async function handleContactForm(req: Request, res: Response): Promise<void> {
  try {
    const { name, senderEmail, subject, message } = req.body;

    if (!name || !senderEmail || !subject || !message) {
      res.status(400).json({ error: "Tous les champs (nom, email, sujet, message) sont obligatoires." });
      return;
    }

    if (message.length < 20) {
      res.status(400).json({ error: "Le message doit contenir au moins 20 caractères." });
      return;
    }

    // Resolve approximate client IP
    const rawIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    // Geolocation lookup
    const geoData = await resolveGeoLocation(ip);
    
    // User Agent details
    const uaHeader = req.headers["user-agent"];
    const uaData = parseUserAgent(uaHeader);

    // Diagnostic console logs (Development and analysis logging)
    console.log("=================================");
    console.log("Contact Form Diagnostic");
    console.log("IP détectée :", ip);
    console.log("Type IP :", geoData.ipType);
    console.log("Geo Provider :", geoData.provider);
    console.log("Geo Response :", geoData.geoResponse);
    console.log("Pays :", geoData.country);
    console.log("Ville :", geoData.city);
    console.log("=================================");

    const result = await sendContactEmail({
      name,
      senderEmail,
      subject,
      message,
      ip,
      country: geoData.country,
      city: geoData.city,
      browser: uaData.browser,
      platform: uaData.platform
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Votre message a été transmis avec succès !",
        previewUrl: result.previewUrl,
      });
    } else {
      res.status(500).json({ error: "Impossible d'envoyer l'e-mail. Veuillez réessayer plus tard.", details: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Une erreur est survenue lors de l'envoi.", details: err?.message || String(err) });
  }
}

export async function handleWeatherLookup(req: Request, res: Response): Promise<void> {
  console.log("=== WEATHER ROUTE CALLED ===");
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: "Latitude et Longitude sont requises." });
      return;
    }

    const weather = await fetchWeather(Number(latitude), Number(longitude));
    res.status(200).json(weather);
  } catch (err: any) {
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération météo.", details: err?.message || String(err) });
  }
}

export async function handleAIChat(req: Request, res: Response): Promise<void> {
  try {
    const { message, history, weatherContext, vocal, language } = req.body;

    if (!message) {
      res.status(400).json({ error: "Le message d'entrée est vide." });
      return;
    }

    const aiResponse = await askRazma({
      message,
      history: history || [],
      weatherContext,
      language,
    });

    let audio: string | null = null;
    if (vocal) {
      audio = await generateVoice(aiResponse.reply);
    }

    res.status(200).json({
      ...aiResponse,
      audio,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors du traitement de l'assistant IA.", details: err?.message || String(err) });
  }
}

export async function handleVoiceFetch(req: Request, res: Response): Promise<void> {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "Le texte est requis pour générer la voix." });
      return;
    }
    const audio = await generateVoice(text);
    res.status(200).json({ audio });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors de la génération de la voix.", details: err?.message || String(err) });
  }
}
