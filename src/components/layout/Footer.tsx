import React from "react";
import portfolio from "../../../portfolio-context.json";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto py-8 bg-zinc-50 dark:bg-[#050505] border-t border-zinc-200 dark:border-zinc-900 text-center text-xs font-mono text-zinc-550 transition-colors">
      <p>© 2026 {portfolio.profile.name}. {t("footer.copy")}</p>
      <p className="text-[10px] text-zinc-400 mt-1 uppercase">{t("footer.tech")}</p>
    </footer>
  );
}
