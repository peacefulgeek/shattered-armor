/*
 * EmailCapture — Newsletter signup component
 * Kintsugi Broadsheet: Gold accent, Charter heading
 */

import { useState } from "react";
import { SITE } from "@/lib/articles";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Store in localStorage for now (would connect to email service in production)
      const subscribers = JSON.parse(localStorage.getItem('sa-subscribers') || '[]');
      subscribers.push({ email, date: new Date().toISOString() });
      localStorage.setItem('sa-subscribers', JSON.stringify(subscribers));
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="py-10 px-6 text-center" style={{ background: 'oklch(0.97 0.01 85)' }}>
        <div className="gold-rule-thick mb-6" />
        <h3 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Welcome</h3>
        <p className="text-muted-foreground">You'll receive new articles as they're published. No spam, no fluff — just the work that matters.</p>
        <div className="gold-rule-thick mt-6" />
      </div>
    );
  }

  return (
    <div className="py-10 px-6" style={{ background: 'oklch(0.97 0.01 85)' }}>
      <div className="gold-rule-thick mb-6" />
      <div className="max-w-lg mx-auto text-center">
        <h3 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          The Armor Drops Here
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          New articles on C-PTSD recovery, nervous system regulation, and the long road back to embodied presence. By <a href={SITE.authorLink} className="underline decoration-gold">{SITE.author}</a>.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-2.5 text-sm border border-border bg-white focus:outline-none focus:border-gold transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
          <button
            type="submit"
            className="px-6 py-2.5 text-sm uppercase tracking-wider font-bold text-white transition-colors"
            style={{ background: 'oklch(0.50 0.02 250)', fontFamily: 'var(--font-sans)' }}
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
      </div>
      <div className="gold-rule-thick mt-6" />
    </div>
  );
}
