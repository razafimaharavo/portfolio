import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import portfolio from "../../../portfolio-context.json";
import LottiePlayer from "../LottiePlayer.tsx";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface HeroSectionProps {
  onScrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const { t } = useLanguage();
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVariantIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="section-hero" className="backdrop-blur-xs py-20 md:py-24 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 items-stretch">
      <motion.div
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="md:col-span-7 p-6 md:py-10 flex flex-col justify-between relative overflow-hidden min-h-[380px] md:min-h-[440px]"
      >
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={variantIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-400/30 rounded-full text-blue-650 dark:text-blue-400 text-xs font-mono font-bold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow animate-pulse" />
                {t(`hero.badge${variantIndex + 1}`)}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                {t(`hero.welcome${variantIndex + 1}`)}
              </h1>
              <p className="text-lg font-mono text-blue-650 dark:text-blue-400 font-bold mt-2 text-left uppercase tracking-wider text-xl leading-snug">
                {t(`hero.title${variantIndex + 1}`)}
              </p>

              <p className="text-zinc-650 dark:text-zinc-400 text-sm mt-5 leading-relaxed font-sans max-w-lg min-h-[60px]">
                {t(`hero.subtitle${variantIndex + 1}`)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Core Interactive Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <a
            href={portfolio.profile.cvUrl}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-xs transition-all font-sans active:scale-95 shadow-md shadow-blue-500/10"
          >
            {t("hero.btnCV")}
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <a
            href="#section-contact"
            onClick={(e) => onScrollToSection(e, "section-contact")}
            className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-850 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-700 transition-all font-sans active:scale-95"
          >
            {t("hero.btnContact")}
          </a>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
        </div>
      </motion.div>

      {/* Dynamic Vector hub visualizer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="md:col-span-5 flex items-center justify-center p-6 relative overflow-hidden h-full min-h-[320px]"
      >
        <LottiePlayer animationPath="introduction" className="h-72 w-full" />
      </motion.div>
    </section>
  );
}
