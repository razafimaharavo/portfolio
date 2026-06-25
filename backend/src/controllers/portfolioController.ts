import { Request, Response } from "express";
import { sendContactEmail } from "../mail/mailer.ts";
import { fetchWeather } from "../weather/weatherService.ts";
import { askRazma, generateVoice } from "../ai/aiService.ts";

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

    // Approximate Country lookup from free IP API
    let country = "Non identifiée";
    try {
      if (ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
        const geoIpRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoIpRes.ok) {
          const geoIpData = await geoIpRes.json();
          country = geoIpData.country_name || "Non identifiée";
        }
      }
    } catch {
      // Fail silently for IP Country lookup
    }

    const result = await sendContactEmail({
      name,
      senderEmail,
      subject,
      message,
      ip,
      country,
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
