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

function getCatalogueCacheFilename(url) {
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

function getBookCacheFilename(bookUrl) {
  const parsed = new URL(bookUrl);
  const parts = parsed.pathname.split('/').filter(Boolean);
  let slug = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return path.join(CACHE_DIR, `book-${slug}.html`);
}

async function fetchWithCache(url, cacheFilePath) {
  if (fs.existsSync(cacheFilePath)) {
    const cachedHtml = fs.readFileSync(cacheFilePath, 'utf-8');
    const stat = fs.statSync(cacheFilePath);
    const size = Buffer.byteLength(cachedHtml, 'utf-8');
    console.log(`[CACHE] Loaded from cache: ${cacheFilePath} (${size} bytes)`);
    return { html: cachedHtml, fetchedAt: stat.mtime.toISOString() };
  }

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
    const fetchedAt = new Date().toISOString();

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    fs.writeFileSync(cacheFilePath, htmlContent, 'utf-8');
    console.log(`[FETCH] Fetched from URL: ${url} (${size} bytes)`);
    return { html: htmlContent, fetchedAt };
  } catch (error) {
    console.error(`Fetch error for ${url}: ${error.message}`);
    process.exit(1);
  }
}

async function discoverCatalogueBookLinks() {
  let currentUrl = START_URL;
  let pagesCount = 0;
  const bookItemsMap = new Map();

  while (currentUrl && pagesCount < MAX_PAGES) {
    const cacheFile = getCatalogueCacheFilename(currentUrl);
    const { html } = await fetchWithCache(currentUrl, cacheFile);
    pagesCount++;

    const $ = cheerio.load(html);

    $('article.product_pod h3 a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const absoluteUrl = new URL(href, currentUrl).href;
        if (!bookItemsMap.has(absoluteUrl)) {
          bookItemsMap.set(absoluteUrl, currentUrl);
        }
      }
    });

    const nextHref = $('ul.pager li.next a').attr('href');
    if (nextHref) {
      currentUrl = new URL(nextHref, currentUrl).href;
    } else {
      currentUrl = null;
    }
  }

  console.log(`catalogue_pages=${pagesCount}`);
  console.log(`discovered=${bookItemsMap.size}`);
  return bookItemsMap;
}

function parseBookRecord(html, productUrl, sourcePage, fetchedAt) {
  const $ = cheerio.load(html);
  const productMain = $('.product_main');

  const title = productMain.find('h1').text().trim() || null;
  const priceText = productMain.find('p.price_color').text().trim() || null;

  const rawAvailability = productMain.find('p.availability').text();
  const availabilityText = rawAvailability ? rawAvailability.replace(/\s+/g, ' ').trim() : null;

  const ratingClass = productMain.find('p.star-rating').attr('class') || '';
  const ratingMatch = ratingClass.match(/star-rating\s+(\w+)/);
  const ratingText = ratingMatch ? ratingMatch[1] : null;

  const descElement = $('#product_description + p');
  const descriptionText = descElement.length ? descElement.text().trim() : null;
  const description = descriptionText && descriptionText.length > 0 ? descriptionText : null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: fetchedAt
  };
}

async function extractAllBookDetails() {
  const bookItemsMap = await discoverCatalogueBookLinks();
  const rawRecords = [];

  for (const [productUrl, sourcePage] of bookItemsMap.entries()) {
    const cacheFile = getBookCacheFilename(productUrl);
    const { html, fetchedAt } = await fetchWithCache(productUrl, cacheFile);
    const record = parseBookRecord(html, productUrl, sourcePage, fetchedAt);
    rawRecords.push(record);
  }

  console.log('\nSample Raw Record:');
  console.log(JSON.stringify(rawRecords[0], null, 2));
  console.log(`\nunique_urls=${rawRecords.length}`);

  return rawRecords;
}

extractAllBookDetails();
