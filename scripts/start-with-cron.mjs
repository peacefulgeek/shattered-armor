/**
 * Render start script with cron scheduling for gated article publishing.
 *
 * Publishing schedule (dates baked into article JSON):
 *   - 30 articles: already published (Jan 1 – Mar 27, 2026)
 *   - 150 articles: 5/day from Mar 28 – Apr 26, 2026
 *   - 120 articles: 5/week from Apr 27 – Oct 5, 2026
 *
 * The client already filters by date (isPublished), so articles appear
 * automatically when their dateISO <= now. This cron job regenerates
 * the sitemap daily at 00:05 UTC so search engines see newly published URLs.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PUBLIC = path.join(__dirname, '..', 'dist', 'public');

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
    const base = 'https://shatteredarmor.com';
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
      lines.push(`  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`);
    }

    for (const c of ['the-wiring', 'the-body', 'the-parts', 'the-triggers', 'the-return']) {
      lines.push(`  <url><loc>${base}/category/${c}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`);
    }

    let pubCount = 0;
    for (const a of articles) {
      if (new Date(a.dateISO) <= now) {
        lines.push(`  <url><loc>${base}/article/${a.slug}</loc><lastmod>${a.dateISO.slice(0, 10)}</lastmod><priority>0.6</priority></url>`);
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

// ── Cron scheduler (no external deps) ───────────────────────────────
function scheduleDailyCron(hour, minute, fn) {
  const check = () => {
    const now = new Date();
    if (now.getUTCHours() === hour && now.getUTCMinutes() === minute) {
      fn();
    }
  };
  setInterval(check, 60_000);
  console.log(`[cron] Scheduled daily job at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
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

// Run sitemap regen on startup and schedule daily at 00:05 UTC
regenerateSitemap();
scheduleDailyCron(0, 5, regenerateSitemap);

// Weekly product spotlight cron — every Saturday at 06:00 UTC
// In production, this would generate a new product spotlight article.
// For now, 3 initial spotlights are pre-built for SkimLinks approval.
function scheduleWeeklyCron(dayOfWeek, hour, minute, fn) {
  const check = () => {
    const now = new Date();
    if (now.getUTCDay() === dayOfWeek && now.getUTCHours() === hour && now.getUTCMinutes() === minute) {
      fn();
    }
  };
  setInterval(check, 60_000);
  console.log(`[cron] Scheduled weekly job on day ${dayOfWeek} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
}

function productSpotlightCheck() {
  console.log('[cron] Product spotlight cron fired — Saturday check complete');
  // Future: auto-generate product spotlight article here
  regenerateSitemap();
}

scheduleWeeklyCron(6, 6, 0, productSpotlightCheck); // Saturday 6:00 UTC

console.log('Shattered Armor server started with article scheduling active');
console.log('Publishing: 5/day Mar 28–Apr 26, then 5/week Apr 27–Oct 5');
console.log('Product spotlight: weekly Saturday cron active');
