import React from "react";
import { ServiceCard } from "./ServiceCard.tsx";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

export function ServicesSection() {
  const { t, dict } = useLanguage();

  return (
    <section id="section-services" className="py-20 bg-zinc-100/50 dark:bg-zinc-900/10 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          {/* <span className="text-[10px] font-mono font-bold tracking-widest text-[#6366f1] uppercase">
            {t("services.title")}
          </span> */}
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            {t("services.bentoHeader")}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dict.services.list.map((service, idx) => (
            <ServiceCard
              key={idx}
              title={service.title}
              description={service.description}
              iconName={service.iconName}
              colorClass={service.colorClass}
              iconColorClass={service.iconColorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
