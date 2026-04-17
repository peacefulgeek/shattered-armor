/**
 * Article Quality Gate — validates articles before storage
 * 
 * Checks: word count, em-dashes, AI-flagged words/phrases, voice signals,
 * Amazon links with spankyspinola-20 tag.
 * 
 * Adapted from the Render Upgrade Addendum Section 6.
 * Works with our file-based (JSON) article storage, not DB.
 */

// ─── AI-FLAGGED WORDS ───────────────────────────────────────────────
// Words that flag content as AI-generated. Pulled from public AI-detection
// research (Originality.ai, GPTZero, Copyleaks) and Google's Helpful Content
// Update patterns.
const AI_FLAGGED_WORDS = [
  // The classic AI tells
  'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock', 'empower',
  'utilize', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
  'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke',
  'resonate', 'harness', 'intricate', 'plethora', 'myriad', 'comprehensive',
  // Marketing fluff that AI loves
  'transformative', 'groundbreaking', 'innovative', 'cutting-edge', 'revolutionary',
  'state-of-the-art', 'ever-evolving', 'game-changing', 'next-level', 'world-class',
  'unparalleled', 'unprecedented', 'remarkable', 'extraordinary', 'exceptional',
  // Abstract filler
  'profound', 'holistic', 'nuanced', 'multifaceted', 'stakeholders',
  'ecosystem', 'landscape', 'realm', 'sphere', 'domain',
  // AI hedging
  'arguably', 'notably', 'crucially', 'importantly', 'essentially',
  'fundamentally', 'inherently', 'intrinsically', 'substantively',
  // Bullshit verbs
  'streamline', 'optimize', 'facilitate', 'amplify', 'catalyze',
  'propel', 'spearhead', 'orchestrate', 'navigate', 'traverse',
  // AI-favorite connectors
  'furthermore', 'moreover', 'additionally', 'consequently', 'subsequently',
  'thereby', 'thusly', 'wherein', 'whereby'
];

// ─── AI-FLAGGED PHRASES ─────────────────────────────────────────────
// Phrases that scream AI even if the words are fine in isolation
const AI_FLAGGED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "it's worth mentioning",
  "it's crucial to",
  "it is essential to",
  "in conclusion,",
  "in summary,",
  "to summarize,",
  "a holistic approach",
  "unlock your potential",
  "unlock the power",
  "in the realm of",
  "in the world of",
  "dive deep into",
  "dive into",
  "delve into",
  "at the end of the day",
  "in today's fast-paced world",
  "in today's digital age",
  "in today's modern world",
  "in this digital age",
  "when it comes to",
  "navigate the complexities",
  "a testament to",
  "speaks volumes",
  "the power of",
  "the beauty of",
  "the art of",
  "the journey of",
  "the key lies in",
  "plays a crucial role",
  "plays a vital role",
  "plays a significant role",
  "plays a pivotal role",
  "a wide array of",
  "a wide range of",
  "a plethora of",
  "a myriad of",
  "stands as a",
  "serves as a",
  "acts as a",
  "has emerged as",
  "continues to evolve",
  "has revolutionized",
  "cannot be overstated",
  "it goes without saying",
  "needless to say",
  "last but not least",
  "first and foremost",
  // Original banned phrases from Kalesh voice profile
  "manifest",
  "lean into",
  "showing up for",
  "authentic self",
  "safe space",
  "hold space",
  "sacred container",
  "raise your vibration"
];

// ─── AMAZON LINK REGEX ──────────────────────────────────────────────
const AMAZON_LINK_RE = /https:\/\/www\.amazon\.com\/dp\/([A-Z0-9]{10})(?:\/[^"\s?]*)?(?:\?[^"\s]*)?/g;

export function countAmazonLinks(text) {
  return (text.match(AMAZON_LINK_RE) || []).length;
}

export function extractAsinsFromText(text) {
  const asins = new Set();
  let m;
  const re = new RegExp(AMAZON_LINK_RE);
  while ((m = re.exec(text)) !== null) asins.add(m[1]);
  return [...asins];
}

// ─── WORD COUNT ─────────────────────────────────────────────────────
export function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

// ─── EM-DASH CHECK ──────────────────────────────────────────────────
export function hasEmDash(text) {
  return text.includes('\u2014');  // em-dash U+2014
}

