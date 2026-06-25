import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { LucideIcon } from "lucide-react";

interface AnimatedInputProps {
  label: string;
  icon: LucideIcon;
  error?: string;
  register?: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
  [key: string]: any;
}

export function AnimatedInput({
  label,
  icon: Icon,
  error,
  register,
  type = "text",
  placeholder,
  ...props
}: AnimatedInputProps) {
  return (
    <div className="group relative flex flex-col w-full text-left">
      <label className="block text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 tracking-wider">
        {label}
      </label>
      
      <div className="relative flex items-center bg-zinc-50/5 dark:bg-zinc-950/20 backdrop-blur-[2px] rounded-t-xl overflow-hidden transition-all duration-300">
        {/* Left Aligned Icon */}
        <div className="absolute left-3 text-zinc-400 group-hover:text-cyan-500 group-focus-within:text-indigo-500 transition-colors duration-300">
          <Icon className="w-4 h-4" />
        </div>

        {/* Input element without side/top borders, only bottom */}
        <input
          type={type}
          placeholder={placeholder}
          {...(register || {})}
          {...props}
          className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400/75 dark:placeholder-zinc-500/75 border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-0 transition-all font-sans relative z-10"
        />

        {/* Dynamic Glow and Border Bottom animation (expands left to right) */}
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100 z-20" />
      </div>

      {/* Focus Glow Background */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/3 to-indigo-500/3 opacity-0 group-focus-within:opacity-100 transition-all duration-500 pointer-events-none -z-10 blur-md" />

      {/* Structured Validation Error */}
      {error && (
        <span className="text-[10px] text-rose-500 font-mono mt-1 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}
