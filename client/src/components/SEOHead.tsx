/*
 * SEOHead — Dynamic meta tag management
 * Updates document head for each page
 */

import { useEffect } from "react";
import { SITE } from "@/lib/articles";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  article?: {
    author: string;
    publishedTime: string;
    section: string;
    tags?: string[];
  };
  jsonLd?: object;
}

export default function SEOHead({
  title,
  description,
  ogImage,
  ogType = "website",
  canonical,
  article,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${SITE.name}`
      : `${SITE.name} — ${SITE.subtitle}`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    setMeta('og:title', fullTitle, true);
    setMeta('twitter:title', fullTitle);
    setMeta('og:type', ogType, true);

    if (ogImage) {
      setMeta('og:image', ogImage, true);
      setMeta('twitter:image', ogImage);
      setMeta('twitter:card', 'summary_large_image');
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMeta('og:url', canonical, true);
    }

    if (article) {
      setMeta('article:author', article.author, true);
      setMeta('article:published_time', article.publishedTime, true);
      setMeta('article:section', article.section, true);
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('#json-ld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, ogImage, ogType, canonical, article, jsonLd]);

  return null;
}
