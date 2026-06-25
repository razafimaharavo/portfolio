import { useState, useEffect } from "react";

export function useActiveSection(triggerDependency?: any) {
  const [activeSection, setActiveSection] = useState("section-hero");

  useEffect(() => {
    const sections = [
      "section-hero",
      "about-profile",
      "section-competences",
      "portofolio-projects",
      "section-services",
      "section-contact",
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [triggerDependency]);

  return activeSection;
}
