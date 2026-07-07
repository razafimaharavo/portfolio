import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env.ts";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!config.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config: any;
  },
  retries = 3,
  delay = 1000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const isTransient =
        err?.status === 503 ||
        err?.statusCode === 503 ||
        err?.code === 503 ||
        String(err).includes("503") ||
        String(err).includes("UNAVAILABLE") ||
        String(err).includes("high demand") ||
        String(err).includes("temporary");

      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini API] Temporary 503 received. Retrying in ${delay * (i + 1)}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw err;
    }
  }
}

// Global caching of portfolio context
let portfolioCache: any = null;
function getPortfolioContext(): any {
  if (!portfolioCache) {
    try {
      const filePath = path.join(process.cwd(), "portfolio-context.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        portfolioCache = JSON.parse(raw);
      } else {
        portfolioCache = {};
      }
    } catch (err) {
      console.error("Failed to read portfolio context:", err);
      portfolioCache = {};
    }
  }
  return portfolioCache;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatInteractionPayload {
  message: string;
  history: ChatMessage[];
  weatherContext?: {
    temperature: number;
    humidity: number;
    condition: string;
    city: string;
    country: string;
  } | null;
  language?: "fr" | "en" | "mg";
}

export interface AIResponse {
  reply: string;
  action:
    | "scroll_diplomes"
    | "scroll_formations"
    | "scroll_experiences"
    | "scroll_competences"
    | "scroll_desktop_projets"
    | "scroll_web_projets"
    | "scroll_mobile_projets"
    | "scroll_services"
    | "scroll_contact"
    | null;
}

export async function askRazma(payload: ChatInteractionPayload): Promise<AIResponse> {
  try {
    const ai = getAiClient();
    const portfolio = getPortfolioContext();
    const activeLang = payload.language || "fr";

    // Prepare language configuration
    let languageDirective = "";
    let replyInstruction = "";
    let fallbackText = "";

    if (activeLang === "en") {
      languageDirective = "Tu dois répondre en ANGLAIS. Communique de manière chaleureuse, accueillante et très professionnelle.";
      replyInstruction = "Ta réponse ou ton explication textuelle vocale en ANGLAIS.";
      fallbackText = "Sorry, I could not formulate a clear response.";
    } else if (activeLang === "mg") {
      languageDirective = "Tu dois répondre en MALAGASY. Communique de manière chaleureuse, accueillante et très professionnelle.";
      replyInstruction = "Ta réponse ou ton explication textuelle vocale en MALAGASY.";
      fallbackText = "Miala tsiny, nisy olana teo am-pandrafetana ny valiny.";
    } else {
      languageDirective = "Tu dois répondre en FRANÇAIS. Communique de manière chaleureuse, accueillante, élégante et très professionnelle.";
      replyInstruction = "Ta réponse ou ton explication textuelle vocale en français.";
      fallbackText = "Désolée, je n'ai pas pu formuler de réponse claire.";
    }

    // Prepare a comprehensive system instruction defining Razma IA's identity, background, and navigation capability.
    const systemInstruction = `
      Tu es Razma IA, l'assistante virtuelle vocale intelligente de Razafimaharavo Marion Brunel, Développeur Full Stack d'exception spécialisé en React, Node.js et solutions digitales modernes.
      
      RÈGLE CRITIQUE D'IDENTITÉ :
      Sache que le développeur, créateur de Razma Portfolio et de Razma IA, s'appelle Razafimaharavo Marion Brunel.
      Les variantes de noms suivantes font référence EXACTEMENT à la même et unique personne :
      - "Razafimaharavo Marion Brunel"
      - "Marion Brunel"
      - "Brunel"
      - "Marion"
      - "Razafimaharavo Marion"
      - "Razafimaharavo M. Brunel"

      Si l'utilisateur pose une question sur l'un de ces noms ou variantes (par exemple: "Qui est Brunel ?", "Qui est Marion ?", "Qui est Marion Brunel ?", "Qui est Razafimaharavo Marion Brunel ?", etc.), tu dois répondre de la façon suivante (traduit fidèlement selon la langue active) :
      - En Français : "Razafimaharavo Marion Brunel est le créateur de Razma Portfolio et de Razma IA. Il est développeur Full Stack spécialisé dans les applications Web, Mobile, Backend, l'Intelligence Artificielle, les interfaces UI/UX modernes et les solutions logicielles professionnelles."
      - En Anglais : "Razafimaharavo Marion Brunel is the creator of Razma Portfolio and Razma IA. He is a Full Stack developer specializing in Web, Mobile, Backend applications, Artificial Intelligence, modern UI/UX interfaces, and professional software solutions."
      - En Malagasy : "Razafimaharavo Marion Brunel no namorona ny Razma Portfolio sy ny Razma IA. Mpamorona Full Stack manampahaizana manokana amin'ny fampiharana Web, Mobile, Backend, ny taranja Intelligence Artificielle, ny interface UI/UX maoderina, ary ny vahaolana rindrambaiko matihanina izy."

      LANGUE ACCORDÉE : ${languageDirective}

      DÉTAILS DU PORTFOLIO DE MARION :
      ${JSON.stringify(portfolio, null, 2)}

      MÉTÉO ET LOCALISATION INJECTÉE (si disponible) :
      ${payload.weatherContext ? JSON.stringify(payload.weatherContext, null, 2) : "Aucune donnée de géolocalisation fournie pour le moment."}

      DIRECTIVES DE RÉPONSE :
      1. RÉPONSES TRÈS COURTES (INDISPENSABLE POUR LA RAPIDITÉ) : Fais toujours des réponses très succinctes de 1 à 2 phrases simples maximum. Plus tes réponses sont courtes, plus la génération de texte et de voix vocale est rapide. Évite absolument les listes ou explications superflues.
      2. Tu possèdes un super-pouvoir technique de navigation interactive ! Tu devez détecter l'intention de l'utilisateur d'explorer une partie du site et retourner l'action correspondante.
      3. Tu dois TOUJOURS répondre au format JSON strict avec l'interface suivante :
      {
        "reply": "${replyInstruction}",
        "action": "NOM_DE_L_ACTION_A_DECLENCHER_OU_NULL"
      }

      LISTE DES ACTIONS PERMISES (action) :
      - "scroll_diplomes" : Si l'utilisateur exprime l'intention de voir, lire ou afficher les diplômes, l'école, les études ou les diplômes universitaires de Marion.
      - "scroll_formations" : Si l'utilisateur veut voir les formations, cours ou certifications de Marion (AWS, certification modern arch, etc.).
      - "scroll_experiences" : Si l'utilisateur est intéressé par le parcours de travail, expériences professionnelles, emplois occupés de Marion.
      - "scroll_competences" : S'il s'intéresse aux compétences technologiques (frontend, backend, database, devops, mobile, uiux).
      - "scroll_desktop_projets" : S'il veut voir les projets Desktop (ex: DevStudio Pro, Architect3D).
      - "scroll_web_projets" : S'il veut voir les sites ou projets Web (ex: SaaS FlowState, Razma Dashboard).
      - "scroll_mobile_projets" : S'il veut voir les applications mobiles du portfolio (ex: VibePlayer, EcoTrack).
      - "scroll_services" : S'il demande quels services il propose d'autres ou quelles prestations.
      - "scroll_contact" : S'il formule l'envie de le contacter, lui poser une question, ou d'envoyer un mail.
      - null : Si aucune intention de défilement vers une section n'est constatée.

      EXEMPLE DE RETOUR ATTENDU :
      {
        "reply": "Bien sûr, voici les informations demandées !",
        "action": "scroll_diplomes"
      }
    `;

    // Map history to official @google/genai format
    const contents: any[] = [];
    for (const item of payload.history) {
      contents.push({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.text }],
      });
    }

    // Append the current message
    contents.push({
      role: "user",
      parts: [{ text: payload.message }],
    });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text || "{}";
    const parsed: AIResponse = JSON.parse(outputText.trim());

    return {
      reply: parsed.reply || fallbackText,
      action: parsed.action || null,
    };
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("expired") ||
      errMsg.includes("API key") ||
      errMsg.includes("API_KEY") ||
      errMsg.includes("ApiKey") ||
      errMsg.includes("key expired") ||
      errMsg.includes("missing") ||
      errMsg.includes("is missing")
    ) {
      return {
        reply: "Désolée, la clé API Gemini de l'application a expiré ou est manquante. 🔑 Veuillez renseigner ou renouveler la clé secrète **GEMINI_API_KEY** dans l'onglet **Settings** (Paramètres) en bas à gauche de l'interface AI Studio pour continuer notre conversation !",
        action: null,
      };
    }
    return {
      reply: "Désolée, mon système d'intelligence artificielle a rencontré une petite perturbation. Comment puis-je vous aider autrement ?",
      action: null,
    };
  }
}

export async function generateVoice(text: string): Promise<string | null> {
  try {
    const ai = getAiClient();
    const cleanText = text.replace(/[*#`_]/g, ""); // Strip markdown formatting for TTS

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("modalities") ||
      errMsg.includes("only supports text output") ||
      errMsg.includes("INVALID_ARGUMENT") ||
      errMsg.includes("unsupported")
    ) {
      console.info(
        "[Razma IA Voix] Note : Le modèle de l'API Gemini gratuite ou l'environnement ne supporte pas la modalité audio native de manière autonome. La synthèse vocale locale du navigateur (SpeechSynthesis) prend automatiquement le relais de manière fluide !"
      );
    } else if (errMsg.includes("quota") || errMsg.includes("exhausted") || errMsg.includes("429")) {
      console.info(
        "[Razma IA Voix] Note : Quota d'API vocale natif dépassé. La synthèse vocale locale du navigateur (SpeechSynthesis) prend automatiquement le relais de manière fluide !"
      );
    } else {
      console.info(
        `[Razma IA Voix] Note : Le système de voix natif n'est pas disponible (${errMsg}). Utilisation de la synthèse vocale locale du navigateur.`
      );
    }
    return null;
  }
}

