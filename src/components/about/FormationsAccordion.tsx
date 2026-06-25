import React from "react";
import { Compass, ChevronDown } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import formationAnimation from "../../assets/lottieFiles/Main_formation.lottie";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface FormationsAccordionProps {
  openFormations: boolean;
  setOpenFormations: (open: boolean) => void;
}

export function FormationsAccordion({ openFormations, setOpenFormations }: FormationsAccordionProps) {
  const { t, dict } = useLanguage();

  return (
    <div
      id="section-formations"
      className="portfolio-glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpenFormations(!openFormations)}
        className="w-full flex items-center justify-between p-5 text-left font-sans font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 text-amber-500">
            {/* <Compass className="w-5 h-5" /> */}
            <DotLottieReact
              src={formationAnimation}
              autoplay
              loop
              style={{
                width: "60px",
                height: "60px",
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            2. {t("about.certificationsTitle")}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            openFormations ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {openFormations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-zinc-150 dark:border-zinc-800"
          >
            <div className="p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
              {dict.about.certificationsList.map((cert, ix) => (
                <div
                  key={ix}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 portfolio-glass-subcard"
                >
                  <div className="border-l-2 border-amber-500 pl-3 py-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {cert.certification}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {cert.centerLabel}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20 max-w-fit">
                    {cert.dateLabel}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
