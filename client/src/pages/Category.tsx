/*
 * Category Page — Lists all articles in a category
 * Newspaper broadsheet 3-column grid
 */

import { useMemo } from "react";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SEOHead from "@/components/SEOHead";
import { SITE, CATEGORIES, isPublished, type ArticleIndex } from "@/lib/articles";
import articlesIndex from "@/data/articles-index.json";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();

  const category = useMemo(() => CATEGORIES.find(c => c.slug === slug), [slug]);

  const articles = useMemo(() => {
    return (articlesIndex as ArticleIndex[])
      .filter(a => a.category === slug && isPublished(a.dateISO))
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [slug]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Category Not Found</h1>
          <Link href="/" className="text-sm uppercase tracking-wider underline decoration-gold">Return Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title={category.name}
        description={category.description}
        canonical={`${SITE.domain}/category/${category.slug}`}
      />
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>{category.name}</h1>
            <p className="text-muted-foreground leading-relaxed">{category.description}</p>
          </div>

          <div className="gold-rule-thick my-6" />

          <p className="text-sm text-muted-foreground mb-6">{articles.length} articles published</p>

          <div className="broadsheet-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
