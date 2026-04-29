/**
 * DeepSeek V4-Pro Article Writer — The Shattered Armor
 * 
 * Replaces the template-based generateArticleHTML() with real AI-generated content.
 * Uses the OpenAI-compatible SDK pointed at DeepSeek's API.
 * 
 * Model: deepseek-v4-pro (hardcoded, not from env)
 * Auth: process.env.DEEPSEEK_API_KEY
 * Base URL: https://api.deepseek.com (hardcoded)
 */

import OpenAI from 'openai';

// ─── DEEPSEEK CLIENT ────────────────────────────────────────────────
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const MODEL = 'deepseek-chat';

// ─── KALESH VOICE SYSTEM PROMPT ─────────────────────────────────────
const SYSTEM_PROMPT = `You are Kalesh, a writer who covers complex trauma, nervous system science, and recovery. You write for The Shattered Armor (shatteredarmor.com).

YOUR VOICE:
- You sit beside the reader in their pain. You do not lecture from above.
- You use first person ("I", "my") and direct address ("you", "your") constantly.
- You use contractions naturally (don't, can't, won't, it's, that's, here's, I'm, you're, they're).
- You include conversational markers: "Here's the thing.", "Look,", "Honestly,", "Right?", "Know what I mean?", "Think about it.", "Stay with me here.", "Wild, right?", "Sit with that.", "Notice what just happened in your body."
- You vary sentence length dramatically. Some sentences are 3-5 words. Others run 25-30 words. This rhythm matters.
- You reference specific researchers by name (Stephen Porges, Peter Levine, Bessel van der Kolk, Janina Fisher, Richard Schwartz, Pat Ogden, Dan Siegel, Pete Walker, Gabor Mate, Deb Dana) and their actual fields.
- You never wrap up neatly. Endings are open, honest, sometimes uncomfortable.
- You are direct about the wellness industry's failures and toxic positivity.

STRICT RULES — VIOLATIONS CAUSE IMMEDIATE REJECTION:
1. NEVER use em-dashes (—). Use commas, periods, or " - " instead.
2. NEVER use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, game-changing, next-level, world-class, unparalleled, unprecedented, remarkable, extraordinary, exceptional, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, landscape, realm, sphere, domain, arguably, notably, crucially, importantly, essentially, fundamentally, inherently, intrinsically, substantively, streamline, optimize, facilitate, amplify, catalyze, propel, spearhead, orchestrate, navigate, traverse, furthermore, moreover, additionally, consequently, subsequently, thereby, thusly, wherein, whereby.
3. NEVER use these phrases: "it's important to note", "it's worth noting", "in conclusion", "in summary", "a holistic approach", "unlock your potential", "dive deep into", "delve into", "in today's fast-paced world", "when it comes to", "a testament to", "the power of", "the beauty of", "the art of", "the journey of", "plays a crucial role", "plays a vital role", "a wide range of", "manifest", "lean into", "showing up for", "authentic self", "safe space", "hold space", "sacred container", "raise your vibration".
4. Word count MUST be between 1,200 and 2,500 words. Target 1,600-2,000.
5. Output ONLY raw HTML. No markdown. No code fences. No preamble.
6. Use <h2> for section headings (3-5 sections). Use <p> for paragraphs. Use <em> and <strong> sparingly.
7. Do NOT include a title <h1> tag — the site adds that separately.`;

// ─── ARTICLE GENERATION ─────────────────────────────────────────────

/**
 * Generate a full article via DeepSeek V4-Pro.
 * @param {string} title - Article title
 * @param {string} category - Category slug
 * @param {Object[]} products - Array of {name, asin, intro} for inline links
 * @param {string} affiliateTag - Amazon affiliate tag
 * @returns {Promise<string>} HTML content
 */
