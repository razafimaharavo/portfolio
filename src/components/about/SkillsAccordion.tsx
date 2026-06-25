import React from "react";
import { Code2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import skillsAnimation from "../../assets/lottieFiles/Main_skills.lottie";
import portfolio from "../../../portfolio-context.json";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface SkillsAccordionProps {
  openCompetences: boolean;
  setOpenCompetences: (open: boolean) => void;
}

export function SkillsAccordion({ openCompetences, setOpenCompetences }: SkillsAccordionProps) {
  const { t, dict } = useLanguage();

  const getCategoryLabel = (category: string) => {
    const key = category as keyof typeof dict.about.skillsCategories;
    return dict.about.skillsCategories[key] || category;
  };

  return (
    <div
      id="section-competences"
      className="portfolio-glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpenCompetences(!openCompetences)}
        className="w-full flex items-center justify-between p-5 text-left font-sans font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/10 text-cyan-500">
            {/* <Code2 className="w-5 h-5" /> */}
            <DotLottieReact
              src={skillsAnimation}
              autoplay
              loop
              style={{
                width: "75px",
                height: "75px",
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            4. {t("about.skillsTitle")}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            openCompetences ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {openCompetences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-zinc-150 dark:border-zinc-800"
          >
            <div className="p-5 bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(portfolio.skills).map(([category, list]) => {
                  return (
                    <div
                      key={category}
                      className="p-5 portfolio-glass-subcard"
                    >
                      <h5 className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/50 pb-2 mb-2.5 text-left">
                        {getCategoryLabel(category)}
                      </h5>
                      <div className="flex flex-wrap gap-1.5 justify-start">
                        {list.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-sans font-semibold text-zinc-700 dark:text-zinc-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
