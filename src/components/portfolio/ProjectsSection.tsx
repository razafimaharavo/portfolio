import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Project } from "../../types/portfolio.types.ts";
import { ProjectCard } from "./ProjectCard.tsx";
import portfolio from "../../../portfolio-context.json";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface ProjectsSectionProps {
  desktopProject: Project | null;
  webProject: Project | null;
  mobileProject: Project | null;
  onRollRandomProjects: () => void;
  onSelectProject: (p: Project) => void;
}

export function ProjectsSection({
  desktopProject,
  webProject,
  mobileProject,
  onRollRandomProjects,
  onSelectProject,
}: ProjectsSectionProps) {
  // A local mixTrigger to scramble rotation starting points on demand
  const [mixTrigger, setMixTrigger] = useState(0);
  const { t, language } = useLanguage();

  // Group all projects by their correct categories
  const allProjects = (portfolio.projects || []) as Project[];
  const desktopProjects = allProjects.filter((p) => p.category === "desktop");
  const webProjects = allProjects.filter((p) => p.category === "web");
  const mobileProjects = allProjects.filter((p) => p.category === "mobile");

  const handleMixClick = () => {
    // Increment local trigger to scramble the carousel slide starting positions
    setMixTrigger((prev) => prev + 1);
    // Keep parent sync callback intact
    onRollRandomProjects();
  };

  return (
    <section id="portofolio-projects" className="py-20 max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
        <div className="text-left">
          {/* <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase">
            {t("projects.badge")}
          </span> */}
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            {t("projects.title")}
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {t("projects.subtitle")}
          </p>
        </div>

        <button
          id="shuffle-projects-btn"
          onClick={handleMixClick}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-cyan-500" />
          {t("projects.mix")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectCard
          projects={desktopProjects}
          categoryTag="DESKTOP"
          categoryColorClass="text-amber-400 border-amber-500/20"
          sectionId="section-desktop-projets"
          onSelect={onSelectProject}
          mixTrigger={mixTrigger}
        />
        <ProjectCard
          projects={webProjects}
          categoryTag="SITE WEB"
          categoryColorClass="text-cyan-400 border-cyan-500/20"
          sectionId="section-web-projets"
          onSelect={onSelectProject}
          mixTrigger={mixTrigger}
        />
        <ProjectCard
          projects={mobileProjects}
          categoryTag="MOBILE"
          categoryColorClass="text-purple-400 border-purple-500/20"
          sectionId="section-mobile-projets"
          onSelect={onSelectProject}
          mixTrigger={mixTrigger}
        />
      </div>
    </section>
  );
}
