import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { z } from 'zod';

const START_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_PAGES = 3;
const CACHE_DIR = path.resolve('cache');
const OUTPUT_DIR = path.resolve('output');
const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/3mr-5aled/flyrank-ai-internship)';
const REQUEST_TIMEOUT_MS = 5000;
const REQUEST_DELAY_MS = 500;

// Define Zod Schema for finished book record
const BookSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  product_url: z.string().url('Must be a valid URL').startsWith('https://', 'URL must start with https://'),
  price_text: z.string().min(1, 'Price text cannot be empty'),
  price_gbp: z.number().positive('Price must be a positive number'),
  availability_text: z.string().min(1, 'Availability text cannot be empty'),
  rating_text: z.string().min(1, 'Rating text cannot be empty'),
  description: z.string().nullable(),
  source_page: z.string().url('Source page must be a valid URL'),
  fetched_at: z.string().min(1, 'Fetched timestamp required')
});

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

function parseAndCleanBookRecord(html, productUrl, sourcePage, fetchedAt) {
  const $ = cheerio.load(html);
  const productMain = $('.product_main');

  const title = productMain.find('h1').text().trim() || null;
  const priceText = productMain.find('p.price_color').text().trim() || null;

  // Convert raw price string ("£51.77") to clean float (51.77)
  let priceGbp = null;
  if (priceText) {
    const match = priceText.match(/[0-9.]+/);
    if (match) {
      priceGbp = parseFloat(match[0]);
    }
  }

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
    price_gbp: priceGbp,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: fetchedAt
  };
}

async function runPipeline() {
  const bookItemsMap = await discoverCatalogueBookLinks();
  const validRecordsMap = new Map(); // Canonical identity: product_url -> validated record
  const invalidRecords = [];

  for (const [productUrl, sourcePage] of bookItemsMap.entries()) {
    const cacheFile = getBookCacheFilename(productUrl);
    const { html, fetchedAt } = await fetchWithCache(productUrl, cacheFile);
    const record = parseAndCleanBookRecord(html, productUrl, sourcePage, fetchedAt);

    // Validate against Zod schema before storing
    const validation = BookSchema.safeParse(record);
    if (validation.success) {
      validRecordsMap.set(record.product_url, validation.data);
    } else {
      invalidRecords.push({
        record,
        errors: validation.error.format()
      });
    }
  }

  const validRecords = Array.from(validRecordsMap.values());

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputBooksFile = path.join(OUTPUT_DIR, 'books.json');
  const rootBooksFile = path.resolve('books.json');
  const outputErrorsFile = path.resolve('errors.json');

  // Store output idempotently
  fs.writeFileSync(outputBooksFile, JSON.stringify(validRecords, null, 2), 'utf-8');
  fs.writeFileSync(rootBooksFile, JSON.stringify(validRecords, null, 2), 'utf-8');
  fs.writeFileSync(outputErrorsFile, JSON.stringify(invalidRecords, null, 2), 'utf-8');

  const allHttps = validRecords.every((r) => r.product_url.startsWith('https://'));

  console.log(`\nbooks_count=${validRecords.length}`);
  console.log(`errors_count=${invalidRecords.length}`);
  console.log(`all_https=${allHttps}`);

  return validRecords;
}

runPipeline();
