import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const START_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_PAGES = 3;
const CACHE_DIR = path.resolve('cache');
const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/3mr-5aled/flyrank-ai-internship)';
const REQUEST_TIMEOUT_MS = 5000;
const REQUEST_DELAY_MS = 500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCacheFilename(url) {
  const parsed = new URL(url);
  let basename = path.basename(parsed.pathname);
  if (!basename || basename === 'index.html') {
    basename = 'page-1.html';
  }
  if (!basename.startsWith('catalogue-')) {
    basename = `catalogue-${basename}`;
  }
  return path.join(CACHE_DIR, basename);
}

async function fetchPage(url) {
  const cacheFile = getCacheFilename(url);

  // 1. Check if cached file exists
  if (fs.existsSync(cacheFile)) {
    const cachedHtml = fs.readFileSync(cacheFile, 'utf-8');
    const size = Buffer.byteLength(cachedHtml, 'utf-8');
    console.log(`[CACHE] Loaded from cache: ${cacheFile} (${size} bytes)`);
    return cachedHtml;
  }

  // 2. Wait at least 500ms before making real network request
  await delay(REQUEST_DELAY_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch ${url}. Status code: ${response.status}`);
    }

    const htmlContent = await response.text();
    const size = Buffer.byteLength(htmlContent, 'utf-8');

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    fs.writeFileSync(cacheFile, htmlContent, 'utf-8');
    console.log(`[FETCH] Fetched from URL: ${url} (${size} bytes)`);
    return htmlContent;
  } catch (error) {
    console.error(`Fetch error for ${url}: ${error.message}`);
    process.exit(1);
  }
}

async function discoverCataloguePages() {
  let currentUrl = START_URL;
  let pagesCount = 0;
  const bookUrlsSet = new Set();

  while (currentUrl && pagesCount < MAX_PAGES) {
    const html = await fetchPage(currentUrl);
    pagesCount++;

    const $ = cheerio.load(html);

    // Extract book links on current page
    $('article.product_pod h3 a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        // Resolve relative URL to absolute URL using standard new URL()
        const absoluteUrl = new URL(href, currentUrl).href;
        bookUrlsSet.add(absoluteUrl);
      }
    });

    // Follow catalogue's own 'next' link
    const nextHref = $('ul.pager li.next a').attr('href');
    if (nextHref) {
      currentUrl = new URL(nextHref, currentUrl).href;
    } else {
      currentUrl = null;
    }
  }

  console.log(`catalogue_pages=${pagesCount}`);
  console.log(`discovered=${bookUrlsSet.size}`);
  return { pagesCount, bookUrls: Array.from(bookUrlsSet) };
}

discoverCataloguePages();
