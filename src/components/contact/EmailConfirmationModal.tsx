import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Loader2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext.tsx";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onChangeEmail: (email: string) => void;
  onConfirm: () => Promise<void>;
  isSending: boolean;
}

export function EmailConfirmationModal({
  isOpen,
  onClose,
  email,
  onChangeEmail,
  onConfirm,
  isSending,
}: EmailConfirmationModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-md p-6 relative z-50 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              {t("contact.emailConfirmTitle")}
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-2 leading-relaxed text-left">
              {t("contact.emailConfirmDesc")}
            </p>

            <div className="mt-4 text-left">
              <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide mb-1">
                {t("contact.emailConfirmLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => onChangeEmail(e.target.value)}
                placeholder={t("contact.emailConfirmPlaceholder")}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-all font-sans cursor-pointer"
              >
                {t("contact.emailConfirmCancel")}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSending}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold font-sans transition-all disabled:opacity-55 cursor-pointer"
              >
                {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t("contact.emailConfirmConfirm")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