// ─── AI-FLAGGED WORD FINDER ─────────────────────────────────────────
export function findFlaggedWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase();
  const found = [];
  for (const w of AI_FLAGGED_WORDS) {
    const escaped = w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(stripped)) {
      found.push(w);
    }
  }
  return found;
}

// ─── AI-FLAGGED PHRASE FINDER ───────────────────────────────────────
export function findFlaggedPhrases(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/\s+/g, ' ');
  return AI_FLAGGED_PHRASES.filter(p => stripped.includes(p.toLowerCase()));
}

// ─── VOICE SIGNAL ANALYSIS ──────────────────────────────────────────
export function voiceSignals(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ');
  const lower = stripped.toLowerCase();

  // Contractions
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;

  // Direct address
  const directAddress = (lower.match(/\byou('re|r|rself)?\b/g) || []).length;

  // First person
  const firstPerson = (lower.match(/\b(i|i'm|i've|i'd|i'll|my|me|mine)\b/g) || []).length;

  // Sentence length variance
  const sentences = stripped.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (lengths.length || 1);
  const stdDev = Math.sqrt(variance);
  const shortSentences = lengths.filter(l => l <= 6).length;
  const longSentences = lengths.filter(l => l >= 25).length;

  // Conversational markers
  const conversationalMarkers = [
    /\bhere's the thing\b/i, /\blook,\s/i, /\bhonestly,?\s/i, /\btruth is\b/i,
    /\bthe truth\b/i, /\bi'll tell you\b/i, /\bthink about it\b/i,
    /\bthat said\b/i, /\bbut here's\b/i, /\bso yeah\b/i, /\bkind of\b/i,
    /\bsort of\b/i, /\byou know\b/i
  ];
  const markerCount = conversationalMarkers.filter(r => r.test(stripped)).length;

  return {
    contractions,
    directAddress,
    firstPerson,
    sentenceCount: sentences.length,
    avgSentenceLength: +avg.toFixed(1),
    sentenceStdDev: +stdDev.toFixed(1),
    shortSentences,
    longSentences,
    conversationalMarkers: markerCount
  };
}

// ─── MAIN QUALITY GATE ──────────────────────────────────────────────
export function runQualityGate(body) {
  const failures = [];
  const warnings = [];

  // Word count
  const words = countWords(body);
  if (words < 1200) failures.push(`words-too-low:${words}`);
  if (words > 2500) failures.push(`words-too-high:${words}`);

  // Amazon links
  const links = countAmazonLinks(body);
  if (links < 3) failures.push(`amazon-links-too-few:${links}`);
  if (links > 6) failures.push(`amazon-links-too-many:${links}`);

  // Em-dash
  if (hasEmDash(body)) failures.push('contains-em-dash');

  // AI-flagged words
  const bw = findFlaggedWords(body);
  if (bw.length > 0) failures.push(`ai-flagged-words:${bw.join(',')}`);

  // AI-flagged phrases
  const bp = findFlaggedPhrases(body);
  if (bp.length > 0) failures.push(`ai-flagged-phrases:${bp.join('|')}`);

  // Voice signals
  const voice = voiceSignals(body);
  const per1k = (n) => (n / words) * 1000;

  // Contractions: at least 4 per 1000 words
  if (per1k(voice.contractions) < 4) {
    failures.push(`contractions-too-few:${voice.contractions}(${per1k(voice.contractions).toFixed(1)}/1k)`);
  }

  // Direct address OR first person must be present
  if (voice.directAddress === 0 && voice.firstPerson === 0) {
    failures.push('no-direct-address-or-first-person');
  }

  // Sentence length variance
  if (voice.sentenceStdDev < 4) {
    failures.push(`sentence-variance-too-low:${voice.sentenceStdDev}`);
  }

  // Must have some short sentences
  if (voice.shortSentences < 2) {
    failures.push(`too-few-short-sentences:${voice.shortSentences}`);
  }

  // Conversational markers
  if (voice.conversationalMarkers < 2) {
    warnings.push(`conversational-markers-low:${voice.conversationalMarkers}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    wordCount: words,
    amazonLinks: links,
    asins: extractAsinsFromText(body),
    voice
  };
}

// ─── EXPORTS FOR CRON ───────────────────────────────────────────────
export { AI_FLAGGED_WORDS, AI_FLAGGED_PHRASES };
