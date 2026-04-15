/*
 * Article Page — 3-column broadsheet layout with lazy loading
 * Desktop: 20% ToC | 55% body | 25% sidebar
 * Drop-cap first paragraph, pull quotes, gold rules
 * AuthorBioCard top-right, HealthDisclaimer bottom, AffiliateDisclosure if Amazon links
 */

import { useMemo, useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailCapture from "@/components/EmailCapture";
import SEOHead from "@/components/SEOHead";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import HealthDisclaimer from "@/components/HealthDisclaimer";
import AuthorBioCard from "@/components/AuthorBioCard";
import { SITE, formatDate, isPublished, type Article as ArticleType, type ArticleIndex } from "@/lib/articles";
import AutoAffiliates from "@/components/AutoAffiliates";
import { injectAffiliateLinks } from "@/lib/inline-affiliate-links";
import articlesIndex from "@/data/articles-index.json";

const articleModules = import.meta.glob("@/data/articles/*.json");

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [tocHeadings, setTocHeadings] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    const path = `/src/data/articles/${slug}.json`;
    const loader = articleModules[path];
    if (loader) {
      loader().then((mod: any) => {
        setArticle(mod.default || mod);
        setLoading(false);
      }).catch(() => {
        setArticle(null);
        setLoading(false);
      });
    } else {
      setArticle(null);
      setLoading(false);
    }
  }, [slug]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return (articlesIndex as ArticleIndex[])
      .filter(a => a.category === article.category && a.slug !== article.slug && isPublished(a.dateISO))
      .slice(0, 5);
  }, [article]);

  useEffect(() => {
    if (!article?.htmlContent) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.htmlContent, 'text/html');
    const h2s = doc.querySelectorAll('h2');
    const headings: { id: string; text: string }[] = [];
    h2s.forEach((h2, i) => {
      headings.push({ id: `section-${i}`, text: h2.textContent || '' });
    });
    setTocHeadings(headings);
  }, [article]);

  // Always true since AutoAffiliates injects Amazon links on every article
  const hasAmazonLinks = true;

  const processedHtml = useMemo(() => {
    if (!article?.htmlContent) return '';
    // Inject affiliate links naturally into article body (2-4 max)
    let html = injectAffiliateLinks(article.htmlContent, article.title, article.category);
    let h2Index = 0;
    html = html.replace(/<h2([^>]*)>/g, () => {
      const id = `section-${h2Index}`;
      h2Index++;
      return `<h2 id="${id}">`;
    });
    html = html.replace(/<p>/, '<p class="drop-cap">');
    html = html.replace(/<blockquote>/g, '<blockquote class="pull-quote">');
    return html;
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted w-2/3 mx-auto mb-4" />
            <div className="h-4 bg-muted w-1/3 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or hasn't been published yet.</p>
          <Link href="/" className="text-sm uppercase tracking-wider underline decoration-gold">Return Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || '',
    image: article.heroImage,
    datePublished: article.dateISO,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.domain}/article/${article.slug}`,
    },
    wordCount: article.wordCount,
    articleSection: article.categoryName,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title={article.title}
        description={article.metaDescription}
        ogImage={article.ogImage}
        ogType="article"
        canonical={`${SITE.domain}/article/${article.slug}`}
        article={{
          author: SITE.author,
          publishedTime: article.dateISO,
          section: article.categoryName,
        }}
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="w-full aspect-[3/1] md:aspect-[4/1] overflow-hidden">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Header */}
        <div className="container py-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'oklch(0.75 0.12 85)' }}>
              <Link href={`/category/${article.category}`} className="no-underline hover:text-foreground transition-colors" style={{ color: 'oklch(0.75 0.12 85)' }}>
                {article.categoryName}
              </Link>
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mt-3 mb-4" style={{ fontFamily: 'var(--font-serif)', lineHeight: '1.15' }}>
              {article.title}
            </h1>
            <div className="flex justify-center items-center gap-3 text-sm text-muted-foreground">
              <span>By <a href={SITE.authorLink} className="underline decoration-gold underline-offset-2">{SITE.author}</a></span>
              <span>&middot;</span>
              <time dateTime={article.dateISO}>{formatDate(article.dateISO)}</time>
              <span>&middot;</span>
              <span>{article.readingTime} min read</span>
            </div>
          </div>
        </div>

        <div className="gold-rule-thick" />

        {/* 3-Column Article Layout */}
        <div className="container py-8">
          <div className="article-layout">
            {/* Left: Table of Contents (sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                  Contents
                </h4>
                <nav className="space-y-2">
                  {tocHeadings.map(h => (
                    <a key={h.id} href={`#${h.id}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors no-underline leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Center: Article Body */}
            <div className="min-w-0">
              {hasAmazonLinks && <AffiliateDisclosure />}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: processedHtml }} />
              <AutoAffiliates articleTitle={article.title} articleCategory={article.category} />
              <HealthDisclaimer />
            </div>

            {/* Right: Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                {/* Author Bio Card with Image */}
                <AuthorBioCard />

                {/* Tools Recommendation */}
                <Link href="/tools" className="block p-4 rounded-lg border no-underline hover:border-foreground/20 transition-colors" style={{ background: 'oklch(0.97 0.005 80)', borderColor: 'oklch(0.88 0.03 80)' }}>
                  <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Tools We Recommend</h4>
                  <p className="text-xs text-muted-foreground">Curated books, journals, and resources for your healing journey.</p>
                </Link>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase tracking-widest font-bold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>Related</h4>
                    <div className="space-y-4">
                      {relatedArticles.map(ra => (
                        <Link key={ra.id} href={`/article/${ra.slug}`} className="block no-underline group">
                          <h5 className="text-sm leading-snug group-hover:text-gold-dark transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                            {ra.title}
                          </h5>
                          <span className="text-xs text-muted-foreground">{ra.readingTime} min read</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <EmailCapture />
      </main>

      <Footer />
    </div>
  );
}
