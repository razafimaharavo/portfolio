import React, { useState, useRef, useEffect } from "react";
import { Loader2, CloudSun, Globe, ChevronDown } from "lucide-react";
import portfolio from "../../../portfolio-context.json";
import { WeatherInfo } from "../../types/portfolio.types.ts";
import { useLanguage, LanguageType } from "../../i18n/LanguageContext.tsx";

interface HeaderProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  weather: WeatherInfo | null;
  weatherLoading: boolean;
  weatherError: string | null;
  activeSection: string;
  onScrollToSection: (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => void;
}

export function Header({
  theme,
  setTheme,
  weather,
  weatherLoading,
  weatherError,
  activeSection,
  onScrollToSection,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: {
    code: LanguageType;
    name: string;
    flag: string;
    short: string;
  }[] = [
    { code: "fr", name: "Français", flag: "🇫🇷", short: "FR" },
    { code: "en", name: "English", flag: "🇺🇸", short: "EN" },
    { code: "mg", name: "Malagasy", flag: "🇲🇬", short: "MG" },
  ];

  const currentLangObj =
    languages.find((l) => l.code === language) || languages[0];

  // Detect window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run immediately
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 dark:bg-[#050505]/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
          : "bg-transparent backdrop-blur-none border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold leading-none select-none">
            {/* <img src={portfolio.profile.avatar} alt={portfolio.profile.name} className="w-full h-full object-cover rounded-2xl" /> */}
            <img
              src={
                theme === "dark"
                  ? portfolio.profile.avatar2
                  : portfolio.profile.avatar
              }
              alt={portfolio.profile.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              {portfolio.profile.name}
            </span>
            <p className="text-[10px] font-mono text-zinc-500 text-left uppercase tracking-widest leading-none">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider font-mono">
          <a
            href="#section-hero"
            onClick={(e) => onScrollToSection(e, "section-hero")}
            className={`transition-all duration-300 ${
              activeSection === "section-hero"
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t("header.home")}
          </a>
          <a
            href="#about-profile"
            onClick={(e) => onScrollToSection(e, "about-profile")}
            className={`transition-all duration-300 ${
              activeSection === "about-profile" ||
              activeSection === "section-competences"
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t("header.about")}
          </a>
          <a
            href="#portofolio-projects"
            onClick={(e) => onScrollToSection(e, "portofolio-projects")}
            className={`transition-all duration-300 ${
              activeSection === "portofolio-projects"
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t("header.projects")}
          </a>
          <a
            href="#section-services"
            onClick={(e) => onScrollToSection(e, "section-services")}
            className={`transition-all duration-300 ${
              activeSection === "section-services"
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t("header.services")}
          </a>
          <a
            href="#section-contact"
            onClick={(e) => onScrollToSection(e, "section-contact")}
            className={`transition-all duration-300 ${
              activeSection === "section-contact"
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t("header.contact")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Custom Modern Language Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-350 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 transition-all cursor-pointer font-mono font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline text-[11px] font-bold">
                {currentLangObj.short}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? "bg-blue-50/70 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-305 hover:bg-zinc-50 dark:hover:bg-zinc-900/65"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-sans">
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {language === lang.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark & Light Theme switcher */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-zinc-800 dark:bg-zinc-800 text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              Light
            </button>
          </div>

          {/* Dynamic Real-time Weather & Location Indicator badge */}
          <div className="hidden lg:flex text-[11px] text-zinc-650 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 items-center gap-2 font-mono transition-all">
            {weatherLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span className="animate-pulse text-zinc-500 dark:text-zinc-400">
                  {t("header.weatherLoading")}
                </span>
              </>
            ) : weather ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {Math.round(weather.temperature)}°C • {weather.city},{" "}
                  {weather.country}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {weatherError || t("header.weatherNone")}
                </span>
              </>
            )}
          </div>

          {/* <a
            href="#section-contact"
            onClick={(e) => onScrollToSection(e, "section-contact")}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-mono uppercase tracking-wider hidden md:block cursor-pointer"
          >
            {t("header.btnContact")}
          </a> */}
        </div>
      </div>
    </header>
  );
}
