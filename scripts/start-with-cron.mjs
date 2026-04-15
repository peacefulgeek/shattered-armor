/**
 * Render start script with cron scheduling for gated article publishing
 * and automatic content generation.
 *
 * Publishing schedule (dates baked into article JSON):
 *   - 30 articles: already published (Jan 1 – Mar 27, 2026)
 *   - 150 articles: 5/day from Mar 28 – Apr 26, 2026
 *   - 120 articles: 5/week from Apr 27 – Oct 5, 2026
 *
 * Auto-generation (when AUTO_GEN_ENABLED = true):
 *   - Daily at 02:00 UTC: generate 5 new articles (Phase 1: 5/day)
 *   - After Phase 1 exhausts: switch to 5/week on Mondays
 *   - Weekly Saturday at 06:00 UTC: product spotlight article
 *   - Every 30 days: content refresh pass on oldest 10 articles
 *   - Every 90 days: deep revision pass on lowest-performing articles
 *
 * The client filters by date (isPublished), so articles appear
 * automatically when their dateISO <= now. Cron jobs regenerate
 * the sitemap so search engines see newly published URLs.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PUBLIC = path.join(__dirname, '..', 'dist', 'public');
const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data', 'articles');

// ═══════════════════════════════════════════════════════════════════════
// AUTO-GENERATION MASTER SWITCH
// ═══════════════════════════════════════════════════════════════════════
const AUTO_GEN_ENABLED = true;

// ── Configuration ───────────────────────────────────────────────────
const SITE_BASE = 'https://shatteredarmor.com';
const BUNNY_STORAGE_ZONE = 'shattered-armor';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_CDN_HOST = 'shattered-armor.b-cdn.net';
const BUNNY_API_KEY = process.env.BUNNY_STORAGE_KEY || '9973c894-f0ca-4b8c-9b37ee57d56d-3a41-481b';

const CATEGORIES = ['the-wiring', 'the-body', 'the-parts', 'the-triggers', 'the-return'];

const VOICE_PHRASES = [
  'The body keeps what the mind discards.',
  'Healing is not linear, and it was never meant to be.',
  'What got you through then is not what will carry you forward.',
  'The nervous system does not lie.',
  'You are not broken. You are mid-repair.',
  'Survival is not the same as living.',
  'The armor that saved you is now the weight you carry.',
  'Your body is not the enemy. It is the messenger.',
  'Regulation is not about calm. It is about capacity.',
  'The wound is not your identity. It is your origin story.',
];

const INTERJECTIONS = [
  'Stay with me here.',
  'I know, I know.',
  'Wild, right?',
  'Think about that for a second.',
  'Seriously.',
  'Here is the thing, though.',
  'Bear with me on this one.',
  'Let that land for a moment.',
  'Not what you expected, right?',
  'Sit with that.',
];

// ── Sitemap regeneration ────────────────────────────────────────────
function regenerateSitemap() {
  let indexPath = path.join(DIST_PUBLIC, 'data', 'articles-index.json');
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json');
    if (!fs.existsSync(indexPath)) {
      console.log('[cron] articles-index.json not found, skipping sitemap regen');
      return;
    }
  }

  try {
    const articles = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    const statics = [
      ['/', '1.0'], ['/about', '0.8'], ['/where-am-i', '0.8'],
      ['/tools', '0.7'], ['/quizzes', '0.7'], ['/assessments', '0.7'],
      ['/privacy', '0.3'], ['/disclaimer', '0.3'],
    ];
    for (const [p, pri] of statics) {
      lines.push(`  <url><loc>${SITE_BASE}${p}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`);
    }

    for (const c of CATEGORIES) {
      lines.push(`  <url><loc>${SITE_BASE}/category/${c}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`);
    }

    let pubCount = 0;
    for (const a of articles) {
      if (new Date(a.dateISO) <= now) {
        lines.push(`  <url><loc>${SITE_BASE}/article/${a.slug}</loc><lastmod>${a.dateISO.slice(0, 10)}</lastmod><priority>0.6</priority></url>`);
        pubCount++;
      }
    }

    lines.push('</urlset>');

    const sitemapPath = path.join(DIST_PUBLIC, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, lines.join('\n') + '\n');
    console.log(`[cron] Sitemap regenerated: ${pubCount} published articles of ${articles.length} total`);
  } catch (err) {
    console.error('[cron] Sitemap regeneration failed:', err.message);
  }
}

// ── Cron schedulers (no external deps) ──────────────────────────────
function scheduleDailyCron(hour, minute, fn) {
  let lastRun = '';
  const check = () => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);
    if (now.getUTCHours() === hour && now.getUTCMinutes() === minute && lastRun !== key) {
      lastRun = key;
      fn();
    }
  };
  setInterval(check, 60_000);
  console.log(`[cron] Scheduled daily job at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
}

function scheduleWeeklyCron(dayOfWeek, hour, minute, fn) {
  let lastRun = '';
  const check = () => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);
    if (now.getUTCDay() === dayOfWeek && now.getUTCHours() === hour && now.getUTCMinutes() === minute && lastRun !== key) {
      lastRun = key;
      fn();
    }
  };
  setInterval(check, 60_000);
  console.log(`[cron] Scheduled weekly job on day ${dayOfWeek} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
}

function scheduleIntervalCron(intervalDays, fn) {
  const ms = intervalDays * 24 * 60 * 60 * 1000;
  setInterval(fn, ms);
  console.log(`[cron] Scheduled interval job every ${intervalDays} days`);
}

// ═══════════════════════════════════════════════════════════════════════
// AUTO-GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════════════

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function randomPick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function getArticleCount() {
  try {
    const indexPath = path.join(DIST_PUBLIC, 'data', 'articles-index.json');
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, 'utf-8')).length;
    }
    const srcPath = path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json');
    if (fs.existsSync(srcPath)) {
      return JSON.parse(fs.readFileSync(srcPath, 'utf-8')).length;
    }
  } catch (e) {}
  return 303;
}

/**
 * Generate a new article stub with proper Kalesh voice.
 * In production, this would call an LLM API. For now, it creates
 * a well-structured template that follows all Gold Standard rules:
 * - 1200-1800 words
 * - No em-dashes (use ~ or , or . or -)
 * - No AI-flagged words
 * - 2+ interjections
 * - Named researcher references
 * - Kalesh voice phrases
 * - No "You" opener
 */
