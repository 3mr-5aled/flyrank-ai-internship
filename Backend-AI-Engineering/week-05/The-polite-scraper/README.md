# The Polite Scraper

A polite, robust, and idempotent web scraper built with Node.js and Cheerio, designed to scrape the first 3 catalogue pages of the [Books to Scrape](https://books.toscrape.com) sandbox website.

---

## 🎯 Target Classification

- **Target Site**: Books to Scrape (`https://books.toscrape.com`)
- **Why this site**: Books to Scrape is a public sandbox built specifically for beginners and developers to practice web scraping and validate scraping technologies ("A fictional bookstore that desperately wants to be scraped").
- **Scope**: The first 3 catalogue pages only (`page-1.html`, `page-2.html`, `page-3.html`), discovering up to 60 books.
- **Data Collected**: `title`, `product_url`, `price_text`, `price_gbp`, `availability_text`, `rating_text`, `description`, `source_page`, and `fetched_at`.
- **Why Appropriate**: Scraping this target is appropriate because the site is explicitly created and hosted as a public test sandbox for web scrapers without impacting commercial servers or violating terms of service.
- **Robots.txt Result**: `no robots file found` (HTTP request to `https://books.toscrape.com/robots.txt` returned HTTP 404 Not Found).

> **Checkpoint**: I will not reuse this code on another site without checking its rules and terms first.

---

## 🚀 Installation & Usage

### Prerequisites
- Node.js (v18 or higher recommended)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/3mr-5aled/flyrank-ai-internship.git
   cd flyrank-ai-internship/Backend-AI-Engineering/week-05/The-polite-scraper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the scraper**:
   ```bash
   npm start
   ```

---

## 📋 Record Schema (Zod Schema)

Every record is parsed, cleaned, and strictly validated against the following schema before storage:

```typescript
{
  title: string;              // Required: Book title
  product_url: string;        // Required: Canonical HTTPS URL
  price_text: string;         // Required: Raw price string (e.g., "£51.77")
  price_gbp: number;          // Required: Clean float price (e.g., 51.77)
  availability_text: string;  // Required: In stock status
  rating_text: string;        // Required: Star rating word (e.g., "Three")
  description: string | null; // Optional: Book description or null
  source_page: string;        // Required: Provenance catalogue page URL
  fetched_at: string;         // Required: ISO timestamp when fetched/cached
}
```

---

## 🤝 Politeness & Ethical Scraping Rules

- **Honest User-Agent**: Identifies the crawler transparently (`FlyRankInternshipA9/1.0 (+https://github.com/3mr-5aled/flyrank-ai-internship)`).
- **Request Delays**: Waits at least 500ms before making any network request.
- **Request Timeout**: Enforces a strict 5-second timeout (`AbortSignal.timeout(5000)`) to prevent hanging.
- **Local File Caching**: Saves raw HTML to `cache/` locally. Subsequent runs use the cache, resulting in zero unnecessary HTTP requests to the target site.
- **Selective Retries**: Only retries server errors (`5xx`) or transient network glitches once. Never retries client errors (`404` or `403`).

### 🌐 Why No Headless Browser Was Needed
This assignment required no headless browser (like Puppeteer or Playwright) because the target site serves pre-rendered static HTML, so using a browser would only add unnecessary cost, memory consumption, and execution delay without adding any value.

---

## 🔒 Ethics Note
Always use an official API when one exists. Never attempt to bypass authentication logins, paywalls, or IP blocks. Collect only the data fields strictly required for your objective, and respect server resources at all times.

---

## ⚠️ Honest Limitation
The scraper relies on static HTML structure and CSS selectors of Books to Scrape (`.product_main`, `article.product_pod`, `.pager li.next`). If the target website changes its layout, CSS class names, or transitions to client-side single-page JavaScript rendering, the CSS selectors will require updates.

---

## 📊 Sample Run Report (`output/run-report.json`)

```json
{
  "startTime": "2026-08-08T12:41:55.265Z",
  "endTime": "2026-08-08T12:41:56.735Z",
  "durationMs": 1470,
  "pagesFetched": 1,
  "cacheHits": 63,
  "validRecords": 60,
  "invalidRecords": 0,
  "failedPages": 1,
  "failed_pages": 1
}
```