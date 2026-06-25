import React from "react";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { List } from "lucide-react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface DocsTocProps {
  headings: HeadingItem[];
}

export default function DocsToc({ headings }: DocsTocProps) {
  // Extract all heading IDs for Scroll Spy tracking
  const headingIds = headings.map(h => h.id);
  const activeId = useScrollSpy(headingIds);

  if (headings.length <= 1) {
    return null;
  }

  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      // Offset of 90px to account for the sticky top navigation bar
      window.scrollTo({
        top: absoluteTop - 90,
        behavior: "smooth"
      });
      
      // Update browser URL hash in a friendly way
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <aside className="hidden xl:block w-64 shrink-0 h-[calc(100vh-80px)] sticky top-20 py-8 px-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 dark:text-zinc-500 font-sans">
        <List className="w-4 h-4 text-cyan-500/80" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Sur cette page
        </span>
      </div>

      <div className="relative border-l border-zinc-150 dark:border-zinc-850/80 ml-2 pl-3 py-1 space-y-2.5">
        {headings.map((heading, index) => {
          const isActive = heading.id === activeId;
          const isL3 = heading.level === 3;
          const isL4 = heading.level >= 4;
          
          // Detect tree structure styling
          // Find out if this level 3 heading is the last level 3 before the next level 2 or end
          let treePrefix = "";
          if (isL3) {
            let isLastInBranch = true;
            for (let i = index + 1; i < headings.length; i++) {
              if (headings[i].level === 2) {
                break; // A new level 2 started, so this is indeed the last level 3 in its branch
              }
              if (headings[i].level === 3) {
                isLastInBranch = false; // Another level 3 follows, not the last
                break;
              }
            }
            treePrefix = isLastInBranch ? "└─ " : "├─ ";
          }

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleHeadingClick(e, heading.id)}
              className={`block text-xs font-sans transition-all leading-normal cursor-pointer relative ${
                isL3 ? "pl-2 text-[11px]" : isL4 ? "pl-4 text-[10px]" : "font-medium"
              } ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 font-semibold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-200"
              }`}
            >
              {/* Highlight Dot indicator on the left border */}
              {isActive && (
                <span className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 border border-white dark:border-[#070707]" />
              )}
              
              {isL3 && (
                <span className="font-mono text-zinc-350 dark:text-zinc-700 select-none mr-0.5">
                  {treePrefix}
                </span>
              )}
              {isL4 && (
                <span className="font-mono text-zinc-350 dark:text-zinc-750 select-none mr-1">
                  • 
                </span>
              )}
              
              <span className="inline-block truncate max-w-full">
                {heading.text}
              </span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
