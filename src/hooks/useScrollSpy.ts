import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], activeOffset: number = 120): string {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (ids.length === 0) return;

    const handleScroll = () => {
      // Find the heading that is currently closest to or just above the threshold
      let currentActiveId = "";
      
      // We search from top to bottom, finding the last heading that is above our threshold
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // rect.top is relative to the viewport
          // We want headings that have scrolled past the threshold (e.g. 120px from top)
          if (rect.top <= activeOffset) {
            currentActiveId = id;
          }
        }
      }

      // Fallback to first if none are past the threshold yet
      if (!currentActiveId && ids.length > 0) {
        currentActiveId = ids[0];
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on load/update
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ids, activeOffset]);

  return activeId;
}
