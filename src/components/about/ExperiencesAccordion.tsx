import React from "react";
import { Briefcase, ChevronDown } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import experienceAnimation from "../../assets/lottieFiles/Main_experience.lottie";
import { motion, AnimatePresence } from "motion/react";
import portfolio from "../../../portfolio-context.json";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface ExperiencesAccordionProps {
  openExperiences: boolean;
  setOpenExperiences: (open: boolean) => void;
}

export function ExperiencesAccordion({ openExperiences, setOpenExperiences }: ExperiencesAccordionProps) {
  const { t, dict } = useLanguage();

  return (
    <div
      id="section-experiences"
      className="portfolio-glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpenExperiences(!openExperiences)}
        className="w-full flex items-center justify-between p-5 text-left font-sans font-bold text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 text-emerald-500">
            {/* <Briefcase className="w-5 h-5" /> */}
            <DotLottieReact
              src={experienceAnimation}
              autoplay
              loop
              style={{
                width: "60px",
                height: "60px",
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            3. {t("about.experiencesTitle")}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            openExperiences ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {openExperiences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-zinc-150 dark:border-zinc-800"
          >
            <div className="p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
              {dict.about.experiencesList.map((expTranslation, ix) => {
                const rawExp = portfolio.experiences[ix] || { company: "" };
                return (
                  <div
                    key={ix}
                    className="p-5 portfolio-glass-subcard"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-3 mb-3">
                      <div className="border-l-2 border-indigo-505 pl-3 py-1">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {expTranslation.role}
                        </h4>
                        <p className="text-xs text-indigo-650 dark:text-indigo-400 font-mono mt-0.5 uppercase tracking-wide text-left">
                          {rawExp.company}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 max-w-fit">
                        {expTranslation.periodLabel}
                      </span>
                    </div>
                    <p className="text-zinc-650 dark:text-zinc-400 text-xs leading-relaxed font-sans text-left">
                      {expTranslation.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
