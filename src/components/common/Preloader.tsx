import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface PreloaderProps {
  progress: number;
  isExiting: boolean;
}

export const Preloader = React.memo(function Preloader({ progress, isExiting }: PreloaderProps) {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id="preloader-overlay"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] overflow-hidden select-none"
      initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      animate={
        isExiting
          ? {
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
              transition: { duration: 0.65, ease: [0.6, 0.01, -0.05, 0.95] },
            }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
    >
      {/* Background premium glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/5 to-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Futuristic soft background grid / noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating subtle ambient particles */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
              style={{
                top: `${15 + (i * 73) % 70}%`,
                left: `${10 + (i * 47) % 80}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.15, 0.5, 0.15],
              }}
              transition={{
                duration: 4 + (i % 3) * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo & Ring Center Stage */}
      <div className="relative flex flex-col items-center">
        {/* Outer dashed spinning ring */}
        <motion.div
          className="absolute -inset-8 rounded-full border border-dashed border-violet-500/25 pointer-events-none"
          style={{ transformOrigin: "center" }}
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />

        {/* Middle glowing dynamic gradient ring */}
        <motion.div
          className="absolute -inset-5 rounded-full border border-transparent border-t-cyan-500/40 border-b-violet-500/40 pointer-events-none"
          style={{ transformOrigin: "center" }}
          animate={shouldReduceMotion ? {} : { rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
        />

        {/* Soft glowing halo behind the logo */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-violet-600/10 blur-xl pointer-events-none"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        />

        {/* The Premium 'R' Logo */}
        <motion.div
          id="preloader-logo"
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl relative overflow-hidden select-none z-10"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.04, 1],
                  boxShadow: [
                    "0 4px 20px rgba(139, 92, 246, 0.25), 0 0 10px rgba(6, 182, 212, 0.15)",
                    "0 4px 30px rgba(139, 92, 246, 0.45), 0 0 20px rgba(6, 182, 212, 0.35)",
                    "0 4px 20px rgba(139, 92, 246, 0.25), 0 0 10px rgba(6, 182, 212, 0.15)",
                  ],
                }
          }
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          R

          {/* Shimmer effect gliding across the logo */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatDelay: 1.2 }}
            />
          )}
        </motion.div>
      </div>

      {/* Initializing Text with modern monospace typography */}
      <motion.div
        className="mt-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <span className="text-[11px] font-mono tracking-[0.25em] text-zinc-300 font-semibold uppercase">
          {t("razma.initializing")}
        </span>

        {/* Progress Bar Container */}
        <div className="w-52 h-[3px] bg-zinc-900/90 border border-zinc-800/40 rounded-full mt-5 relative overflow-hidden backdrop-blur-sm">
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-600 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Progress Percentage */}
        <span className="text-[10px] font-mono text-zinc-500 mt-2 tracking-widest">
          {progress}%
        </span>
      </motion.div>
    </motion.div>
  );
});
