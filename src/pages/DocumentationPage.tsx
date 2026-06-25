import React, { useEffect, useState } from "react";
import { getDocsList, getDocContent, DocItem, DocContent } from "../utils/docsLoader";
import DocsSidebar from "../components/docs/DocsSidebar";
import DocsToc from "../components/docs/DocsToc";
import MarkdownRenderer from "../components/docs/MarkdownRenderer";
import { useTheme } from "../hooks/useTheme";
import { 
  ArrowLeft, 
  Menu, 
  Sun, 
  Moon, 
  Loader2, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function DocumentationPage() {
  const { theme, setTheme } = useTheme();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("README");
  const [activeContent, setActiveContent] = useState<DocContent | null>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  
  // Loading & Error States
  const [listLoading, setListLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile Sidebar Drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Fetch documents list on mount
  useEffect(() => {
    async function loadList() {
      try {
        setListLoading(true);
        const list = await getDocsList();
        setDocuments(list);
        
        // If there's a hash in the URL or search parameter, try to match it
        const hash = window.location.hash.replace("#", "");
        const queryParams = new URLSearchParams(window.location.search);
        const docParam = queryParams.get("doc");
        
        if (docParam && list.some(d => d.id === docParam)) {
          setActiveDocId(docParam);
        } else if (list.length > 0) {
          // If README exists in the list, default to it, else use the first one
          const hasReadme = list.some(d => d.id === "README");
          setActiveDocId(hasReadme ? "README" : list[0].id);
        }
      } catch (err: any) {
        console.error("Error loading docs list:", err);
        setError("Impossible de charger la structure de la documentation.");
      } finally {
        setListLoading(false);
      }
    }
    loadList();
  }, []);

  // 2. Fetch active document content when activeDocId changes
  useEffect(() => {
    if (!activeDocId) return;
    
    async function loadContent() {
      try {
        setContentLoading(true);
        const doc = await getDocContent(activeDocId);
        setActiveContent(doc);
        
        // Push state to update the URL query parameter smoothly
        const url = new URL(window.location.href);
        url.searchParams.set("doc", activeDocId);
        window.history.replaceState(null, "", url.toString());
        
        // Scroll content area back to top on document change
        window.scrollTo({ top: 0 });
      } catch (err: any) {
        console.error(`Error loading doc ${activeDocId}:`, err);
        setError(`Erreur lors de l'accès au guide "${activeDocId}".`);
      } finally {
        setContentLoading(false);
      }
    }
    
    loadContent();
  }, [activeDocId]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`min-h-screen ${theme} bg-zinc-50 dark:bg-[#070707] text-zinc-800 dark:text-zinc-150 transition-colors duration-300 flex flex-col font-sans`}>
      
      {/* 1. Header Navbar */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-zinc-200/80 dark:border-zinc-900 bg-white/80 dark:bg-[#070707]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-450 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Home Link Back Button */}
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-zinc-100 transition-all group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800 group-hover:border-zinc-350 dark:group-hover:border-zinc-700 bg-white dark:bg-zinc-900 transition-all">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="hidden sm:inline">Portfolio</span>
          </a>

          {/* Breadcrumb separator */}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-350 dark:text-zinc-700 hidden sm:block" />

          {/* Active Manual Title */}
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-medium text-xs sm:text-sm">
            <span className="text-zinc-400 dark:text-zinc-550 hidden md:inline">Docs</span>
            <span className="text-zinc-300 dark:text-zinc-800 hidden md:inline">/</span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 truncate max-w-[150px] sm:max-w-[250px]">
              {activeContent ? activeContent.title : "Chargement..."}
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-850 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-sm bg-white dark:bg-[#0b0b0b]"
            title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main Docs Content & Sidebars Layout */}
      <div className="flex flex-1 w-full max-w-[90rem] mx-auto">
        
        {/* Left Document Structure Navigation */}
        <DocsSidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Central Article Container */}
        <main className="flex-1 min-w-0 px-4 py-8 md:px-8 lg:px-12 xl:px-16 pb-24">
          
          {/* List Loader overlay */}
          {listLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                Indexation des guides techniques...
              </p>
            </div>
          ) : error ? (
            <div className="p-5 my-6 rounded-xl border border-red-200/60 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 text-red-700 dark:text-red-400 flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="font-semibold font-sans mb-1">Erreur de chargement</h4>
                <p className="text-xs leading-relaxed opacity-90">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs underline font-semibold cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <article className="max-w-4xl mx-auto">
              
              {/* Technical Article Header metadata card */}
              {activeContent && (
                <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100/40 dark:bg-zinc-900/20 px-4 py-2 rounded-lg border border-zinc-200/30 dark:border-zinc-800/40">
                  <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> MD DOCS ENGINE
                  </span>
                  <span className="text-zinc-250 dark:text-zinc-800">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Juin 2026
                  </span>
                  <span className="text-zinc-250 dark:text-zinc-800">•</span>
                  <span>ID: {activeContent.id}.md</span>
                </div>
              )}

              {/* Dynamic Content area */}
              {contentLoading ? (
                <div className="space-y-6 py-6 animate-pulse">
                  <div className="h-9 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                  <div className="h-4 w-1/4 bg-zinc-150 dark:bg-zinc-850 rounded-lg" />
                  <div className="space-y-3 mt-8">
                    <div className="h-4 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                    <div className="h-4 w-11/12 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                    <div className="h-4 w-10/12 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                  </div>
                  <div className="h-40 w-full bg-zinc-200/30 dark:bg-zinc-800/30 rounded-xl mt-8" />
                </div>
              ) : activeContent ? (
                <MarkdownRenderer
                  content={activeContent.content}
                  onHeadingsDetected={setHeadings}
                />
              ) : (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-550 text-sm">
                  Sélectionnez un document pour commencer la lecture
                </div>
              )}
            </article>
          )}
        </main>

        {/* Right Hierarchy Sub-navigation Table of Contents */}
        <DocsToc headings={headings} />

      </div>
    </div>
  );
}
