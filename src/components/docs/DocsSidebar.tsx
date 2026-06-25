import React, { useState } from "react";
import { DocItem } from "../../utils/docsLoader";
import { FileText, Menu, X, Search, ChevronRight, BookOpen } from "lucide-react";

interface DocsSidebarProps {
  documents: DocItem[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsSidebar({
  documents,
  activeDocId,
  onSelectDoc,
  isOpen,
  onClose,
}: DocsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocClick = (id: string) => {
    onSelectDoc(id);
    onClose(); // Close drawer on mobile after clicking
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#070707] border-r border-zinc-200/80 dark:border-zinc-850">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#0b0b0b]/40">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-sm tracking-wide uppercase text-zinc-800 dark:text-zinc-100 font-sans">
            Documentation
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            Marion Portfolio
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-transparent">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Document Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-900">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Guides & Manuels ({filteredDocs.length})
          </span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="px-3 py-4 text-xs text-center text-zinc-400 dark:text-zinc-500 font-sans">
            Aucun document trouvé
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => handleDocClick(doc.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs font-sans transition-all cursor-pointer group relative ${
                  isActive
                    ? "bg-cyan-500/5 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {/* Vertical Active Line Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-cyan-500 dark:bg-cyan-400" />
                )}

                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"
                    }`}
                  />
                  <span className="truncate">{doc.title}</span>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all ${
                    isActive ? "text-cyan-500 opacity-100" : "text-zinc-350 dark:text-zinc-600"
                  }`}
                />
              </button>
            );
          })
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-[#0a0a0a]/30">
        <a
          href="/"
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 text-center text-xs font-medium text-zinc-650 dark:text-zinc-350 hover:text-zinc-800 dark:hover:text-white transition-all shadow-sm"
        >
          Retour au Portfolio
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop - Fixed */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 border-r border-zinc-200 dark:border-zinc-850 z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile - Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs lg:hidden z-40 transition-opacity"
        />
      )}

      {/* Sidebar Mobile - Drawer Pane */}
      <div
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-[#070707] z-50 transform lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-4 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 z-50 shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="h-full">{sidebarContent}</div>
      </div>
    </>
  );
}
