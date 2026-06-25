import { useState, useEffect } from "react";
import { Project } from "../types/portfolio.types.ts";
import portfolio from "../../portfolio-context.json";

export function useRandomProjects() {
  const [desktopProject, setDesktopProject] = useState<Project | null>(null);
  const [webProject, setWebProject] = useState<Project | null>(null);
  const [mobileProject, setMobileProject] = useState<Project | null>(null);

  const rollRandomProjects = () => {
    const desktops = portfolio.projects.filter((p) => p.category === "desktop") as Project[];
    const webs = portfolio.projects.filter((p) => p.category === "web") as Project[];
    const mobiles = portfolio.projects.filter((p) => p.category === "mobile") as Project[];

    if (desktops.length) setDesktopProject(desktops[Math.floor(Math.random() * desktops.length)]);
    if (webs.length) setWebProject(webs[Math.floor(Math.random() * webs.length)]);
    if (mobiles.length) setMobileProject(mobiles[Math.floor(Math.random() * mobiles.length)]);
  };

  useEffect(() => {
    rollRandomProjects();
  }, []);

  return { desktopProject, webProject, mobileProject, rollRandomProjects };
}
