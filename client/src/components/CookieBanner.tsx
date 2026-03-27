/*
 * CookieBanner — Minimal cookie consent banner
 * Kintsugi Broadsheet: Slate bar, gold accent
 */

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sa-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("sa-cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3"
      style={{
        background: "oklch(0.25 0.02 250)",
        color: "oklch(0.90 0.01 85)",
        fontFamily: "var(--font-sans)",
        fontSize: "0.85rem",
      }}
    >
      <p className="text-center sm:text-left">
        This site uses essential cookies for functionality. No advertising cookies. No tracking across sites.{" "}
        <a href="/privacy" className="underline" style={{ color: "var(--color-gold)" }}>
          Privacy Policy
        </a>
      </p>
      <button
        onClick={accept}
        className="shrink-0 px-5 py-1.5 text-xs uppercase tracking-widest font-bold transition-colors"
        style={{
          background: "var(--color-gold)",
          color: "oklch(0.25 0.02 250)",
        }}
      >
        Accept
      </button>
    </div>
  );
}
