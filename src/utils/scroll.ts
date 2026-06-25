import React from "react";

export const handleScrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement> | null,
  sectionId: string,
  onPrepare?: () => void
) => {
  if (e) e.preventDefault();
  if (onPrepare) onPrepare();

  const delay = sectionId === "section-competences" ? 180 : 0;
  setTimeout(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 90; // offset spacing for a floating header
      const elementPosition = element.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, delay);
};