export async function generateArticleHTML(title, category, products, affiliateTag) {
  const productBlock = products.map((p, i) => 
    `${i + 1}. "${p.name}" — Amazon link: https://www.amazon.com/dp/${p.asin}?tag=${affiliateTag} — Intro phrase: "${p.intro}"`
  ).join('\n');

  const userPrompt = `Write a long-form article titled "${title}" for the category "${category}" on The Shattered Armor.

REQUIREMENTS:
- 1,600-2,000 words (hard floor 1,200, hard ceiling 2,500)
- 3-5 sections with <h2> headings
- Reference at least 2 specific researchers by name and their field
- Include at least 4 conversational markers (e.g., "Here's the thing.", "Right?", "Stay with me here.")
- Use contractions naturally throughout
- Mix short punchy sentences (3-6 words) with longer flowing ones (20-30 words)

AMAZON PRODUCT LINKS — You MUST weave exactly 3-4 of these into the article body naturally, as inline recommendations. Each link should feel like a genuine suggestion, not an ad. Format each as:
<a href="URL" target="_blank" rel="noopener noreferrer">Product Name</a> (paid link)

Available products:
${productBlock}

After the main content, add a "Healing Journey Resources" <h2> section with a <ul> listing all products as <li> items with their links.

End with: <p><em>As an Amazon Associate, I earn from qualifying purchases.</em></p>

OUTPUT: Raw HTML only. No markdown. No code fences. No preamble or explanation.`;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await deepseek.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 4096,
        top_p: 0.95,
      });

      let html = response.choices[0].message.content || '';
      
      // Strip markdown code fences if model wraps output
      html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      
      // Auto-fix em-dashes
      html = html.replace(/\u2014/g, ' - ');
      html = html.replace(/\u2013/g, ' - ');
      html = html.replace(/—/g, ' - ');
      html = html.replace(/–/g, ' - ');
      
      // Strip banned AI words inline
      const BANNED_WORDS = ['delve','tapestry','paradigm','synergy','leverage','unlock','empower','utilize','pivotal','embark','underscore','paramount','seamlessly','robust','beacon','foster','elevate','curate','curated','bespoke','resonate','harness','intricate','plethora','myriad','comprehensive','transformative','groundbreaking','innovative','cutting-edge','revolutionary','state-of-the-art','ever-evolving','game-changing','next-level','world-class','unparalleled','unprecedented','remarkable','extraordinary','exceptional','profound','holistic','nuanced','multifaceted','stakeholders','ecosystem','landscape','realm','sphere','domain','arguably','notably','crucially','importantly','essentially','fundamentally','inherently','intrinsically','substantively','streamline','optimize','facilitate','amplify','catalyze','propel','spearhead','orchestrate','navigate','traverse','furthermore','moreover','additionally','consequently','subsequently','thereby','thusly','wherein','whereby'];
      for (const word of BANNED_WORDS) {
        const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\b`, 'gi');
        html = html.replace(re, '');
      }
      
      // Strip banned phrases
      const BANNED_PHRASES = ["it's important to note","it's worth noting","it's worth mentioning","in conclusion,","in summary,","a holistic approach","unlock your potential","dive deep into","delve into","in today's fast-paced world","when it comes to","a testament to","the power of","the beauty of","the art of","the journey of","plays a crucial role","plays a vital role","a wide range of","manifest","lean into","showing up for","authentic self","safe space","hold space","sacred container","raise your vibration"];
      for (const phrase of BANNED_PHRASES) {
        const re = new RegExp(phrase.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'), 'gi');
        html = html.replace(re, '');
      }
      
      // Clean up double spaces and empty tags
      html = html.replace(/  +/g, ' ');
      html = html.replace(/<p>\s*<\/p>/g, '');

      return html;
    } catch (err) {
      console.error(`[deepseek] Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

/**
 * Generate article content for the refresh/revision crons.
 * Adds new paragraphs to existing content.
 * @param {string} existingContent - Current HTML content
 * @param {string} title - Article title
 * @returns {Promise<string>} New paragraph(s) to insert
 */
export async function generateRefreshContent(existingContent, title) {
  const wordCount = existingContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  
  const userPrompt = `The article "${title}" on The Shattered Armor needs a fresh paragraph added. The article is currently ${wordCount} words.

Write 2-3 new paragraphs (150-300 words total) that:
- Add a new angle or insight to the topic
- Reference a specific researcher (Porges, Levine, van der Kolk, Fisher, Schwartz, Ogden, Siegel, Walker, Mate, or Dana)
- Include at least 1 conversational marker
- Use contractions naturally
- Mix sentence lengths

OUTPUT: Raw HTML paragraphs only (<p> tags). No headings. No code fences. No preamble.`;

  try {
    const response = await deepseek.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    });

    let html = response.choices[0].message.content || '';
    html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    html = html.replace(/\u2014/g, ' - ');
    html = html.replace(/—/g, ' - ');
    html = html.replace(/  +/g, ' ');
    return html;
  } catch (err) {
    console.error(`[deepseek] Refresh generation failed: ${err.message}`);
    return null;
  }
}

export { MODEL, SYSTEM_PROMPT };
