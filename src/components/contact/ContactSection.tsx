import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import {
  CheckCircle,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Terminal,
} from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm.tsx";
import { EmailConfirmationModal } from "./EmailConfirmationModal.tsx";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

export function ContactSection() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<ContactFormData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [mailResult, setMailResult] = useState<{
    success: boolean;
    previewUrl?: string;
    message?: string;
  } | null>(null);
  const { t, language } = useLanguage();

  const contactSchema = z.object({
    name: z.string().min(2, t("contact.validationName")),
    senderEmail: z.string().email(t("contact.validationEmail")),
    subject: z.string().min(3, t("contact.validationSubject")),
    message: z.string().min(20, t("contact.validationMsg")),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      senderEmail: "",
      subject: "",
      message: "",
    },
  });

  const currentEmail = watch("senderEmail");

  const onFormValidate = (data: ContactFormData) => {
    setPendingFormData(data);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmEmailSubmit = async () => {
    if (!pendingFormData) return;
    setIsSending(true);
    setMailResult(null);

    try {
      const body = new URLSearchParams({
        name: pendingFormData.name,
        senderEmail: pendingFormData.senderEmail,
        subject: pendingFormData.subject,
        message: pendingFormData.message,
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!data) {
        throw new Error(t("contact.errorMessage"));
      }

      if (response.ok && data.success) {
        setMailResult({
          success: true,
          message: t("contact.successMessage"),
          previewUrl: data.previewUrl,
        });
        reset();
        setPendingFormData(null);
        setIsSubmitModalOpen(false);
      } else {
        throw new Error(data.error || "Mail transmission failed");
      }
    } catch (err: any) {
      console.error(err);
      setMailResult({
        success: false,
        message: err?.message || t("contact.errorMessage"),
      });
      setIsSubmitModalOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="section-contact"
      className="py-20 bg-zinc-50/50 dark:bg-zinc-900/5 max-w-5xl mx-auto px-4 w-full"
    >
      <div className="portfolio-glass-card p-6 md:p-10">
        <div className="grid grid-cols-1  items-stretch">
          {/* Left Column: Creative Profile Information Card */}
          {/* <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/60 dark:border-zinc-800/60 pb-8 md:pb-0 md:pr-8 text-left">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-indigo-600 flex items-center justify-center text-white text-lg font-mono font-bold shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/5">
                  RM
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-zinc-900 dark:text-white leading-tight">
                    Marion Brunel R.
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    Développeur Full Stack
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 md:py-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  {t("contact.statusAvailable")}
                </div>
              </div>

              <div className="space-y-3.5 my-6 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <a href="mailto:razafimaharavomarion@gmail.com" className="hover:text-indigo-500 transition-colors">
                    razafimaharavomarion@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{t("contact.location")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Razma IA Integration Expert</span>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-8 pt-6 border-t border-zinc-150 dark:border-zinc-800/50">
              <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#6366f1] uppercase mb-3">
                {t("contact.expertiseLabel")}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {["React & TS", "Node.js & APIs", "Architectures Web", "IA & Solutions"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200/50 dark:border-zinc-800/30"
                  >
                    <Terminal className="w-3 h-3 text-cyan-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div> */}

          {/* Right Column: Contact Form with Header */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                  {t("contact.badge")}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
                  {t("contact.title")}
                </h2>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {t("contact.subtitle")}
                </p>
              </div>

              {mailResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border mb-6 text-xs font-mono ${
                    mailResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {mailResult.success
                        ? t("contact.successLabel")
                        : t("contact.errorLabel")}
                    </span>
                  </div>
                  <p className="font-sans text-left">{mailResult.message}</p>
                  {mailResult.previewUrl && (
                    <div className="mt-3 p-3 bg-zinc-900 rounded-lg text-white border border-zinc-800 text-left">
                      <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider font-bold mb-1">
                        {t("contact.testEnv")}
                      </p>
                      <a
                        href={mailResult.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {t("contact.openInbox")}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}

              <ContactForm
                register={register}
                handleSubmit={handleSubmit}
                onValidate={onFormValidate}
                errors={errors}
              />
            </div>
          </div>
        </div>
      </div>

      <EmailConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        email={currentEmail}
        onChangeEmail={(val) => setValue("senderEmail", val)}
        onConfirm={handleConfirmEmailSubmit}
        isSending={isSending}
      />
    </section>
  );
}
