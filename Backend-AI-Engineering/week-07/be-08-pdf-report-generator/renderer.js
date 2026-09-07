const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function generateHtml(data) {
  const dateFormatted = new Date(data.generated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stars = (count) => '★'.repeat(count) + '☆'.repeat(Math.max(0, 5 - count));

  const topRows = data.top_expensive.map((book, idx) => `
    <tr>
      <td style="text-align: center; font-weight: 600; color: #4b5563;">${idx + 1}</td>
      <td style="font-weight: 500;">${escapeHtml(book.title)}</td>
      <td style="text-align: center; color: #f59e0b; letter-spacing: 1px;">${stars(book.rating)}</td>
      <td style="text-align: right; font-weight: 600; color: #0f172a;">£${Number(book.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const ratingRows = data.rating_breakdown.map((item) => {
    const pct = Math.round((item.count / data.summary.total_books) * 100);
    return `
      <tr>
        <td style="color: #f59e0b; font-weight: 600; letter-spacing: 1px;">${stars(item.rating)} (${item.rating} Star)</td>
        <td style="text-align: center; font-weight: 600;">${item.count}</td>
        <td style="text-align: right; color: #64748b;">${pct}%</td>
      </tr>
    `;
  }).join('');

  const catalogRows = data.all_books.map((book) => `
    <tr>
      <td style="text-align: center; color: #64748b; font-size: 11px;">#${book.id}</td>
      <td style="font-weight: 500;">${escapeHtml(book.title)}</td>
      <td style="text-align: center; color: #f59e0b; font-size: 11px; white-space: nowrap;">${stars(book.rating)}</td>
      <td style="text-align: right; font-weight: 600; white-space: nowrap;">£${Number(book.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bookstore Inventory & Analytics Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
      background-color: #ffffff;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
    }

    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }

    .meta-badge {
      text-align: right;
      background: #f1f5f9;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }

    .meta-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .cards-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      flex: 1;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
    }

    .kpi-card.highlight {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #bae6fd;
    }

    .kpi-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #0369a1;
      margin: 0;
    }

    .kpi-card:not(.highlight) .kpi-value {
      color: #0f172a;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 20px 0 10px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .two-column {
      display: flex;
      gap: 18px;
      margin-bottom: 24px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .column {
      flex: 1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    /* Print CSS Trap Solutions */
    thead {
      display: table-header-group;
    }

    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      text-align: left;
    }

    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
      vertical-align: middle;
    }

    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .catalog-table th {
      background-color: #1e293b;
    }

    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h1 class="brand-title">The Bookstore Intelligence Report</h1>
      <p class="brand-subtitle">Executive Inventory, Valuation & Rating Distribution Analysis</p>
    </div>
    <div class="meta-badge">
      <div class="meta-label">Report Date</div>
      <div class="meta-value">${dateFormatted}</div>
    </div>
  </div>

  <div class="cards-grid">
    <div class="kpi-card highlight">
      <div class="kpi-title">Total Books in Catalog</div>
      <div class="kpi-value">${data.summary.total_books}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Average Catalog Price</div>
      <div class="kpi-value">£${Number(data.summary.average_price).toFixed(2)}</div>
    </div>
  </div>

  <div class="two-column">
    <div class="column">
      <div class="section-title">Top 5 Most Expensive Titles</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th>Title</th>
            <th style="width: 80px; text-align: center;">Rating</th>
            <th style="width: 65px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${topRows}
        </tbody>
      </table>
    </div>
    
    <div class="column">
      <div class="section-title">Rating Distribution</div>
      <table>
        <thead>
          <tr>
            <th>Star Rating</th>
            <th style="width: 60px; text-align: center;">Count</th>
            <th style="width: 50px; text-align: right;">Share</th>
          </tr>
        </thead>
        <tbody>
          ${ratingRows}
        </tbody>
      </table>
    </div>
  </div>

  <div class="section-title">Complete Catalog Directory (${data.all_books.length} items)</div>
  <table class="catalog-table">
    <thead>
      <tr>
        <th style="width: 45px; text-align: center;">ID</th>
        <th>Book Title</th>
        <th style="width: 95px; text-align: center;">Rating</th>
        <th style="width: 75px; text-align: right;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${catalogRows}
    </tbody>
  </table>

  <div class="footer">
    The Bookstore Automated PDF Report Engine · Generated from SQLite report.db via Playwright Headless Chromium
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function renderPdf(reportData, outputPath) {
  const html = generateHtml(reportData);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '12mm',
        right: '12mm'
      }
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}

module.exports = { generateHtml, renderPdf };