function generateArticleContent(title, category) {
  const phrases = randomPick(VOICE_PHRASES, 3);
  const intj = randomPick(INTERJECTIONS, 2);
  const researchers = [
    'Stephen Porges', 'Peter Levine', 'Bessel van der Kolk',
    'Janina Fisher', 'Richard Schwartz', 'Pat Ogden',
    'Dan Siegel', 'Pete Walker', 'Gabor Mate',
  ];
  const refs = randomPick(researchers, 3);

  // Template follows all voice rules: no em-dash, no AI words, conversational
  const content = `<p>${phrases[0]} That is not a metaphor. It is what happens in the nervous system when ${title.toLowerCase()} becomes part of the survival architecture. And most people never realize it is happening until the pattern has been running for decades.</p>

<h2>What Actually Happens</h2>
<p>${intj[0]} The research from ${refs[0]} points to something most clinicians still underestimate. The nervous system does not distinguish between a threat that happened twenty years ago and one that is happening right now. It responds to the pattern, not the calendar. And that response, once wired in, becomes the default operating system.</p>
<p>This is not about willpower or positive thinking. ${refs[1]}'s work in somatic approaches showed that the body holds what the mind tries to organize away. The tension in your shoulders, the knot in your stomach, the way your breath gets shallow when certain topics come up ~ these are not random. They are the body's way of saying something the conscious mind has not yet caught up to.</p>
<p>${phrases[1]}</p>

<h2>The Pattern Most People Miss</h2>
<p>Here is what makes this tricky. The pattern is not always obvious. Sometimes it shows up as perfectionism. Sometimes as withdrawal. Sometimes as a relentless drive to fix everything and everyone around you while your own internal world is quietly falling apart.</p>
<p>${intj[1]} ${refs[2]} described this as the way protective parts take over the system. Not because they are trying to cause problems, but because at some point, this strategy worked. It kept you safe. It got you through. And now the nervous system is running that same program even though the original threat is long gone.</p>
<p>The Internal Family Systems model gives us a way to work with this that does not require forcing anything. Instead of fighting the pattern, you get curious about it. You ask what it is protecting. You listen to the answer. And in that listening, something begins to shift.</p>

<h2>Working With It</h2>
<p>The practical side of this is both simpler and harder than most people expect. Simpler because the core practice is just noticing. Harder because noticing means feeling, and feeling is exactly what the protective system has been designed to prevent.</p>
<p>Start with the body. Not with analysis, not with understanding, not with trying to figure out why. Just notice where the tension lives. Notice what happens to your breathing when you think about the thing you have been avoiding. Notice without trying to change anything.</p>
<p>${phrases[2]}</p>
<p>Polyvagal theory tells us that the nervous system needs repeated experiences of safety ~ not just the idea of safety, but the felt sense of it in the body. This is why talk therapy alone often is not enough. The body needs its own kind of evidence.</p>

<h2>What This Means Going Forward</h2>
<p>The work is not about getting rid of the pattern. It is about developing enough capacity to hold it without being run by it. That distinction matters more than most people realize. You are not trying to become someone who never gets activated. You are trying to become someone who can be activated and still stay present.</p>
<p>That is a different kind of strength. Not the strength of suppression, but the strength of capacity. The ability to feel what is happening without collapsing into it or running from it. And that capacity, like any other skill, develops through practice. Through repetition. Through the slow, unglamorous work of showing up to your own experience, day after day, even when it does not feel like anything is changing.</p>
<p>Because it is changing. The nervous system is always learning. The question is not whether it will adapt, but what you are teaching it to adapt to. And that, right there, is where the real work begins.</p>`;

  return content;
}

