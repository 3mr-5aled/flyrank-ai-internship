import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { z } from 'zod';

const START_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const FAKE_BOOK_URL = 'https://books.toscrape.com/catalogue/fake-broken-book_99999/index.html';
const MAX_PAGES = 3;
const CACHE_DIR = path.resolve('cache');
const OUTPUT_DIR = path.resolve('output');
const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/3mr-5aled/flyrank-ai-internship)';
const REQUEST_TIMEOUT_MS = 5000;
const REQUEST_DELAY_MS = 500;

// Zod Schema for validated book record
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

async function fetchWithRetryAndCache(url, cacheFilePath, stats) {
  if (fs.existsSync(cacheFilePath)) {
    const cachedHtml = fs.readFileSync(cacheFilePath, 'utf-8');
    const stat = fs.statSync(cacheFilePath);
    const size = Buffer.byteLength(cachedHtml, 'utf-8');
    console.log(`[CACHE] Loaded from cache: ${cacheFilePath} (${size} bytes)`);
    stats.cacheHits++;
    return { html: cachedHtml, fetchedAt: stat.mtime.toISOString() };
  }

  const performFetch = async () => {
    await delay(REQUEST_DELAY_MS);
    return await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  };

  try {
    stats.pagesFetched++;
    let response = await performFetch();

    // Selective retry for 5xx server errors (Do NOT retry 404 or 403)
    if (response.status >= 500 && response.status < 600) {
      console.warn(`[RETRY] Server error ${response.status} for ${url}. Retrying once...`);
      await delay(1000);
      stats.pagesFetched++;
      response = await performFetch();
    }

    if (response.status !== 200) {
      throw new Error(`HTTP status code ${response.status} (No retry for 40x client errors)`);
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
    // Retry once for network timeouts (if not explicit 404/403)
    if (!error.message.includes('404') && !error.message.includes('403')) {
      try {
        console.warn(`[RETRY] Network exception on ${url}: ${error.message}. Retrying once...`);
        await delay(1000);
        stats.pagesFetched++;
        const response = await performFetch();
        if (response.status === 200) {
          const htmlContent = await response.text();
          const size = Buffer.byteLength(htmlContent, 'utf-8');
          const fetchedAt = new Date().toISOString();
          fs.writeFileSync(cacheFilePath, htmlContent, 'utf-8');
          console.log(`[FETCH SUCCESS AFTER RETRY] ${url} (${size} bytes)`);
          return { html: htmlContent, fetchedAt };
        }
      } catch (retryErr) {
        // Fall through to throw original error
      }
    }
    throw error;
  }
}

async function discoverCatalogueBookLinks(stats) {
  let currentUrl = START_URL;
  let pagesCount = 0;
  const bookItemsMap = new Map();

  while (currentUrl && pagesCount < MAX_PAGES) {
    try {
      const cacheFile = getCatalogueCacheFilename(currentUrl);
      const { html } = await fetchWithRetryAndCache(currentUrl, cacheFile, stats);
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
    } catch (err) {
      console.error(`[SKIP CATALOGUE PAGE] Failed ${currentUrl}: ${err.message}`);
      stats.failedPages++;
      break;
    }
  }

  // Intentionally inject one made-up broken URL to prove fault tolerance
  bookItemsMap.set(FAKE_BOOK_URL, START_URL);

  console.log(`catalogue_pages=${pagesCount}`);
  console.log(`discovered=${bookItemsMap.size} (including 1 intentional test fake URL)`);
  return bookItemsMap;
}

function parseAndCleanBookRecord(html, productUrl, sourcePage, fetchedAt) {
  const $ = cheerio.load(html);
  const productMain = $('.product_main');

  const title = productMain.find('h1').text().trim() || null;
  const priceText = productMain.find('p.price_color').text().trim() || null;

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
  const startTime = new Date();
  const stats = {
    pagesFetched: 0,
    cacheHits: 0,
    validRecords: 0,
    invalidRecords: 0,
    failedPages: 0
  };

  const bookItemsMap = await discoverCatalogueBookLinks(stats);
  const validRecordsMap = new Map();
  const invalidRecords = [];

  // Handle each book page independently so one bad page doesn't kill the run
  for (const [productUrl, sourcePage] of bookItemsMap.entries()) {
    try {
      const cacheFile = getBookCacheFilename(productUrl);
      const { html, fetchedAt } = await fetchWithRetryAndCache(productUrl, cacheFile, stats);
      const record = parseAndCleanBookRecord(html, productUrl, sourcePage, fetchedAt);

      const validation = BookSchema.safeParse(record);
      if (validation.success) {
        validRecordsMap.set(record.product_url, validation.data);
        stats.validRecords++;
      } else {
        invalidRecords.push({ record, errors: validation.error.format() });
        stats.invalidRecords++;
      }
    } catch (error) {
      console.error(`[ISOLATED PAGE FAILURE] Skipped ${productUrl}: ${error.message}`);
      stats.failedPages++;
    }
  }

  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const validRecords = Array.from(validRecordsMap.values());

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputBooksFile = path.join(OUTPUT_DIR, 'books.json');
  const rootBooksFile = path.resolve('books.json');
  const outputErrorsFile = path.resolve('errors.json');
  const runReportFile = path.join(OUTPUT_DIR, 'run-report.json');

  const reportData = {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMs,
    pagesFetched: stats.pagesFetched,
    cacheHits: stats.cacheHits,
    validRecords: stats.validRecords,
    invalidRecords: stats.invalidRecords,
    failedPages: stats.failedPages,
    failed_pages: stats.failedPages
  };

  fs.writeFileSync(outputBooksFile, JSON.stringify(validRecords, null, 2), 'utf-8');
  fs.writeFileSync(rootBooksFile, JSON.stringify(validRecords, null, 2), 'utf-8');
  fs.writeFileSync(outputErrorsFile, JSON.stringify(invalidRecords, null, 2), 'utf-8');
  fs.writeFileSync(runReportFile, JSON.stringify(reportData, null, 2), 'utf-8');

  console.log(`\n--- RUN REPORT ---`);
  console.log(JSON.stringify(reportData, null, 2));

  return validRecords;
}

runPipeline();
