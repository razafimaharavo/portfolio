import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { Project } from "../../types/portfolio.types.ts";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface ProjectCardProps {
  projects: Project[];
  categoryTag: string;
  categoryColorClass: string;
  sectionId: string;
  onSelect: (project: Project) => void;
  mixTrigger?: number;
}

const loadedProjectImages = new Set<string>();
const projectImageRequests = new Map<string, Promise<void>>();

function preloadProjectImage(src: string): Promise<void> {
  if (loadedProjectImages.has(src)) {
    return Promise.resolve();
  }

  const existingRequest = projectImageRequests.get(src);
  if (existingRequest) {
    return existingRequest;
  }

  const request = new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      loadedProjectImages.add(src);
      projectImageRequests.delete(src);
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      finish();
    } else if (image.decode) {
      image
        .decode()
        .then(finish)
        .catch(() => undefined);
    }
  });

  projectImageRequests.set(src, request);
  return request;
}

export function ProjectCard({
  projects,
  categoryTag,
  categoryColorClass,
  sectionId,
  onSelect,
  mixTrigger,
}: ProjectCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right/next, -1 = left/prev
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentIndexRef = useRef(0);
  const transitionIdRef = useRef(0);
  const { t, language } = useLanguage();

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const requestProjectIndex = useCallback(
    async (nextIndex: number, nextDirection: number) => {
      if (!projects || projects.length === 0) return;

      const normalisedIndex = (nextIndex + projects.length) % projects.length;
      const nextProject = projects[normalisedIndex];
      if (!nextProject || normalisedIndex === currentIndexRef.current) return;

      const transitionId = transitionIdRef.current + 1;
      transitionIdRef.current = transitionId;
      setIsTransitioning(true);

      await preloadProjectImage(nextProject.image);

      if (transitionIdRef.current !== transitionId) return;

      setDirection(nextDirection);
      setCurrentIndex(normalisedIndex);
      setIsTransitioning(false);
    },
    [projects],
  );

  // Scramble current index if mixTrigger shifts
  useEffect(() => {
    if (projects && projects.length > 0 && mixTrigger !== undefined) {
      const randomIndex = Math.floor(Math.random() * projects.length);
      requestProjectIndex(randomIndex, 1);
    }
  }, [mixTrigger, projects, requestProjectIndex]);

  const activeProject =
    projects && projects[currentIndex] ? projects[currentIndex] : null;

  useEffect(() => {
    if (!activeProject) return;
    preloadProjectImage(activeProject.image);
  }, [activeProject]);

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (!projects || projects.length <= 1 || isTransitioning) return;
      requestProjectIndex(currentIndexRef.current + 1, 1);
    },
    [isTransitioning, projects, requestProjectIndex],
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (!projects || projects.length <= 1 || isTransitioning) return;
      requestProjectIndex(currentIndexRef.current - 1, -1);
    },
    [isTransitioning, projects, requestProjectIndex],
  );

  // Automated 5-second slider interval
  useEffect(() => {
    if (!projects || projects.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext, projects]); // Resetting on currentIndex change gives the user a full 5s on manual navigation

  if (!activeProject) return null;

  // Spring animation variants for direction-aware slide + fade
  const slideVariants: Variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 35 : -35,
      scale: 0.98,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 26 },
        opacity: { duration: 0.22 },
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -35 : 35,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 26 },
        opacity: { duration: 0.22 },
      },
    }),
  };

  const getProjectTranslation = (
    id: string,
    fallbackName: string,
    fallbackShort: string,
  ) => {
    const keyMap: Record<string, { name: string; short: string }> = {
      "project-desktop-1": {
        name: "projects.p1Name",
        short: "projects.p1Short",
      },
      "project-desktop-2": {
        name: "projects.p2Name",
        short: "projects.p2Short",
      },
      "project-web-1": { name: "projects.p3Name", short: "projects.p3Short" },
      "project-web-2": { name: "projects.p4Name", short: "projects.p4Short" },
      "project-web-3": { name: "projects.p7Name", short: "projects.p7Short" },
      "project-mobile-1": {
        name: "projects.p5Name",
        short: "projects.p5Short",
      },
      "project-mobile-2": {
        name: "projects.p6Name",
        short: "projects.p6Short",
      },
    };

    const keys = keyMap[id];
    if (keys) {
      const translatedName = t(keys.name);
      const translatedShort = t(keys.short);
      return {
        name: translatedName !== keys.name ? translatedName : fallbackName,
        shortDescription:
          translatedShort !== keys.short ? translatedShort : fallbackShort,
      };
    }
    return { name: fallbackName, shortDescription: fallbackShort };
  };

  const translatedProject = getProjectTranslation(
    activeProject.id,
    activeProject.name,
    activeProject.shortDescription,
  );

  const getTranslatedCategoryTag = (tag: string) => {
    const normalisedTag = tag.toUpperCase();
    if (normalisedTag === "DESKTOP") return t("projects.desktop");
    if (normalisedTag === "SITE WEB" || normalisedTag === "WEBSITE")
      return t("projects.web");
    if (normalisedTag === "MOBILE") return t("projects.mobile");
    return tag;
  };

  return (
    <div
      id={sectionId}
      className="portfolio-glass-card group relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 min-h-[460px] md:min-h-[490px]"
    >
      <div className="relative flex-1 flex flex-col justify-between p-3 pb-0">
        {/* Navigation arrows overlaid elegantly on the image canvas */}
        <div
          className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
          aria-busy={isTransitioning}
        >
          {/* Manual prev button */}
          {projects && projects.length > 1 && (
            <button
              id={`${sectionId}-prev-btn`}
              onClick={handlePrev}
              type="button"
              disabled={isTransitioning}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Projet précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Manual next button */}
          {projects && projects.length > 1 && (
            <button
              id={`${sectionId}-next-btn`}
              onClick={handleNext}
              type="button"
              disabled={isTransitioning}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Projet suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Animated Image Transition */}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={activeProject.id}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeProject.image}
                alt={translatedProject.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <span
            className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 bg-black/75 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border ${categoryColorClass}`}
          >
            {getTranslatedCategoryTag(categoryTag)}
          </span>
        </div>

        {/* Animated text and technology transition */}
        <div className="flex-1 flex flex-col justify-between p-3 pt-4 text-left overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={activeProject.id}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white transition-colors duration-300">
                  {translatedProject.name}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                  {translatedProject.shortDescription}
                </p>
              </div>

              {/* Technologies displayed inline on the bento card */}
              <div className="mt-4 flex flex-wrap gap-1">
                {activeProject.technologies &&
                  activeProject.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-800 text-[9px] font-mono font-semibold text-zinc-650 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                {activeProject.technologies &&
                  activeProject.technologies.length > 4 && (
                    <span className="text-[9px] font-mono text-zinc-400 self-center pl-1">
                      +{activeProject.technologies.length - 4}
                    </span>
                  )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Static Voir plus button binded to the current active project */}
      <div className="p-6 pt-2">
        <button
          id={`view-more-${activeProject.id}`}
          onClick={() => onSelect(activeProject)}
          type="button"
          className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all text-center flex items-center justify-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 cursor-pointer animate-none"
        >
          {t("projects.viewDetails")}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