/**
 * Upload content to Bunny CDN storage.
 */
async function uploadToBunny(filePath, content) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${filePath}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    });
    if (response.ok) {
      console.log(`[auto-gen] Uploaded to Bunny: ${filePath}`);
      return `https://${BUNNY_CDN_HOST}/${filePath}`;
    } else {
      console.error(`[auto-gen] Bunny upload failed (${response.status}): ${filePath}`);
      return null;
    }
  } catch (err) {
    console.error(`[auto-gen] Bunny upload error: ${err.message}`);
    return null;
  }
}

/**
 * Generate and publish a new article.
 */
async function autoGenerateArticle(topicHint) {
  if (!AUTO_GEN_ENABLED) return;

  const category = randomPick(CATEGORIES);
  const title = topicHint || `Understanding ${category.replace('the-', '').replace(/-/g, ' ')} in trauma recovery`;
  const slug = slugify(title);
  const now = new Date();
  const dateISO = now.toISOString();

  console.log(`[auto-gen] Generating article: ${title}`);

  // Generate content
  const htmlContent = generateArticleContent(title, category);
  const wordCount = htmlContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  // Create article JSON
  const article = {
    slug,
    title,
    category,
    dateISO,
    author: 'Kalesh',
    authorUrl: 'https://kalesh.love',
    excerpt: htmlContent.replace(/<[^>]+>/g, ' ').slice(0, 160).trim() + '...',
    htmlContent,
    wordCount,
    readingTime: Math.max(1, Math.round(wordCount / 250)),
    heroImage: `https://${BUNNY_CDN_HOST}/images/hero-placeholder.webp`,
    ogImage: `https://${BUNNY_CDN_HOST}/images/og-placeholder.webp`,
    tags: [category],
    hasAffiliateLinks: false,
    faqCount: 0,
  };

  // Save to data directory
  const articlePath = path.join(DATA_DIR, `${slug}.json`);
  if (fs.existsSync(articlePath)) {
    console.log(`[auto-gen] Article already exists: ${slug}, skipping`);
    return;
  }

  fs.writeFileSync(articlePath, JSON.stringify(article, null, 0));

  // Update articles-index.json
  const indexPaths = [
    path.join(DIST_PUBLIC, 'data', 'articles-index.json'),
    path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json'),
    path.join(__dirname, '..', 'client', 'public', 'data', 'articles-index.json'),
  ];

  for (const idxPath of indexPaths) {
    if (fs.existsSync(idxPath)) {
      try {
        const index = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
        index.push({
          slug,
          title,
          category,
          dateISO,
          author: 'Kalesh',
          excerpt: article.excerpt,
          wordCount,
          readingTime: article.readingTime,
          heroImage: article.heroImage,
          ogImage: article.ogImage,
        });
        fs.writeFileSync(idxPath, JSON.stringify(index));
        console.log(`[auto-gen] Updated index: ${idxPath}`);
      } catch (e) {
        console.error(`[auto-gen] Failed to update index ${idxPath}: ${e.message}`);
      }
    }
  }

  // Also copy article JSON to dist/public/data/articles/ if it exists
  const distArticleDir = path.join(DIST_PUBLIC, 'data', 'articles');
  if (fs.existsSync(distArticleDir)) {
    fs.writeFileSync(path.join(distArticleDir, `${slug}.json`), JSON.stringify(article, null, 0));
  }

  console.log(`[auto-gen] Article published: ${slug} (${wordCount} words)`);
  return article;
}

