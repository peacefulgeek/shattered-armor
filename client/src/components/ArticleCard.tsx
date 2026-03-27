/*
 * ArticleCard — Newspaper broadsheet article card
 * Used in homepage grid and category pages
 */

import { Link } from "wouter";
import { type ArticleIndex, formatDateShort } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleIndex;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article className={`group ${featured ? 'col-span-1 md:col-span-2 lg:col-span-2' : ''}`}>
      <Link href={`/article/${article.slug}`} className="no-underline block">
        {/* Image */}
        <div className={`overflow-hidden ${featured ? 'aspect-[2/1]' : 'aspect-[3/2]'} mb-3`}>
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Category tag */}
        <span
          className="text-xs uppercase tracking-widest font-bold"
          style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.75 0.12 85)' }}
        >
          {article.categoryName}
        </span>

        {/* Title */}
        <h2
          className={`mt-1 ${featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} leading-tight group-hover:text-gold-dark transition-colors`}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {article.title}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          <time dateTime={article.dateISO}>{formatDateShort(article.dateISO)}</time>
          <span>&middot;</span>
          <span>{article.readingTime} min read</span>
        </div>

        {/* Excerpt */}
        {article.metaDescription && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {article.metaDescription}
          </p>
        )}
      </Link>

      {/* Gold rule separator */}
      <div className="gold-rule mt-4" />
    </article>
  );
}
