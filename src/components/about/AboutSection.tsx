import React from "react";
import { DiplomasAccordion } from "./DiplomasAccordion.tsx";
import { FormationsAccordion } from "./FormationsAccordion.tsx";
import { ExperiencesAccordion } from "./ExperiencesAccordion.tsx";
import { SkillsAccordion } from "./SkillsAccordion.tsx";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface AboutSectionProps {
  openDiplomes: boolean;
  setOpenDiplomes: (open: boolean) => void;
  openFormations: boolean;
  setOpenFormations: (open: boolean) => void;
  openExperiences: boolean;
  setOpenExperiences: (open: boolean) => void;
  openCompetences: boolean;
  setOpenCompetences: (open: boolean) => void;
}

export function AboutSection({
  openDiplomes,
  setOpenDiplomes,
  openFormations,
  setOpenFormations,
  openExperiences,
  setOpenExperiences,
  openCompetences,
  setOpenCompetences,
}: AboutSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="about-profile" className="py-20 bg-zinc-100/50 dark:bg-zinc-900/10 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            {t("about.title")}
          </h2>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <DiplomasAccordion openDiplomes={openDiplomes} setOpenDiplomes={setOpenDiplomes} />
          <FormationsAccordion openFormations={openFormations} setOpenFormations={setOpenFormations} />
          <ExperiencesAccordion openExperiences={openExperiences} setOpenExperiences={setOpenExperiences} />
          <SkillsAccordion openCompetences={openCompetences} setOpenCompetences={setOpenCompetences} />
        </div>
      </div>
    </section>
  );
}
