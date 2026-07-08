import React from "react";
import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import { User, Mail, FileText, MessageSquare } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.tsx";
import { AnimatedInput } from "./AnimatedInput.tsx";
import { AnimatedTextarea } from "./AnimatedTextarea.tsx";

export interface ContactFormData {
  name: string;
  senderEmail: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  register: UseFormRegister<ContactFormData>;
  handleSubmit: UseFormHandleSubmit<ContactFormData>;
  onValidate: (data: ContactFormData) => void;
  errors: FieldErrors<ContactFormData>;
}

export function ContactForm({
  register,
  handleSubmit,
  onValidate,
  errors,
}: ContactFormProps) {
  const { t } = useLanguage();

  return (
    <form onSubmit={handleSubmit(onValidate)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <AnimatedInput
          label={t("contact.nameLabel")}
          icon={User}
          type="text"
          placeholder={t("contact.name")}
          register={register("name")}
          error={errors.name?.message}
        />

        <AnimatedInput
          label={t("contact.emailLabel")}
          icon={Mail}
          type="email"
          placeholder={t("contact.email")}
          register={register("senderEmail")}
          error={errors.senderEmail?.message}
        />
      </div>

      <AnimatedInput
        label={t("contact.subjectLabel")}
        icon={FileText}
        type="text"
        placeholder={t("contact.subject")}
        register={register("subject")}
        error={errors.subject?.message}
      />

      <AnimatedTextarea
        label={t("contact.messageLabel")}
        icon={MessageSquare}
        placeholder={t("contact.message")}
        rows={5}
        register={register("message")}
        error={errors.message?.message}
      />

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono transition-all uppercase tracking-wider select-none active:scale-98 cursor-pointer"
      >
        {t("contact.send")}
      </button>
    </form>
  );
}

