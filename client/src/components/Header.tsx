/*
 * Header — Newspaper Broadsheet Masthead
 * Kintsugi Broadsheet: Charter serif banner, date line, gold hairline rules
 */

import { Link, useLocation } from "wouter";
import { SITE, CATEGORIES } from "@/lib/articles";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-cream border-b border-border">
      {/* Top dateline */}
      <div className="container">
        <div className="flex justify-between items-center py-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          <span>{today}</span>
          <a href={SITE.authorLink} className="hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>
            By {SITE.author}
          </a>
        </div>
      </div>

      {/* Gold rule */}
      <div className="gold-rule-thick" />

      {/* Masthead */}
      <div className="container py-6 text-center">
        <Link href="/" className="no-underline">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'oklch(0.25 0.02 250)', letterSpacing: '-0.02em' }}
          >
            {SITE.name}
          </h1>
        </Link>
        <p className="mt-2 text-sm md:text-base tracking-widest uppercase" style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.55 0.015 250)', letterSpacing: '0.15em' }}>
          {SITE.subtitle}
        </p>
      </div>

      {/* Gold rule */}
      <div className="gold-rule-thick" />

      {/* Navigation */}
      <nav className="container">
        {/* Desktop nav */}
        <div className="hidden md:flex justify-center items-center gap-1 py-3">
          <Link href="/" className={`px-4 py-1.5 text-sm uppercase tracking-wider transition-colors no-underline ${location === '/' ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`} style={{ fontFamily: 'var(--font-sans)' }}>
            Home
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`px-4 py-1.5 text-sm uppercase tracking-wider transition-colors no-underline ${location === `/category/${cat.slug}` ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/about" className={`px-4 py-1.5 text-sm uppercase tracking-wider transition-colors no-underline ${location === '/about' ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`} style={{ fontFamily: 'var(--font-sans)' }}>
            About
          </Link>
          <Link href="/where-am-i" className={`px-4 py-1.5 text-sm uppercase tracking-wider transition-colors no-underline ${location === '/where-am-i' ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`} style={{ fontFamily: 'var(--font-sans)' }}>
            Where Am I?
          </Link>
        </div>

        {/* Mobile nav toggle */}
        <div className="md:hidden flex justify-between items-center py-3">
          <span className="text-sm uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-sans)' }}>Menu</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm uppercase tracking-wider no-underline text-foreground">Home</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm uppercase tracking-wider no-underline text-muted-foreground">
                {cat.name}
              </Link>
            ))}
            <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm uppercase tracking-wider no-underline text-muted-foreground">About</Link>
            <Link href="/where-am-i" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm uppercase tracking-wider no-underline text-muted-foreground">Where Am I?</Link>
          </div>
        )}
      </nav>

      {/* Bottom gold rule */}
      <div className="gold-rule-solid" />
    </header>
  );
}
