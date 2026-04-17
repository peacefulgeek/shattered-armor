/**
 * Amazon ASIN Verification — HTTP GET with soft-404 detection
 * 
 * Used by the ASIN health check cron (Sunday 05:00 UTC).
 * No API keys needed. HTTP GET only.
 * 
 * Adapted from Render Upgrade Addendum Section 5.
 */

const AMAZON_TAG = 'spankyspinola-20';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

// Patterns that indicate a soft-404 (page exists but product doesn't)
const SOFT_404 = [
  /<title>[^<]*Page Not Found[^<]*<\/title>/i,
  /<title>[^<]*Sorry[^<]*<\/title>/i,
  /Looking for something\?[\s\S]{0,600}We're sorry/i,
  /The Web address you entered is not a functioning page/i,
  /Dogs of Amazon/i
];

// Patterns that confirm a real product page
const PRODUCT_SIG = [
  /id="productTitle"/,
  /id="titleSection"/,
  /name="ASIN"[^>]*value="[A-Z0-9]{10}"/,
  /data-asin="[A-Z0-9]{10}"/
];

/**
 * Verify a single ASIN by fetching its Amazon product page.
 * Returns { asin, valid, reason?, title?, url }
 */
export async function verifyAsin(asin) {
  if (!/^[A-Z0-9]{10}$/.test(asin)) return { asin, valid: false, reason: 'malformed' };
  const url = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      redirect: 'follow'
    });
    if (res.status !== 200) return { asin, valid: false, reason: `http-${res.status}`, url };

    // Check if redirected to search results (product doesn't exist)
    if (res.url.includes('/s?k=') || res.url.match(/amazon\.com\/?(\?|$)/)) {
      return { asin, valid: false, reason: 'redirected-to-search', url };
    }

    const html = await res.text();

    // Check for soft-404 patterns
    if (SOFT_404.some(p => p.test(html))) return { asin, valid: false, reason: 'soft-404', url };

    // Check for product page signatures
    if (!PRODUCT_SIG.some(p => p.test(html))) return { asin, valid: false, reason: 'no-product-signature', url };

    // Extract title
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*:\s*Amazon\.com.*$/i, '').trim();
    if (!title || title.length < 10) return { asin, valid: false, reason: 'no-title', url };

    return { asin, valid: true, title, url };
  } catch (err) {
    return { asin, valid: false, reason: `fetch-error: ${err.message}`, url };
  }
}

/**
 * Build an Amazon affiliate URL for an ASIN
 */
export function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

/**
 * Count Amazon affiliate links in text
 */
const LINK_RE = /https:\/\/www\.amazon\.com\/dp\/([A-Z0-9]{10})(?:\/[^"\s?]*)?(?:\?[^"\s]*)?/g;

export function countAmazonLinks(text) {
  return (text.match(LINK_RE) || []).length;
}

/**
 * Extract unique ASINs from text
 */
export function extractAsinsFromText(text) {
  const asins = new Set();
  let m;
  const re = new RegExp(LINK_RE);
  while ((m = re.exec(text)) !== null) asins.add(m[1]);
  return [...asins];
}

/**
 * Verify a batch of ASINs with delay between requests
 */
export async function verifyAsinBatch(asins, delayMs = 2500) {
  const out = [];
  for (let i = 0; i < asins.length; i++) {
    out.push(await verifyAsin(asins[i]));
    if (i < asins.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return out;
}
