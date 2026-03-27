/*
 * Home — Newspaper Broadsheet Homepage
 * 3-column grid, featured article, category sections, email capture
 */

import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import EmailCapture from "@/components/EmailCapture";
import SEOHead from "@/components/SEOHead";
import { SITE, CATEGORIES, isPublished, type ArticleIndex } from "@/lib/articles";
import articlesIndex from "@/data/articles-index.json";

export default function Home() {
  const published = useMemo(() => {
    return (articlesIndex as ArticleIndex[])
      .filter(a => isPublished(a.dateISO))
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, []);

  const featured = published[0];
  const recent = published.slice(1, 7);
  const rest = published.slice(7, 19);

  // Group by category for section display
  const byCategory = useMemo(() => {
    const map: Record<string, ArticleIndex[]> = {};
    for (const cat of CATEGORIES) {
      map[cat.slug] = published.filter(a => a.category === cat.slug).slice(0, 4);
    }
    return map;
  }, [published]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.domain,
    author: {
      "@type": "Person",
      name: SITE.author,
      url: SITE.authorLink,
      jobTitle: SITE.authorTitle,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.editorial,
      url: SITE.domain,
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        description={SITE.tagline}
        ogImage={`${SITE.cdnBase}/images/og-site.webp`}
        canonical={SITE.domain}
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1">
        {/* Featured + Recent Grid */}
        <section className="container py-8">
          <div className="broadsheet-grid">
            {/* Featured article spans 2 columns */}
            {featured && <ArticleCard article={featured} featured />}

            {/* Recent articles */}
            {recent.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Email Capture */}
        <EmailCapture />

        {/* More Articles Grid */}
        {rest.length > 0 && (
          <section className="container py-8">
            <div className="gold-rule-thick mb-6" />
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>More Reading</h2>
            <div className="broadsheet-grid">
              {rest.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        {CATEGORIES.map(cat => {
          const catArticles = byCategory[cat.slug];
          if (!catArticles || catArticles.length === 0) return null;
          return (
            <section key={cat.slug} className="container py-8">
              <div className="gold-rule-thick mb-4" />
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>{cat.name}</h2>
                <a href={`/category/${cat.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider no-underline" style={{ fontFamily: 'var(--font-sans)' }}>
                  View All &rarr;
                </a>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{cat.description}</p>
              <div className="broadsheet-grid">
                {catArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
