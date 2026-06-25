import React from "react";
import { motion } from "motion/react";

import introJson from "../assets/lotties/introduction.json";
import loadingJson from "../assets/lotties/chargement.json";
import assistantJson from "../assets/lotties/assistant.json";
import profilJson from "../assets/lotties/profil.json";

interface LottiePlayerProps {
  animationPath: "introduction" | "chargement" | "assistant" | "profil";
  isAnimating?: boolean;
  className?: string;
  isIATalking?: boolean;
}

export default function LottiePlayer({
  animationPath,
  isAnimating = true,
  className = "",
  isIATalking = false,
}: LottiePlayerProps) {
  // Select matching metadata
  const metadata = React.useMemo(() => {
    switch (animationPath) {
      case "introduction":
        return introJson;
      case "chargement":
        return loadingJson;
      case "assistant":
        return assistantJson;
      case "profil":
        return profilJson;
      default:
        return introJson;
    }
  }, [animationPath]);

  // Handle Introduction Animation
  if (animationPath === "introduction") {
    return (
      <div id="lottie-introduction" className={`relative flex items-center justify-center overflow-hidden w-full h-full min-h-[300px] ${className}`}>
        {/* Main Clockwise Orbiting Container for PHP, CSS, and JS */}
        <motion.div
          className="relative w-72 h-72 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
          animate={isAnimating ? { rotate: 360 } : {}}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {/* Blue Accent Ring */}
          <motion.div
            className="absolute w-56 h-56 rounded-full border border-dashed border-blue-500/40"
            animate={isAnimating ? { rotate: -360 } : {}}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          />

          {/* PHP Logo (formerly green/emerald square at bottom right) */}
          <motion.div
            className="absolute w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-500 shadow-md shadow-emerald-500/10"
            style={{ bottom: 30, right: 30 }}
            animate={isAnimating ? { y: [0, 12, 0], scale: [1, 1.1, 1], rotate: -360 } : {}}
            transition={{
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 40, ease: "linear" }
            }}
          >
            PHP
          </motion.div>

          {/* CSS Logo (formerly orange/amber square at top right) */}
          <motion.div
            className="absolute w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-500 shadow-md shadow-blue-500/10"
            style={{ top: 80, right: 10 }}
            animate={isAnimating ? { y: [0, -10, 0], scale: [1, 1.05, 1], rotate: -360 } : {}}
            transition={{
              y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 40, ease: "linear" }
            }}
          >
            CSS
          </motion.div>

          {/* JS Logo (newly added on the bottom left for perfect visual balance) */}
          <motion.div
            className="absolute w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500 flex items-center justify-center text-[10px] font-black text-amber-500 shadow-md shadow-amber-500/10"
            style={{ bottom: 30, left: 30 }}
            animate={isAnimating ? { y: [0, -12, 0], scale: [1, 1.1, 1], rotate: -360 } : {}}
            transition={{
              y: { repeat: Infinity, duration: 3.8, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 3.8, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 40, ease: "linear" }
            }}
          >
            JS
          </motion.div>

          {/* Core Hub */}
          <div className="w-32 h-32 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-3 text-center shadow-lg select-none">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Razma</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">Full-Stack</span>
          </div>
        </motion.div>

        {/* Counter-Clockwise Orbiting Container for the Blue Circle with "<>" */}
        <motion.div
          className="absolute w-72 h-72 rounded-full pointer-events-none flex items-center justify-center"
          animate={isAnimating ? { rotate: -360 } : {}}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {/* Blue Circle with "<>" tag, traveling counter-clockwise */}
          <motion.div
            className="absolute w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center text-[11px] font-extrabold text-blue-500 shadow-md shadow-blue-500/10"
            style={{ top: 20, left: 40 }}
            animate={isAnimating ? { y: [0, -12, 0], rotate: 360 } : {}}
            transition={{
              y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 25, ease: "linear" }
            }}
          >
            &lt;&gt;
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Handle Loading Animation (Planetary Pulse / Space loader)
  if (animationPath === "chargement") {
    return (
      <div id="lottie-chargement" className={`relative flex flex-col items-center justify-center w-full h-full min-h-[160px] ${className}`}>
        <div className="relative w-24 h-24">
          {/* Inner Glowing Core */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 blur-[2px]"
            animate={isAnimating ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
          {/* Orbit Line */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
          {/* Orbiting Satellite */}
          <motion.div
            className="absolute w-3.5 h-3.5 rounded-full bg-pink-500 border border-white dark:border-zinc-950 shadow-md"
            style={{ top: "4px", left: "50%", transform: "translateX(-50%)" }}
            animate={isAnimating ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          {/* Double Halo outer rings */}
          <motion.div
            className="absolute -inset-4 rounded-full border border-dashed border-indigo-500/30"
            style={{ transformOrigin: "center" }}
            animate={isAnimating ? { rotate: -360 } : {}}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          />
        </div>
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-4 tracking-wider animate-pulse">
          INITIALIZING...
        </span>
      </div>
    );
  }

  // Handle IA Assistant Wave (Beautiful interactive vocal equalizer wave)
  if (animationPath === "assistant") {
    const barsCount = 6;
    return (
      <div id="lottie-assistant" className={`relative flex flex-col items-center justify-center w-full h-full py-4 ${className}`}>
        {/* Dynamic Wave Visualizer */}
        <div className="flex items-end justify-center gap-1.5 h-16 w-36">
          {Array.from({ length: barsCount }).map((_, idx) => {
            const delay = idx * 0.15;
            const colors = [
              "bg-cyan-400 shadow-cyan-400/20",
              "bg-blue-400 shadow-blue-400/20",
              "bg-indigo-400 shadow-indigo-400/20",
              "bg-violet-400 shadow-violet-400/20",
              "bg-fuchsia-400 shadow-fuchsia-400/20",
              "bg-pink-400 shadow-pink-400/20",
            ];
            // Amplitude depends on whether talking or idling
            const amplitudeY = isIATalking ? [12, 60, 16] : [6, 24, 6];
            const scaleY = isIATalking ? [0.2, 1.1, 0.3] : [0.1, 0.4, 0.1];

            return (
              <motion.div
                key={idx}
                className={`w-2.5 rounded-full ${colors[idx % colors.length]} shadow-sm`}
                animate={isAnimating ? {
                  height: amplitudeY,
                  scaleY: scaleY,
                } : { height: 10 }}
                transition={{
                  repeat: Infinity,
                  duration: isIATalking ? 0.6 + idx * 0.08 : 1.2 + idx * 0.12,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Outer ambient wave pulse */}
        {isIATalking && (
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        )}
      </div>
    );
  }

  // Handle Profile Section (Geometric interactive code visual grid)
  if (animationPath === "profil") {
    return (
      <div id="lottie-profil" className={`relative flex items-center justify-center overflow-hidden w-full h-full min-h-[220px] ${className}`}>
        <div className="grid grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative shadow-inner">
          {Array.from({ length: 16 }).map((_, idx) => {
            const isTarget = [1, 4, 11, 14].includes(idx);
            return (
              <motion.div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono border ${
                  isTarget
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-bold"
                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
                }`}
                animate={isAnimating && isTarget ? {
                  scale: [1, 1.12, 1],
                  backgroundColor: ["rgba(16,185,129,0.1)", "rgba(16,185,129,0.25)", "rgba(16,185,129,0.1)"]
                } : {}}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  delay: idx * 0.1,
                  ease: "easeInOut",
                }}
              >
                {isTarget ? "{" : "1"}
              </motion.div>
            );
          })}

          {/* Cross lines of code connectivity */}
          <motion.div 
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent pointer-events-none"
            animate={isAnimating ? { x: ["-100%", "100%"] } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return null;
}
