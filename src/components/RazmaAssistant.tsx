import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  X,
  Mic,
  Send,
  Volume2,
  VolumeX,
  MapPin,
  CloudSun,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { ChatMessage, WeatherInfo } from "../types.ts";
import LottiePlayer from "./LottiePlayer.tsx";
import { useLanguage } from "../i18n/LanguageContext.tsx";

// Declare Webkit window globals for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface RazmaAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onExecuteAction: (action: string) => void;
  theme: "light" | "dark";
  weather: WeatherInfo | null;
  weatherLoading: boolean;
  weatherError: string | null;
  onRequestWeather: (forceVoice?: boolean) => void;
}

export default function RazmaAssistant({
  isOpen,
  setIsOpen,
  onExecuteAction,
  theme,
  weather,
  weatherLoading,
  weatherError,
  onRequestWeather,
}: RazmaAssistantProps) {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "", // Dynamic text rendered inline depending on the language
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Vocal Conversation and Web Audio Ref Trackers
  const [isVocalMode, setIsVocalMode] = useState(false);
  const isVocalModeRef = useRef(false);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentAudioCtxRef = useRef<AudioContext | null>(null);
  const isAudioPlayingRef = useRef(false);

  const isListeningRef = useRef(false);
  const lastErrorRef = useRef<string | null>(null);
  const consecutiveErrorCountRef = useRef(0);

  const isLoadingRef = useRef(false);
  const isOpenRef = useRef(false);

  useEffect(() => {
    isVocalModeRef.current = isVocalMode;
  }, [isVocalMode]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const safeStartRecognition = () => {
    if (!recognitionRef.current) return;
    if (isAudioPlayingRef.current || isLoadingRef.current) {
      console.log("[Razma Voix] Cannot start speech recognition: AI is actively speaking or thinking.");
      return;
    }
    if (isListeningRef.current) {
      console.log("[Razma Voix] Recognition is already active, ignoring start call.");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("[Razma Voix] Failed to start recognition:", e);
    }
  };

  const safeStopRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
    } catch (e) {
      console.warn("[Razma Voix] Failed to abort recognition:", e);
    }
  };

  const stopCurrentAudio = () => {
    isAudioPlayingRef.current = false;
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    if (currentAudioCtxRef.current) {
      try {
        currentAudioCtxRef.current.close();
      } catch (e) {}
      currentAudioCtxRef.current = null;
    }
  };

  const handleAudioEnded = () => {
    isAudioPlayingRef.current = false;
    // If we are in continuous voice mode and the sidebar is open, trigger automatic microphone restart!
    if (isVocalModeRef.current && isOpenRef.current && !isLoadingRef.current) {
      setTimeout(() => {
        if (isVocalModeRef.current && isOpenRef.current && !isAudioPlayingRef.current && !isLoadingRef.current) {
          safeStartRecognition();
        }
      }, 600); // 600ms safety delay to prevent speaker loop echo
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Synchronize when weather is loaded from parent
  const previousWeatherRef = useRef<WeatherInfo | null>(null);
  useEffect(() => {
    if (weather && !previousWeatherRef.current) {
      setMessages((prev) => {
        if (prev.some((m) => m.id.startsWith("weather-update-"))) return prev;
        
        const textVal = t("razma.weatherUpdate")
          .replace("{city}", weather.city)
          .replace("{country}", weather.country)
          .replace("{temperature}", String(Math.round(weather.temperature)))
          .replace("{condition}", weather.condition.toLowerCase());

        return [
          ...prev,
          {
            id: `weather-update-${Date.now()}`,
            role: "model",
            text: `📍 ${textVal}`,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    }
    previousWeatherRef.current = weather;
  }, [weather, language]);

  const handleRequestLocation = () => {
    onRequestWeather(true);
  };

  // Setup client Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = language === "en" ? "en-US" : language === "mg" ? "mg-MG" : "fr-FR";
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        lastErrorRef.current = null;
        consecutiveErrorCountRef.current = 0;
        setSpeechError(null);
      };

      rec.onresult = (e: any) => {
        // Discard any voice transcriptions heard while AI is speaking or loading response
        if (isAudioPlayingRef.current || isLoadingRef.current) {
          console.log("[Razma Voix] Transcription ignorée (l'IA parle ou réfléchit).");
          return;
        }
        const text = e.results[0][0].transcript;
        if (text) {
          setInput(text);
          sendMessage(text);
          setSpeechError(null);
          consecutiveErrorCountRef.current = 0;
        }
      };

      rec.onerror = (err: any) => {
        const errorType = err && err.error ? err.error : "";
        console.error("Speech recognition error:", errorType || err);
        setIsListening(false);
        isListeningRef.current = false;
        lastErrorRef.current = errorType;
        consecutiveErrorCountRef.current += 1;

        if (errorType === "network") {
          setSpeechError("network");
          // If we hit too many network errors inside an iframe, let's stop auto-looping
          if (consecutiveErrorCountRef.current >= 3) {
            console.warn("[Razma Voix] Trop d'erreurs réseau consécutives. Pause de la relance automatique.");
            setIsVocalMode(false);
            isVocalModeRef.current = false;
          }
        } else if (errorType === "not-allowed" || errorType === "service-not-allowed" || errorType === "permission") {
          console.warn(
            `[Razma Voix] Erreur fatale de permission: "${errorType}". ` +
            "Veuillez autoriser l'accès au microphone."
          );
          setSpeechError("permission");
          setIsVocalMode(false);
          isVocalModeRef.current = false;
        } else if (errorType === "audio-capture") {
          setSpeechError("no-mic");
          setIsVocalMode(false);
          isVocalModeRef.current = false;
        } else if (errorType === "no-speech" || errorType === "aborted") {
          // Normal/expected transient events, ignore and do not report as severe errors
          setSpeechError(null);
        } else {
          setSpeechError(errorType || "unknown");
        }
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        // If we are in continuous voice mode, audio is not playing, and we are not thinking, restart listening!
        if (isVocalModeRef.current && !isAudioPlayingRef.current && !isLoadingRef.current) {
          let restartDelay = 350;
          if (lastErrorRef.current === "network") {
            // Increase the backoff delay for network reconnect to avoid flooding/rate-limit blocks
            restartDelay = Math.min(3000 * consecutiveErrorCountRef.current, 12000);
            console.log(`[Razma Voix] Reconnexion au service vocal après ${restartDelay}ms... (Tentative ${consecutiveErrorCountRef.current})`);
          } else if (lastErrorRef.current === "no-speech") {
            restartDelay = 250; // Fast retry for silent pauses
          }
          
          setTimeout(() => {
            if (isVocalModeRef.current && !isAudioPlayingRef.current && !isListeningRef.current && !isLoadingRef.current) {
              safeStartRecognition();
            }
          }, restartDelay);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      stopCurrentAudio();
    };
  }, []);

  // Sync Recognition language when global site language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "en" ? "en-US" : language === "mg" ? "mg-MG" : "fr-FR";
    }
  }, [language]);

  // Premium Gemini TTS Voice Playback (Feminine professional and natural)
  const playBase64Audio = async (base64: string): Promise<void> => {
    try {
      safeStopRecognition(); // Abort active listening first
      stopCurrentAudio(); // Mute any existing play
      isAudioPlayingRef.current = true; // Block any autostart loop

      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Create AudioContext with 24000Hz corresponding to Gemini TTS format
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      currentAudioCtxRef.current = audioCtx;

      isAudioPlayingRef.current = true;

      // Try decoding first (standard browser behavior if the container is self-describing)
      try {
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        const source = audioCtx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(audioCtx.destination);
        source.onended = handleAudioEnded;
        source.start(0);
        currentAudioSourceRef.current = source;
        return;
      } catch (decodeErr) {
        // Fallback: Manually feed raw 16-bit PCM little-endian at 24000Hz (24kHz Mono 16-bit PCM is standard for raw model output)
        console.log("decodeAudioData failed or raw PCM detected. Playing manually as 16-bit PCM 24kHz.");
      }

      // Convert 16-bit Little Endian PCM to Single Channel Float32 for Web Audio Graph
      const int16Data = new Int16Array(arrayBuffer);
      const floatData = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        floatData[i] = int16Data[i] / 32768.0;
      }

      const buffer = audioCtx.createBuffer(1, floatData.length, 24000);
      buffer.getChannelData(0).set(floatData);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = handleAudioEnded;
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (err) {
      console.error("Failed to play base64 audio:", err);
      isAudioPlayingRef.current = false;
    }
  };

  // Voice TTS Synthesis (Adapts voice by selected language)
  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Stop anything playing
      safeStopRecognition(); // Abort transcription captures immediately
      isAudioPlayingRef.current = true; // Block auto-start loop

      const cleanText = text.replace(/[*#`_]/g, ""); // Strip markdown markers for pristine speech
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Set correct language target
      if (language === "en") {
        utterance.lang = "en-US";
      } else if (language === "mg") {
        utterance.lang = "mg-MG";
      } else {
        utterance.lang = "fr-FR";
      }

      const voices = window.speechSynthesis.getVoices();

      // Find best match depending on selected language
      let matchingVoice = null;
      if (language === "en") {
        matchingVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("zira") ||
              v.name.toLowerCase().includes("samantha") ||
              v.name.toLowerCase().includes("google"))
        );
        if (!matchingVoice) {
          matchingVoice = voices.find((v) => v.lang.startsWith("en"));
        }
      } else if (language === "mg") {
        // Try locating Malagasy voice, if none use standard French female voice as requested by user
        matchingVoice = voices.find((v) => v.lang.startsWith("mg"));
        if (!matchingVoice) {
          matchingVoice = voices.find(
            (v) =>
              v.lang.startsWith("fr") &&
              (v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("maria") ||
                v.name.toLowerCase().includes("hortense") ||
                v.name.toLowerCase().includes("google"))
          );
        }
      } else {
        // French
        matchingVoice = voices.find(
          (v) =>
            v.lang.startsWith("fr") &&
            (v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("maria") ||
              v.name.toLowerCase().includes("hortense") ||
              v.name.toLowerCase().includes("google"))
        );
      }

      const finalVoice = matchingVoice || voices.find((v) => v.lang.startsWith("fr"));

      if (finalVoice) {
        utterance.voice = finalVoice;
      }
      utterance.rate = 1.05; // Slightly faster for dynamic feel
      utterance.pitch = 1.05; // Slightly higher pitch for clear friendly tone

      utterance.onstart = () => {
        isAudioPlayingRef.current = true;
        safeStopRecognition();
      };

      utterance.onend = () => {
        isAudioPlayingRef.current = false;
        if (isVocalModeRef.current && isOpenRef.current && !isLoadingRef.current) {
          setTimeout(() => {
            if (isVocalModeRef.current && isOpenRef.current && !isAudioPlayingRef.current && !isLoadingRef.current) {
              safeStartRecognition();
            }
          }, 600); // 600ms settling time to clear speaker ring
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error event:", e);
        isAudioPlayingRef.current = false;
        if (isVocalModeRef.current && isOpenRef.current && !isLoadingRef.current) {
          setTimeout(() => {
            if (isVocalModeRef.current && isOpenRef.current && !isAudioPlayingRef.current && !isLoadingRef.current) {
              safeStartRecognition();
            }
          }, 600);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech Synthesis failed:", err);
      isAudioPlayingRef.current = false;
    }
  };

  // Sync window voices loading (required for Safari/Chrome sometimes)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Handle Voice Input Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(t("razma.micAlert"));
      return;
    }

    if (isListening || isVocalMode) {
      setIsVocalMode(false);
      stopCurrentAudio();
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      setIsVocalMode(true);
      window.speechSynthesis.cancel(); // Stop default synthesizers
      stopCurrentAudio();
      setSpeechError(null);
      consecutiveErrorCountRef.current = 0;
      safeStartRecognition();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsVocalMode(false); // Turn off continuous conversation loop when typing
    sendMessage(input);
  };

  const sendMessage = async (userText: string) => {
    // 1. Immediately mute speaker output & abort current recognition to transition cleanly
    stopCurrentAudio();
    safeStopRecognition();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map existing messages to backend payload history format
      const historyPayload = messages
        .filter((m) => m.id !== "welcome" && !m.id.startsWith("weather-update"))
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          weatherContext: weather,
          vocal: false, // Turn off synchronous voice to get an instant reply back in ~1s
          language: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const modelMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, modelMsg]);
        setIsLoading(false); // Disable spinner immediately so user has access to text and interaction

        // Execute dynamic scrolling action instantly if requested
        if (data.action) {
          onExecuteAction(data.action);
        }
        
        // Execute instant text-to-speech rendering directly via browser Web Speech API for perfect sync!
        if (isSpeechEnabled) {
          speakText(data.reply);
        }
      } else {
        throw new Error("Chat api returned error");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: t("razma.errorServer"),
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTranslatedLabel = (key: string, defaultValue: string) => {
    const val = t(key);
    return val !== key ? val : defaultValue;
  };

  return (
    <>
      {/* Floating launcher trigger - bottom-left corner as requested */}
      <div className="fixed bottom-4 left-4 z-50">
        <motion.button
          id="btn-voice-chat"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg text-white hover:scale-110 active:scale-95 transition-all outline-none cursor-pointer"
          whileHover={{ scale: 1.08 }}
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          {/* Audio Ring decor */}
          <div className="absolute -inset-1 rounded-full border border-indigo-500/30 animate-ping opacity-30" />
        </motion.button>
      </div>

      {/* Slide-out Sidebar Right (Sidebar droit) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing - hidden on large screens to allow interacting with the shifted portfolio */}
            <motion.div
              id="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar drawer Container */}
            <motion.div
              id="sidebar-assistance-droit"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md lg:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 z-50 flex flex-col shadow-2xl transition-colors duration-500"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-sans tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                      Razma IA
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Voice state mute switch */}
                  <button
                    onClick={() => {
                      if (isSpeechEnabled) {
                        setIsSpeechEnabled(false);
                        window.speechSynthesis.cancel();
                        stopCurrentAudio();
                      } else {
                        setIsSpeechEnabled(true);
                      }
                    }}
                    type="button"
                    className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title={isSpeechEnabled ? t("razma.soundOn") : t("razma.soundOff")}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-zinc-550 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Geo Weather Integration widget */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs transition-colors duration-500">
                {weather ? (
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-mono w-full justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      {weather.city}, {weather.country}
                    </span>
                    <span className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-md text-cyan-600 dark:text-cyan-300 font-bold">
                      <CloudSun className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                      {Math.round(weather.temperature)}°C ({getTranslatedLabel(`weather.${weather.condition.toLowerCase()}`, weather.condition)})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                      {weatherError ? (
                        <span className="text-rose-500 dark:text-rose-400">{weatherError}</span>
                      ) : (
                        t("razma.locDisable")
                      )}
                    </span>
                    <button
                      onClick={handleRequestLocation}
                      disabled={weatherLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-[11px] font-medium text-white transition-all disabled:opacity-55 cursor-pointer"
                    >
                      {weatherLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                      {t("razma.locDetect")}
                    </button>
                  </div>
                )}
              </div>

              {/* Wave Animation Area - dynamically driven by talking status */}
              <div className="bg-zinc-50 dark:bg-zinc-950 py-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-500">
                <LottiePlayer animationPath="assistant" isIATalking={isLoading || isListening || isAudioPlayingRef.current} className="h-16" />
                <div className="text-center text-[10px] font-mono text-cyan-600 dark:text-cyan-400/80 uppercase tracking-widest mt-1">
                  {speechError ? (
                    <span className="text-rose-500 dark:text-rose-400 animate-none">
                      {speechError === "network" ? t("razma.micIframeBlock") : speechError === "permission" ? t("razma.micPermissionTitle") : speechError === "no-mic" ? t("razma.micMissingTitle") : `Erreur: ${speechError}`}
                    </span>
                  ) : isListening ? (
                    t("razma.micListening")
                  ) : isLoading ? (
                    t("razma.micThinking")
                  ) : isAudioPlayingRef.current ? (
                    t("razma.micSpeaking")
                  ) : (
                    t("razma.micIdle")
                  )}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-900 scrollbar-thin transition-colors duration-500">
                {speechError && (
                  <div className="p-3 mb-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-left">
                    <div className="flex gap-2 items-start">
                      <span className="text-sm mt-0.5 shrink-0">⚠️</span>
                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-amber-800 dark:text-amber-300">
                            {speechError === "network"
                              ? t("razma.micIframeBlock")
                              : speechError === "permission"
                              ? t("razma.micPermissionTitle")
                              : speechError === "no-mic"
                              ? t("razma.micMissingTitle")
                              : `Erreur vocale (${speechError})`}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSpeechError(null)}
                            className="bg-transparent hover:text-zinc-900 dark:hover:text-white text-zinc-500 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded transition-colors text-[10px] cursor-pointer"
                          >
                            {t("razma.voiceClose")}
                          </button>
                        </div>
                        <p className="text-zinc-[650] dark:text-zinc-300 text-[11px] leading-relaxed">
                          {speechError === "network"
                            ? t("razma.micIframeFix")
                            : speechError === "permission"
                            ? t("razma.micPermissionDesc")
                            : t("razma.micMissingDesc")}
                        </p>
                        {speechError === "network" && (
                          <div className="pt-2">
                            <a
                              href={window.location.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11.5px] transition-all no-underline shadow-sm cursor-pointer"
                            >
                              Ouvrir dans un nouvel onglet ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {messages.map((msg) => {
                  const isModel = msg.role === "model";
                  const displayWelcome = msg.id === "welcome";
                  const textContent = displayWelcome ? t("razma.welcome") : msg.text;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}
                    >
                      {isModel && (
                        <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[80%]">
                        <div
                           className={`p-3 rounded-2xl text-xs leading-relaxed border shadow-sm text-left ${
                            isModel
                              ? "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-100 rounded-tl-none transition-colors animate-none"
                              : "bg-cyan-600 border-cyan-500 text-white rounded-tr-none"
                          }`}
                        >
                          {textContent}
                        </div>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 px-1 self-start">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 transition-colors">
                      <Loader2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{t("razma.micThinking")}</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Footer Inputs form */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex gap-2 transition-colors duration-500">
                {/* Voice Speak Input Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 border-rose-400 text-white animate-pulse"
                      : isVocalMode
                      ? "bg-emerald-600 border-emerald-500 text-white animate-pulse"
                      : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-cyan-650 dark:text-cyan-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                  title={isListening ? "Écoute en cours - Cliquer pour couper" : "Démarrer discussion vocale"}
                >
                  <Mic className="w-5 h-5 animate-none" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("razma.inputPlaceholder")}
                  className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-all font-sans"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-cyan-600 cursor-pointer"
                >
                  <Send className="w-4 h-4 animate-none" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
