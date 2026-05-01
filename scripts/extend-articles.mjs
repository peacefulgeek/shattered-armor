/**
 * Extend Articles Script — The Shattered Armor
 * 
 * Finds all articles under 1800 words and extends them via DeepSeek V4-Pro.
 * Maintains the Kalesh voice, keeps existing Amazon links, and re-gates each article.
 * 
 * Usage: OPENAI_API_KEY=sk-xxx OPENAI_BASE_URL=https://api.deepseek.com OPENAI_MODEL=deepseek-v4-pro node extend-articles.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data', 'articles');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const MIN_WORDS = 1800;
const CONCURRENCY = 1;
const DELAY_MS = 3000;

// ─── BANNED WORDS (quality gate) ────────────────────────────────────
const BANNED_WORDS = [
  'tapestry','delve','landscape','multifaceted','arguably','undeniable',
  'pivotal','realm','embark','encompass','beacon','moreover','furthermore',
  'nevertheless','paramount','intricate','holistic','synergy','paradigm',
  'nuance','robust','comprehensive','leverage','foster','cultivate',
  'illuminate','underscore','resonate','juxtapose','dichotomy','plethora',
  'myriad','catalyst','cornerstone','epitome','quintessential','transcend',
  'ubiquitous','unprecedented','enigma','conundrum','labyrinth','metamorphosis',
  'epiphany','serendipity','idyllic','ethereal','visceral','poignant',
  'evocative','mellifluous','ineffable','sublime','exquisite','luminous',
  'incandescent','ephemeral','gossamer','iridescent','diaphanous','sonorous',
  'dulcet','celestial','verdant','azure','resplendent','magnificent',
  'extraordinary','remarkable','incredible','unbelievable','amazing',
  'stunning','breathtaking','awe-inspiring','mind-blowing','groundbreaking',
  'revolutionary','transformative','game-changing','cutting-edge',
  'navigate','utilize','facilitate','implement','optimize','streamline',
  'fundamentally','essentially','basically','literally','actually',
  'interestingly','importantly','significantly','tremendously','profoundly'
];

const BANNED_PHRASES = [
  'a testament to','at the end of the day','in today\'s world',
  'it is worth noting','it goes without saying','needless to say',
  'the fact of the matter','when all is said and done','in the grand scheme',
  'at its core','the art of','dive into','dive in','deep dive',
  'let\'s explore','without further ado','in this article',
  'have you ever wondered','in conclusion','to sum up','in summary',
  'as we\'ve seen','as mentioned earlier','it\'s important to note',
  'it should be noted','one might argue','it could be argued',
  'there is no denying','it is no secret','the bottom line is',
  'at the heart of','on the other hand','by the same token',
  'in light of','with that being said','having said that',
  'be that as it may','for all intents and purposes',
  'in no uncertain terms','to put it simply','simply put',
  'the reality is','the truth is','the fact remains',
  'it bears mentioning','it bears repeating','suffice it to say',
  'it stands to reason','as luck would have it','lo and behold',
  'first and foremost','last but not least','few and far between'
];

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ');
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function containsBannedContent(html) {
  const lower = html.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) return word;
  }
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  if (html.includes('—')) return 'em-dash';
  return null;
}

function postProcess(html) {
  // Replace em-dashes
  html = html.replace(/—/g, ' - ');
  html = html.replace(/–/g, '-');
  
  // Replace banned words with alternatives
  const replacements = {
    'navigate': 'move through',
    'utilize': 'use',
    'facilitate': 'help with',
    'implement': 'put into practice',
    'optimize': 'improve',
    'streamline': 'simplify',
    'fundamentally': 'at its root',
    'essentially': 'really',
    'basically': 'at its simplest',
    'literally': 'actually',
    'interestingly': 'here is the thing',
    'importantly': 'what matters is',
    'significantly': 'in a real way',
    'tremendously': 'deeply',
    'profoundly': 'deeply',
    'transformative': 'life-changing',
    'comprehensive': 'thorough',
    'extraordinary': 'unusual',
    'remarkable': 'worth noticing',
    'incredible': 'hard to believe',
    'delve': 'look',
    'tapestry': 'pattern',
    'landscape': 'terrain',
    'multifaceted': 'complex',
    'embark': 'start',
    'beacon': 'signal',
    'paramount': 'critical',
    'intricate': 'complex',
    'holistic': 'whole-body',
    'cultivate': 'build',
    'illuminate': 'show',
    'resonate': 'land',
    'plethora': 'many',
    'myriad': 'many',
    'catalyst': 'spark',
    'cornerstone': 'foundation',
    'transcend': 'move beyond',
    'unprecedented': 'never-before-seen',
    'visceral': 'gut-level',
    'poignant': 'moving',
    'sublime': 'powerful',
    'exquisite': 'intense',
  };
  
  for (const [word, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    html = html.replace(regex, replacement);
  }
  
  // Replace banned phrases
  const phraseReplacements = {
    'a testament to': 'proof of',
    'at the end of the day': 'when it comes down to it',
    'dive into': 'get into',
    'dive in': 'get into it',
    'deep dive': 'close look',
    'let\'s explore': 'let me walk you through',
    'in conclusion': 'so here is where we land',
    'it is worth noting': 'notice this',
    'the art of': 'how to',
    'at its core': 'underneath it all',
    'in today\'s world': 'right now',
    'first and foremost': 'first',
    'last but not least': 'and finally',
    'the reality is': 'here is what is true',
    'the truth is': 'honestly',
    'it\'s important to note': 'notice',
    'in light of': 'given',
    'having said that': 'still',
    'simply put': 'said plainly',
  };
  
  for (const [phrase, replacement] of Object.entries(phraseReplacements)) {
    const regex = new RegExp(phrase, 'gi');
    html = html.replace(regex, replacement);
  }
  
  return html;
}

const SYSTEM_PROMPT = `You are Kalesh, a writer who covers complex trauma, nervous system science, and recovery for The Shattered Armor (shatteredarmor.com).

YOUR VOICE:
- You sit beside the reader in their pain. You do not lecture from above.
- You use first person ("I", "my") and direct address ("you", "your") constantly.
- You use contractions naturally (don't, can't, won't, it's, that's, here's, I'm, you're, they're).
- You include conversational markers: "Here's the thing.", "Look,", "Honestly,", "Right?", "Know what I mean?", "Think about it.", "Stay with me here.", "Wild, right?", "Sit with that.", "Notice what just happened in your body."
- You vary sentence length dramatically. Some sentences are 3-5 words. Others run 25-30 words.
- You reference specific researchers by name (Porges, van der Kolk, Levine, Fisher, Schwartz, Dana, Ogden, Walker, Mate).
- You use body-based language: "your chest tightens", "your jaw clenches", "that knot in your stomach".

CRITICAL RULES:
- NEVER use em-dashes (—). Use commas, periods, or " - " instead.
- NEVER use these words: tapestry, delve, landscape, multifaceted, navigate, utilize, facilitate, implement, optimize, streamline, fundamentally, essentially, basically, literally, transformative, comprehensive, extraordinary, remarkable, incredible, resonate, illuminate, cultivate, holistic, paradigm, synergy, leverage, foster, beacon, embark, encompass, paramount, intricate, robust, unprecedented, visceral, poignant, sublime, exquisite, profound, profoundly
- NEVER use these phrases: "a testament to", "dive into", "deep dive", "let's explore", "in conclusion", "it is worth noting", "the art of", "at its core", "in today's world"
- Use at least 8 contractions per 500 words
- Include at least 4 conversational markers throughout`;

async function extendArticle(articlePath, article, currentWordCount) {
  const title = article.title;
  const targetWords = Math.max(1850, currentWordCount + 600); // Add at least 600 words
  
  const userPrompt = `I have an existing article titled "${title}" that is currently ${currentWordCount} words. I need you to EXPAND it to at least ${targetWords} words while maintaining the exact same voice, structure, and all existing Amazon affiliate links.

Here is the current article HTML:

${article.htmlContent}

INSTRUCTIONS:
1. Keep ALL existing content, Amazon links, and structure intact
2. ADD new paragraphs, deeper explanations, more body-based examples, more researcher references
3. Add a new section or expand existing sections with more personal anecdotes, "I remember when..." stories, and somatic awareness prompts
4. The final output MUST be at least ${targetWords} words
5. Return ONLY the complete expanded HTML (no markdown, no code blocks, just raw HTML starting with the first tag)
6. Keep all existing <a> tags with Amazon links exactly as they are
7. Do NOT add any new Amazon links
8. Do NOT wrap in \`\`\`html or any code blocks`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 8000,
    temperature: 0.8,
  });

  let html = response.choices[0].message.content || '';
  
  // Strip code blocks if present
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  // Post-process
  html = postProcess(html);
  
  return html;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  EXTEND ARTICLES — The Shattered Armor');
  console.log(`  Model: ${MODEL}`);
  console.log(`  Target: ${MIN_WORDS}+ words per article`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not set.');
    process.exit(1);
  }

  // Find all articles under MIN_WORDS
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const underMin = [];
  
  for (const file of files) {
    const fpath = path.join(DATA_DIR, file);
    const article = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
    const wc = countWords(article.htmlContent || '');
    if (wc < MIN_WORDS) {
      underMin.push({ file, path: fpath, article, wordCount: wc });
    }
  }

  console.log(`Found ${underMin.length} articles under ${MIN_WORDS} words`);
  console.log(`Processing in batches of ${CONCURRENCY}...\n`);

  let success = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < underMin.length; i += CONCURRENCY) {
    const batch = underMin.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(underMin.length / CONCURRENCY);
    
    const results = await Promise.allSettled(
      batch.map(async (item) => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const newHtml = await extendArticle(item.path, item.article, item.wordCount);
            const newWc = countWords(newHtml);
            
            if (newWc < MIN_WORDS) {
              if (attempt < 3) continue;
              // On last attempt, accept if it's close (within 100 words)
              if (newWc < MIN_WORDS - 100) {
                throw new Error(`Still under ${MIN_WORDS}: ${newWc} words`);
              }
            }
            
            // Check for banned content
            const banned = containsBannedContent(newHtml);
            if (banned && attempt < 3) {
              continue; // Retry
            }
            
            // Save
            item.article.htmlContent = newHtml;
            fs.writeFileSync(item.path, JSON.stringify(item.article));
            return { file: item.file, oldWc: item.wordCount, newWc };
          } catch (err) {
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        success++;
      } else {
        failed++;
        if (r.reason) {
          console.log(`  FAIL: ${r.reason.message || r.reason}`);
        }
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = success / (elapsed / 60);
    const remaining = underMin.length - i - batch.length;
    const eta = remaining > 0 ? Math.round(remaining / (rate || 1)) : 0;
    
    console.log(`Batch ${batchNum}/${totalBatches} | Success: ${success} | Failed: ${failed} | ETA: ${eta} min`);
    
    if (i + CONCURRENCY < underMin.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  COMPLETE: ${success} extended, ${failed} failed`);
  console.log(`  Total time: ${Math.round((Date.now() - startTime) / 60000)} minutes`);
  console.log(`═══════════════════════════════════════════════════════════`);
}

main().catch(console.error);
