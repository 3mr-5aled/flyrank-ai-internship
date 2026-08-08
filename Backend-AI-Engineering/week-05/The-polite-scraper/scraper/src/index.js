import fs from 'node:fs';
import path from 'node:path';

const PAGE_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const CACHE_DIR = path.resolve('cache');
const CACHE_FILE = path.join(CACHE_DIR, 'catalogue-page-1.html');
const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/3mr-5aled/flyrank-ai-internship)';
const REQUEST_TIMEOUT_MS = 5000;

async function getCataloguePage() {
  // 1. Check if cached file exists
  if (fs.existsSync(CACHE_FILE)) {
    const cachedHtml = fs.readFileSync(CACHE_FILE, 'utf-8');
    const size = Buffer.byteLength(cachedHtml, 'utf-8');
    console.log(`[CACHE] Loaded from local cache file: ${CACHE_FILE} (Size: ${size} bytes)`);
    return cachedHtml;
  }

  // 2. Fetch page if not cached
  try {
    const response = await fetch(PAGE_URL, {
      headers: {
        'User-Agent': USER_AGENT
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    // 3. Verify status code is 200 OK
    if (response.status !== 200) {
      throw new Error(`Failed to fetch ${PAGE_URL}. Unexpected status code: ${response.status}`);
    }

    const htmlContent = await response.text();
    const size = Buffer.byteLength(htmlContent, 'utf-8');

    // 4. Save HTML content to cache directory
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE, htmlContent, 'utf-8');
    console.log(`[FETCH] Fetched from URL: ${PAGE_URL} (Status: ${response.status}, Size: ${size} bytes)`);
    return htmlContent;
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    process.exit(1);
  }
}

getCataloguePage();
