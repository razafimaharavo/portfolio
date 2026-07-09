import React, { useState } from "react";
import portfolio from "../portfolio-context.json";
import { Project } from "./types.ts";

import ProjectDetailModal from "./components/ProjectDetailModal.tsx";
import RazmaAssistant from "./components/RazmaAssistant.tsx";

import { Header } from "./components/layout/Header.tsx";
import { HeroSection } from "./components/layout/HeroSection.tsx";
import { AboutSection } from "./components/about/AboutSection.tsx";
import { ProjectsSection } from "./components/portfolio/ProjectsSection.tsx";
import { ServicesSection } from "./components/services/ServicesSection.tsx";
import { ContactSection } from "./components/contact/ContactSection.tsx";
import { Footer } from "./components/layout/Footer.tsx";
import { InteractiveNetworkBackground } from "./components/layout/InteractiveNetworkBackground.tsx";

import { useTheme } from "./hooks/useTheme.ts";
import { useWeather } from "./hooks/useWeather.ts";
import { useActiveSection } from "./hooks/useActiveSection.ts";
import { useRandomProjects } from "./hooks/useRandomProjects.ts";
import { usePageLoading } from "./hooks/usePageLoading.ts";

import { Preloader } from "./components/common/Preloader.tsx";
import { motion } from "motion/react";

import { handleScrollToSection } from "./utils/scroll.ts";
import DocumentationPage from "./pages/DocumentationPage.tsx";

export default function App() {
  const isDocsPage = window.location.pathname === "/docs" || window.location.pathname.startsWith("/docs");
  if (isDocsPage) {
    return <DocumentationPage />;
  }

  // Preloader Management
  const { progress, isLoading, isExiting } = usePageLoading(1200);

  // Theme Management
  const { theme, setTheme } = useTheme();

  // Weather lookup sync
  const { weather, weatherLoading, weatherError, requestWeather } = useWeather();

  // Collapses states
  const [openDiplomes, setOpenDiplomes] = useState(false);
  const [openFormations, setOpenFormations] = useState(false);
  const [openExperiences, setOpenExperiences] = useState(false);
  const [openCompetences, setOpenCompetences] = useState(false);

  // Wrapped states for professional accordion (only one can be open at a time)
  const handleSetOpenDiplomes = (val: boolean) => {
    setOpenDiplomes(val);
    if (val) {
      setOpenFormations(false);
      setOpenExperiences(false);
      setOpenCompetences(false);
    }
  };

  const handleSetOpenFormations = (val: boolean) => {
    setOpenFormations(val);
    if (val) {
      setOpenDiplomes(false);
      setOpenExperiences(false);
      setOpenCompetences(false);
    }
  };

  const handleSetOpenExperiences = (val: boolean) => {
    setOpenExperiences(val);
    if (val) {
      setOpenDiplomes(false);
      setOpenFormations(false);
      setOpenCompetences(false);
    }
  };

  const handleSetOpenCompetences = (val: boolean) => {
    setOpenCompetences(val);
    if (val) {
      setOpenDiplomes(false);
      setOpenFormations(false);
      setOpenExperiences(false);
    }
  };

  // Section Tracking via Intersection Observer using competence state as layout shifter trigger
  const activeSection = useActiveSection(openCompetences);

  // Random Portfolios
  const { desktopProject, webProject, mobileProject, rollRandomProjects } = useRandomProjects();

  // Selected project for detailed modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Voice Assistant state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Navigation Callback matching speech prompt keywords
  const handleNavAction = (action: string) => {
    console.log("Nav action triggered:", action);
    switch (action) {
      case "scroll_diplomes":
        handleSetOpenDiplomes(true);
        setTimeout(() => {
          document.getElementById("section-diplomes")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        break;
      case "scroll_formations":
        handleSetOpenFormations(true);
        setTimeout(() => {
          document.getElementById("section-formations")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        break;
      case "scroll_experiences":
        handleSetOpenExperiences(true);
        setTimeout(() => {
          document.getElementById("section-experiences")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        break;
      case "scroll_competences":
        handleSetOpenCompetences(true);
        setTimeout(() => {
          document.getElementById("section-competences")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        break;
      case "scroll_desktop_projets":
        document.getElementById("section-desktop-projets")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "scroll_web_projets":
        document.getElementById("section-web-projets")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "scroll_mobile_projets":
        document.getElementById("section-mobile-projets")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "scroll_services":
        document.getElementById("section-services")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "scroll_contact":
        document.getElementById("section-contact")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
    }
  };

  return (
    <>
      {isLoading && (
        <Preloader progress={progress} isExiting={isExiting} />
      )}

      <div className={`min-h-screen ${theme} bg-zinc-50/50 dark:bg-[#050505]/40 text-zinc-800 dark:text-zinc-100 transition-all duration-500 ease-in-out flex flex-col font-sans ${isAssistantOpen ? "lg:pr-[384px]" : "lg:pr-0"}`}>
        
        {/* Three.js 3D Animated Background */}
        <InteractiveNetworkBackground theme={theme} />

      {/* Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        activeSection={activeSection}
        onScrollToSection={(e, id) => handleScrollToSection(e, id, () => id === "section-competences" && handleSetOpenCompetences(true))}
      />

      {/* Hero */}
      <HeroSection
        onScrollToSection={(e, id) => handleScrollToSection(e, id)}
      />

      {/* About Accordion Bento */}
      <AboutSection
        openDiplomes={openDiplomes}
        setOpenDiplomes={handleSetOpenDiplomes}
        openFormations={openFormations}
        setOpenFormations={handleSetOpenFormations}
        openExperiences={openExperiences}
        setOpenExperiences={handleSetOpenExperiences}
        openCompetences={openCompetences}
        setOpenCompetences={handleSetOpenCompetences}
      />

      {/* Portfolio Bento */}
      <ProjectsSection
        desktopProject={desktopProject}
        webProject={webProject}
        mobileProject={mobileProject}
        onRollRandomProjects={rollRandomProjects}
        onSelectProject={(project) => setSelectedProject(project)}
      />

      {/* Services Bento */}
      <ServicesSection />

      {/* Contact Form */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Modal Detail Project */}
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Real-time Assistant Voice panel */}
      <RazmaAssistant
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
        onExecuteAction={handleNavAction}
        theme={theme}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        onRequestWeather={requestWeather}
      />

      </div>
    </>
  );
}
