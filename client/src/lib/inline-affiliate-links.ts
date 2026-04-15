/*
 * Inline Affiliate Links — keyword-based natural embedding
 * Selects up to 4 products and injects soft conversational links
 * at natural breakpoints in article HTML content
 */

import { Product, amazonUrl, matchProducts } from "./product-catalog";

const SOFT_INTROS = [
  "One option that many people like is",
  "A tool that often helps with this is",
  "Something worth considering might be",
  "For those looking for a simple solution, this works well:",
  "You could also try",
  "A popular choice for situations like this is",
  "One thing that has helped many people in similar situations is",
  "If you are looking for something practical, consider",
];

function pickIntro(product: Product, index: number): string {
  // Use the product's own soft intro if available, otherwise rotate through generic ones
  if (product.softIntro) return product.softIntro;
  return SOFT_INTROS[index % SOFT_INTROS.length];
}

function createInlineLink(product: Product, index: number): string {
  const intro = pickIntro(product, index);
  const url = amazonUrl(product.asin);
  return `<p class="affiliate-inline" style="margin: 1.5rem 0; padding: 0.75rem 1rem; border-left: 3px solid oklch(0.75 0.15 85); background: oklch(0.97 0.01 85 / 0.5);">${intro} <a href="${url}" target="_blank" rel="nofollow noopener">${product.name}</a> (paid link).</p>`;
}

function createHealingJourneySection(products: Product[]): string {
  const items = products.map(p => {
    const url = amazonUrl(p.asin);
    return `<li><a href="${url}" target="_blank" rel="nofollow noopener">${p.name}</a> (paid link)</li>`;
  }).join("\n");
  
  return `
<div class="healing-journey-section" style="margin: 2rem 0; padding: 1.5rem; border: 1px solid oklch(0.85 0.05 85); border-radius: 0.5rem; background: oklch(0.97 0.01 85 / 0.3);">
  <h3 style="margin-top: 0; font-family: var(--font-serif); color: oklch(0.45 0.08 85);">Healing Journey Resources</h3>
  <p style="font-size: 0.9rem; color: oklch(0.5 0.02 250);">A few tools that others on a similar path have found helpful:</p>
  <ul style="list-style: none; padding: 0;">
    ${items}
  </ul>
  <p style="font-size: 0.8rem; color: oklch(0.55 0.02 250); margin-bottom: 0;">As an Amazon Associate, I earn from qualifying purchases.</p>
</div>`;
}

export function injectAffiliateLinks(
  htmlContent: string,
  articleTitle: string,
  articleCategory: string
): string {
  // Match 4 products for this article
  const products = matchProducts(articleTitle, articleCategory, 4);
  if (products.length === 0) return htmlContent;
  
  // Split content into paragraphs
  const paragraphs = htmlContent.split("</p>");
  if (paragraphs.length < 6) return htmlContent; // Too short to inject
  
  // Inject 2-4 inline links at natural breakpoints (after every 3-5 paragraphs)
  const inlineCount = Math.min(products.length, Math.min(4, Math.floor(paragraphs.length / 5)));
  const inlineProducts = products.slice(0, inlineCount);
  const bottomProducts = products.slice(0, Math.min(4, products.length));
  
  // Calculate injection points (evenly spaced)
  const totalParagraphs = paragraphs.length;
  const spacing = Math.floor(totalParagraphs / (inlineCount + 1));
  
  let injected = 0;
  const result: string[] = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    result.push(paragraphs[i]);
    if (i < paragraphs.length - 1) {
      result.push("</p>");
    }
    
    // Inject after calculated spacing points
    if (injected < inlineCount && i > 0 && (i + 1) % spacing === 0 && i < totalParagraphs - 2) {
      result.push(createInlineLink(inlineProducts[injected], injected));
      injected++;
    }
  }
  
  // Add Healing Journey section before the last closing tag
  const finalHtml = result.join("");
  
  // Insert before the FAQ section if it exists, otherwise at the end
  const faqIndex = finalHtml.lastIndexOf('<h2');
  if (faqIndex > 0) {
    return finalHtml.slice(0, faqIndex) + createHealingJourneySection(bottomProducts) + finalHtml.slice(faqIndex);
  }
  
  return finalHtml + createHealingJourneySection(bottomProducts);
}
