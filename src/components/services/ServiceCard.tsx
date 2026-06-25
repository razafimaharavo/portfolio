import React from "react";
import * as Icons from "lucide-react";

interface ServiceCardProps {
  key?: React.Key;
  title: string;
  description: string;
  iconName: string; // "Laptop" | "Cpu" | "Smartphone" | "Code2" | "Compass" | "FolderOpen"
  colorClass: string; // bg & border styling colors
  iconColorClass: string; // text styling colors
}

export function ServiceCard({
  title,
  description,
  iconName,
  colorClass,
  iconColorClass,
}: ServiceCardProps) {
  // Safe dynamic lucide-react icon component resolution
  const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;

  return (
    <div className="portfolio-glass-card group relative p-6 overflow-hidden text-left hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-lg transition-all duration-300">
      {/* Accentuated Flow Border Path Lines - Activated synchronously on hover/focus */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none rounded-3xl ${iconColorClass}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 100,0 L 100,100 L 0,100"
          fill="none"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          className="stroke-current opacity-0 service-card-path-1"
        />
        <path
          d="M 0,100 L 0,0 L 100,0"
          fill="none"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          className="stroke-current opacity-0 service-card-path-2"
        />
      </svg>

      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colorClass} ${iconColorClass}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-sans">
          {description}
        </p>
      </div>
    </div>
  );
}
