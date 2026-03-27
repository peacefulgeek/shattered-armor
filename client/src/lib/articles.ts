/*
 * Article data types and utility functions
 * The Shattered Armor — Kintsugi Broadsheet
 */

export interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  dateISO: string;
  wordCount: number;
  readingTime: number;
  openerType: string;
  faqCount: number;
  backlinkType: string;
  conclusionType: string;
  researcherName: string;
  researcherTopic: string;
  externalSites: string[];
  phraseIndices: number[];
  heroImage: string;
  ogImage: string;
  metaDescription?: string;
  imageDescription?: string;
  htmlContent?: string;
  generatedWordCount?: number;
}

export interface ArticleIndex {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  dateISO: string;
  readingTime: number;
  metaDescription: string;
  heroImage: string;
  ogImage: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { slug: "the-wiring", name: "The Wiring", description: "How trauma rewires the nervous system — polyvagal theory, neuroception, and the architecture of survival responses." },
  { slug: "the-body", name: "The Body", description: "Somatic experiencing, embodiment practices, and the physical landscape of stored trauma." },
  { slug: "the-parts", name: "The Parts", description: "Internal Family Systems, parts work, and the multiplicity of the traumatized self." },
  { slug: "the-triggers", name: "The Triggers", description: "Emotional flashbacks, hypervigilance, and the geography of activation." },
  { slug: "the-return", name: "The Return", description: "Integration, post-traumatic growth, and the long road back to embodied presence." },
];

export const SITE = {
  name: "The Shattered Armor",
  subtitle: "Healing Complex Trauma Without the Textbook",
  tagline: "What happened to you rewired your nervous system. Let's rewire it back.",
  author: "Kalesh",
  authorTitle: "Consciousness Teacher & Writer",
  authorLink: "https://kalesh.love",
  authorBio: "Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.",
  domain: "https://shatteredarmor.com",
  editorial: "The Shattered Armor Editorial",
  disclaimer: "This site provides educational information about complex trauma. It is not therapy. If you are in crisis, please contact the 988 Suicide and Crisis Lifeline by calling or texting 988.",
  cdnBase: "https://shattered-armor.b-cdn.net",
};

export function formatDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isPublished(dateISO: string): boolean {
  return new Date(dateISO) <= new Date();
}

export function getCategoryColor(slug: string): string {
  const colors: Record<string, string> = {
    "the-wiring": "oklch(0.55 0.12 250)",
    "the-body": "oklch(0.55 0.12 150)",
    "the-parts": "oklch(0.55 0.12 320)",
    "the-triggers": "oklch(0.55 0.15 30)",
    "the-return": "oklch(0.60 0.14 85)",
  };
  return colors[slug] || "oklch(0.50 0.02 250)";
}

export function extractExcerpt(html: string, maxLength = 200): string {
  // Strip HTML tags and get first paragraph
  const text = html.replace(/<[^>]+>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