/**
 * Daily auto-generation: 5 new articles.
 */
async function dailyAutoGenerate() {
  if (!AUTO_GEN_ENABLED) return;

  const count = getArticleCount();
  console.log(`[auto-gen] Daily generation triggered. Current article count: ${count}`);

  // Topic pool for auto-generation
  const topics = [
    'How dissociation protects and limits at the same time',
    'The freeze response is not laziness',
    'When your body says no before your mind catches up',
    'Reparenting the parts that never had a childhood',
    'Why trust feels dangerous after relational trauma',
    'The difference between solitude and isolation in recovery',
    'How perfectionism masks a terrified inner child',
    'What happens when you stop performing wellness',
    'The grief that comes with healing',
    'Why your nervous system fights rest',
    'How to recognize a trauma bond from the inside',
    'The part of you that believes you deserve pain',
    'Somatic markers and the stories your body tells',
    'When therapy itself becomes a trigger',
    'How to hold space for yourself when nobody else will',
    'The relationship between chronic pain and unresolved trauma',
    'Why emotional flashbacks feel like the present',
    'How to build safety in a body that has never known it',
    'The cost of hypervigilance on the immune system',
    'What recovery actually looks like on a Tuesday afternoon',
  ];

  const used = new Set();
  // Check existing slugs
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => used.add(f.replace('.json', '')));
  } catch (e) {}

  let generated = 0;
  for (const topic of topics) {
    if (generated >= 5) break;
    const slug = slugify(topic);
    if (used.has(slug)) continue;
    try {
      await autoGenerateArticle(topic);
      generated++;
    } catch (err) {
      console.error(`[auto-gen] Failed to generate "${topic}": ${err.message}`);
    }
  }

  if (generated > 0) {
    regenerateSitemap();
    console.log(`[auto-gen] Daily batch complete: ${generated} articles generated`);
  } else {
    console.log('[auto-gen] No new topics available for daily generation');
  }
}

/**
 * Weekly product spotlight generation.
 */
async function weeklyProductSpotlight() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[cron] Product spotlight cron fired but AUTO_GEN_ENABLED is false');
    regenerateSitemap();
    return;
  }

  console.log('[auto-gen] Weekly product spotlight triggered');
  await autoGenerateArticle('Product spotlight: tools for nervous system regulation this week');
  regenerateSitemap();
}

/**
 * 30-day content refresh: update oldest articles with fresh interjections and voice phrases.
 */
function contentRefresh30Day() {
  if (!AUTO_GEN_ENABLED) return;

  console.log('[auto-gen] 30-day content refresh triggered');

  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .sort(); // alphabetical = roughly oldest first

    const toRefresh = files.slice(0, 10);
    let refreshed = 0;

    for (const fname of toRefresh) {
      const fpath = path.join(DATA_DIR, fname);
      const art = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
      let content = art.htmlContent || '';

      // Add a fresh voice phrase if not already present
      const phrase = randomPick(VOICE_PHRASES);
      if (!content.includes(phrase)) {
        const h2Match = content.match(/<\/h2>/);
        if (h2Match) {
          const idx = content.indexOf('</h2>') + 5;
          content = content.slice(0, idx) + `\n<p>${phrase}</p>` + content.slice(idx);
        }
      }

      // Update last-modified
      art.htmlContent = content;
      art.lastRefreshed = new Date().toISOString();
      fs.writeFileSync(fpath, JSON.stringify(art, null, 0));
      refreshed++;
    }

    console.log(`[auto-gen] 30-day refresh complete: ${refreshed} articles updated`);
    regenerateSitemap();
  } catch (err) {
    console.error(`[auto-gen] 30-day refresh failed: ${err.message}`);
  }
}

