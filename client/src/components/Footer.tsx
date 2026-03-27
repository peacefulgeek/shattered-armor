/*
 * Footer — Newspaper Broadsheet Footer
 * Kintsugi Broadsheet: Gold rules, editorial info, disclaimer
 */

import { Link } from "wouter";
import { SITE, CATEGORIES } from "@/lib/articles";

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="gold-rule-thick" />
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg mb-3" style={{ fontFamily: 'var(--font-serif)' }}>{SITE.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{SITE.tagline}</p>
            <p className="text-sm text-muted-foreground mt-3">
              By <a href={SITE.authorLink} className="underline decoration-gold underline-offset-2 hover:text-foreground transition-colors">{SITE.author}</a>, {SITE.authorTitle}
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-lg mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Pages */}
          <div>
            <h3 className="text-lg mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">About</Link></li>
              <li><Link href="/where-am-i" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Where Am I Right Now?</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="gold-rule mt-8 mb-6" />

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
          {SITE.disclaimer}
        </p>

        <p className="text-xs text-muted-foreground text-center mt-4">
          &copy; {new Date().getFullYear()} {SITE.editorial}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
