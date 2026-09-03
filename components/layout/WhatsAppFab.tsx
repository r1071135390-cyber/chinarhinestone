"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const PHONE = "8613764593988";
const MSG = encodeURIComponent(
  "Hello, I'd like to inquire about your custom heat transfer services."
);

export function WhatsAppFab() {
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 首次访问 3 秒后弹出"有问题？联系我们"小提示
    if (typeof window !== "undefined" && !sessionStorage.getItem("wa-hint-shown")) {
      const t = setTimeout(() => {
        setShowHint(true);
        sessionStorage.setItem("wa-hint-shown", "1");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
      aria-label="Contact us on WhatsApp"
    >
      {/* 气泡提示 — 首次访问显示一次 */}
      {showHint && !dismissed && (
        <div className="relative max-w-[240px] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-0.5 text-white hover:bg-slate-600"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="font-semibold">Questions? Chat with us</p>
          <p className="mt-0.5 text-xs text-slate-300">
            We typically reply in under 2 hours.
          </p>
          <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-slate-900" />
        </div>
      )}

      {/* 按钮 */}
      <a
        href={`https://wa.me/${PHONE}?text=${MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe57] sm:px-5"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp Us</span>
      </a>
    </div>
  );
}
