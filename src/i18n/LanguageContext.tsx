import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations.ts";
import { TranslationDictionary } from "./types.ts";

export type LanguageType = "fr" | "en" | "mg";

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dict: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem("portfolio_lang");
    if (saved === "fr" || saved === "en" || saved === "mg") {
      return saved;
    }
    return "fr"; // Default language
  });

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem("portfolio_lang", lang);
  };

  // Safe translation key accessor
  const t = (path: string, replacements?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English if not found, then French, then original path
        let fallback = translations["en"];
        for (const fKey of keys) {
          if (fallback && typeof fallback === "object" && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            fallback = undefined;
            break;
          }
        }
        if (typeof fallback === "string") {
          current = fallback;
        } else {
          return path;
        }
      }
    }

    if (typeof current !== "string") {
      return path;
    }

    let result = current;
    if (replacements) {
      Object.entries(replacements).forEach(([key, val]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), String(val));
      });
    }

    return result;
  };

  const dict = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
