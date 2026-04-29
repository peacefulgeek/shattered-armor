/**
 * Bunny CDN Image Library — The Shattered Armor
 * 
 * Manages a pool of 40 pre-generated hero images in /library/ on Bunny CDN.
 * When a new article is created, it:
 *   1. Picks a random library image
 *   2. Duplicates it on Bunny CDN with the article's slug as filename
 *   3. Returns the unique CDN URL for that article
 * 
 * This gives Google a unique image URL per article while using only 40 source images.
 */

import https from 'https';

// ─── BUNNY CDN CONFIG (hardcoded) ───────────────────────────────────
const BUNNY_STORAGE_ZONE = 'shattered-armor';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_CDN_HOST = 'shattered-armor.b-cdn.net';
const BUNNY_API_KEY = '9973c894-f0ca-4b8c-9b37ee57d56d-3a41-481b';

// 40 library images: library-01.webp through library-40.webp
const LIBRARY_COUNT = 40;
const LIBRARY_PREFIX = 'library/library-';

/**
 * Pick a random library image index (1-40)
 */
function randomLibraryIndex() {
  return Math.floor(Math.random() * LIBRARY_COUNT) + 1;
}

/**
 * Format index to zero-padded string (01, 02, ..., 40)
 */
function padIndex(n) {
  return String(n).padStart(2, '0');
}

/**
 * Download a file from Bunny CDN storage via GET
 */
function downloadFromBunny(remotePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BUNNY_STORAGE_HOST,
      path: `/${BUNNY_STORAGE_ZONE}/${remotePath}`,
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_API_KEY,
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`Bunny GET ${remotePath}: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Upload a buffer to Bunny CDN storage via PUT
 */
function uploadToBunny(remotePath, buffer) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BUNNY_STORAGE_HOST,
      path: `/${BUNNY_STORAGE_ZONE}/${remotePath}`,
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp',
        'Content-Length': buffer.length,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`Bunny PUT ${remotePath}: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

/**
 * Duplicate a library image for a specific article slug.
 * Downloads a random library image and re-uploads it with the article slug as filename.
 * 
 * @param {string} slug - Article slug (e.g., "why-your-body-braces")
 * @returns {Promise<{heroImage: string, ogImage: string}>} CDN URLs
 */
export async function assignArticleImages(slug) {
  const idx = randomLibraryIndex();
  const sourcePath = `${LIBRARY_PREFIX}${padIndex(idx)}.webp`;
  const heroPath = `images/${slug}-hero.webp`;
  const ogPath = `images/${slug}-og.webp`;

  try {
    // Download the library source image
    const imageBuffer = await downloadFromBunny(sourcePath);
    
    // Upload as hero image
    await uploadToBunny(heroPath, imageBuffer);
    
    // Upload as OG image (same image, different URL for SEO)
    await uploadToBunny(ogPath, imageBuffer);

    const heroImage = `https://${BUNNY_CDN_HOST}/${heroPath}`;
    const ogImage = `https://${BUNNY_CDN_HOST}/${ogPath}`;

    console.log(`[bunny-lib] Assigned library-${padIndex(idx)} → ${slug} (hero + og)`);
    return { heroImage, ogImage };
  } catch (err) {
    console.error(`[bunny-lib] Image assignment failed for ${slug}: ${err.message}`);
    // Fallback to default images
    return {
      heroImage: `https://${BUNNY_CDN_HOST}/images/hero-default.webp`,
      ogImage: `https://${BUNNY_CDN_HOST}/images/og-default.webp`,
    };
  }
}

/**
 * Check if the library images exist on Bunny CDN
 * @returns {Promise<{total: number, found: number, missing: number[]}>}
 */
export async function verifyLibrary() {
  const missing = [];
  let found = 0;

  for (let i = 1; i <= LIBRARY_COUNT; i++) {
    const remotePath = `${LIBRARY_PREFIX}${padIndex(i)}.webp`;
    try {
      await downloadFromBunny(remotePath);
      found++;
    } catch {
      missing.push(i);
    }
  }

  return { total: LIBRARY_COUNT, found, missing };
}

export { BUNNY_STORAGE_ZONE, BUNNY_STORAGE_HOST, BUNNY_CDN_HOST, BUNNY_API_KEY, LIBRARY_COUNT };
