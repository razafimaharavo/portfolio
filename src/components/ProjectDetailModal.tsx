import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Github, ExternalLink, Cpu, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Project } from "../types.ts";
import { useLanguage } from "../i18n/LanguageContext.tsx";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { t } = useLanguage();

  if (!project) return null;

  const getProjectDetailsTranslated = (propProject: Project) => {
    const keyMap: Record<string, { name: string; short: string; long: string; f1: string; f2: string; f3: string; f4: string }> = {
      "project-desktop-1": {
        name: "projects.p1Name",
        short: "projects.p1Short",
        long: "projects.p1Long",
        f1: "projects.p1F1",
        f2: "projects.p1F2",
        f3: "projects.p1F3",
        f4: "projects.p1F4",
      },
      "project-desktop-2": {
        name: "projects.p2Name",
        short: "projects.p2Short",
        long: "projects.p2Long",
        f1: "projects.p2F1",
        f2: "projects.p2F2",
        f3: "projects.p2F3",
        f4: "projects.p2F4",
      },
      "project-web-1": {
        name: "projects.p3Name",
        short: "projects.p3Short",
        long: "projects.p3Long",
        f1: "projects.p3F1",
        f2: "projects.p3F2",
        f3: "projects.p3F3",
        f4: "projects.p3F4",
      },
      "project-web-2": {
        name: "projects.p4Name",
        short: "projects.p4Short",
        long: "projects.p4Long",
        f1: "projects.p4F1",
        f2: "projects.p4F2",
        f3: "projects.p4F3",
        f4: "projects.p4F4",
      },
      "project-mobile-1": {
        name: "projects.p5Name",
        short: "projects.p5Short",
        long: "projects.p5Long",
        f1: "projects.p5F1",
        f2: "projects.p5F2",
        f3: "projects.p5F3",
        f4: "projects.p5F4",
      },
      "project-mobile-2": {
        name: "projects.p6Name",
        short: "projects.p6Short",
        long: "projects.p6Long",
        f1: "projects.p6F1",
        f2: "projects.p6F2",
        f3: "projects.p6F3",
        f4: "projects.p6F4",
      }
    };

    const keys = keyMap[propProject.id];
    if (keys) {
      return {
        name: t(keys.name),
        shortDescription: t(keys.short),
        description: t(keys.long),
        features: [t(keys.f1), t(keys.f2), t(keys.f3), t(keys.f4)]
      };
    }

    return {
      name: propProject.name,
      shortDescription: propProject.shortDescription,
      description: propProject.description,
      features: propProject.features
    };
  };

  const translatedKeys = getProjectDetailsTranslated(project);

  const getImageCounterText = () => {
    return t("projects.imageCounter")
      .replace("{current}", String(activeImageIdx + 1))
      .replace("{total}", String(project.gallery.length));
  };

  const getCategoryLabel = () => {
    const cat = project.category.toUpperCase();
    return t("projects.categoryLabel")
      .replace("{category}", cat);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay with blur */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window Sheet */}
        <motion.div
          id={`modal-${project.id}`}
          initial={{ opacity: 0, y: 70, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl z-50 text-zinc-100 flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-zinc-950/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-md focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Images & Gallery */}
          <div className="w-full md:w-1/2 p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-805">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-800 group">
              <img
                src={project.gallery[activeImageIdx] || project.image}
                alt={translatedKeys.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/75 rounded-full text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 backdrop-blur-sm">
                <ImageIcon className="w-3 h-3 text-cyan-400" />
                {getImageCounterText()}
              </div>
            </div>

            {/* Thumbnail Pickers */}
            <div className="flex gap-2 flex-wrap mt-3">
              {project.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === activeImageIdx
                      ? "border-cyan-400 scale-95 shadow-md shadow-cyan-500/10"
                      : "border-zinc-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${translatedKeys.name} thumbnail ${idx}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-xs border border-zinc-700 transition-all font-semibold active:scale-95 text-center cursor-pointer"
              >
                <Github className="w-4 h-4 text-zinc-400" />
                {t("projects.sourceCodeBtn")}
              </a>

              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-sans text-xs border border-cyan-500/40 transition-all font-semibold active:scale-95 text-center shadow-lg shadow-cyan-500/5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                {t("projects.liveDemoBtn")}
              </a>
            </div>
          </div>

          {/* Right Side: Core Rich Description */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              {/* Category tag */}
              <span className="px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-[10px] font-mono font-bold text-cyan-400 tracking-wider inline-block uppercase mb-2">
                {getCategoryLabel()}
              </span>

              <h2 className="text-2xl font-bold font-sans tracking-tight text-white">
                {translatedKeys.name}
              </h2>

              <p className="text-zinc-400 text-xs font-mono mt-1 border-b border-zinc-800 pb-4">
                {translatedKeys.shortDescription}
              </p>

              {/* Complete long description */}
              <div className="mt-4">
                <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-semibold text-left">
                  {t("projects.aboutProjectHeader")}
                </h4>
                <p className="text-zinc-300 text-xs mt-1.5 leading-relaxed font-sans text-left">
                  {translatedKeys.description}
                </p>
              </div>

              {/* Technologies List */}
              <div className="mt-6">
                <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-500" />
                  {t("projects.techsHeader")}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2 justify-start">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-300 font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features checklist */}
              <div className="mt-6">
                <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-semibold text-left">
                  {t("projects.featuresHeader")}
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {translatedKeys.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-zinc-300 text-left">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hint about architecture */}
            <div className="text-center text-[9px] font-mono text-zinc-600 mt-6 pt-4 border-t border-zinc-800 uppercase">
              RAZMA PORTFOLIO INTUITIVE APP
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