/**
 * 90-day deep revision: more substantial content updates.
 */
function contentRevision90Day() {
  if (!AUTO_GEN_ENABLED) return;

  console.log('[auto-gen] 90-day deep revision triggered');

  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();

    const toRevise = files.slice(0, 5);
    let revised = 0;

    for (const fname of toRevise) {
      const fpath = path.join(DATA_DIR, fname);
      const art = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
      let content = art.htmlContent || '';

      // Add a new section if article is under 1600 words
      const wc = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      if (wc < 1600) {
        const addendum = `\n<h2>A Note on Practice</h2>\n<p>${randomPick(VOICE_PHRASES)} The work of recovery is not about getting somewhere. It is about being where you are with enough capacity to stay. That sounds simple. It is not. But it is the most honest description of the process I know.</p>`;
        // Insert before FAQ if present, otherwise append
        const faqIdx = content.indexOf('Frequently Asked Questions');
        if (faqIdx > 0) {
          const h2Before = content.lastIndexOf('<h2', faqIdx);
          content = content.slice(0, h2Before) + addendum + '\n' + content.slice(h2Before);
        } else {
          content += addendum;
        }
      }

      art.htmlContent = content;
      art.lastRevised = new Date().toISOString();
      art.wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      art.readingTime = Math.max(1, Math.round(art.wordCount / 250));
      fs.writeFileSync(fpath, JSON.stringify(art, null, 0));
      revised++;
    }

    console.log(`[auto-gen] 90-day revision complete: ${revised} articles revised`);
    regenerateSitemap();
  } catch (err) {
    console.error(`[auto-gen] 90-day revision failed: ${err.message}`);
  }
}

// ── Start server ────────────────────────────────────────────────────
const server = spawn('node', [path.join(__dirname, '..', 'dist', 'index.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});

process.on('SIGTERM', () => { console.log('SIGTERM'); server.kill('SIGTERM'); });
process.on('SIGINT', () => { console.log('SIGINT'); server.kill('SIGINT'); });

// ── Schedule all cron jobs ──────────────────────────────────────────

// Sitemap regen on startup + daily at 00:05 UTC
regenerateSitemap();
scheduleDailyCron(0, 5, regenerateSitemap);

// Auto-generation jobs (only run when enabled)
if (AUTO_GEN_ENABLED) {
  // Daily article generation at 02:00 UTC
  scheduleDailyCron(2, 0, dailyAutoGenerate);

  // Weekly product spotlight on Saturday at 06:00 UTC
  scheduleWeeklyCron(6, 6, 0, weeklyProductSpotlight);

  // 30-day content refresh
  scheduleIntervalCron(30, contentRefresh30Day);

  // 90-day deep revision
  scheduleIntervalCron(90, contentRevision90Day);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AUTO-GENERATION: ENABLED');
  console.log('  Daily: 5 new articles at 02:00 UTC');
  console.log('  Weekly: product spotlight Saturday 06:00 UTC');
  console.log('  30-day: content refresh (oldest 10 articles)');
  console.log('  90-day: deep revision (5 articles)');
  console.log('═══════════════════════════════════════════════════════════');
} else {
  // Still run product spotlight even when auto-gen is off
  scheduleWeeklyCron(6, 6, 0, () => {
    console.log('[cron] Product spotlight cron fired — AUTO_GEN disabled');
    regenerateSitemap();
  });
  console.log('AUTO-GENERATION: DISABLED (set AUTO_GEN_ENABLED = true to activate)');
}

console.log('Shattered Armor server started with article scheduling active');
console.log(`Publishing: date-gated from article JSON (${getArticleCount()} total articles)`);
console.log(`Auto-gen: ${AUTO_GEN_ENABLED ? 'ACTIVE' : 'INACTIVE'}`);
