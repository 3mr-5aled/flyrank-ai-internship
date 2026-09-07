const express = require('express');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

const db = new DatabaseSync(path.join(__dirname, 'report.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    rating INTEGER,
    url TEXT
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
    created_at TEXT
  );
`);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/reports', async (req, res) => {
  const force = req.body && req.body.force;
  const today = new Date().toISOString().slice(0, 10);

  if (!force) {
    const existing = db.prepare("SELECT * FROM reports WHERE created_at LIKE ? ORDER BY id DESC LIMIT 1").get(`${today}%`);
    if (existing) {
      return res.status(200).json({ id: existing.id, file: `/reports/${existing.id}/file` });
    }
  }

  // Aggregation queries
  const total = db.prepare("SELECT COUNT(*) as count FROM books").get().count;
  const avg = db.prepare("SELECT AVG(price) as avg_price FROM books").get().avg_price;
  const top5 = db.prepare("SELECT * FROM books ORDER BY price DESC LIMIT 5").all();
  const ratings = db.prepare("SELECT rating, COUNT(*) as count FROM books GROUP BY rating").all();
  const allBooks = db.prepare("SELECT * FROM books").all();

  // HTML template
  const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          tr { break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>Bookstore Report - ${today}</h1>
        <p>Total Books: ${total} | Average Price: £${Number(avg).toFixed(2)}</p>
        <h2>Top 5 Expensive Books</h2>
        <table>
          <tr><th>Title</th><th>Price</th><th>Rating</th></tr>
          ${top5.map(b => `<tr><td>${b.title}</td><td>£${b.price}</td><td>${b.rating}</td></tr>`).join('')}
        </table>
        <h2>Rating Breakdown</h2>
        <table>
          <tr><th>Rating</th><th>Count</th></tr>
          ${ratings.map(r => `<tr><td>${r.rating} Stars</td><td>${r.count}</td></tr>`).join('')}
        </table>
        <h2>All Books</h2>
        <table>
          <tr><th>ID</th><th>Title</th><th>Price</th><th>Rating</th></tr>
          ${allBooks.map(b => `<tr><td>${b.id}</td><td>${b.title}</td><td>£${b.price}</td><td>${b.rating}</td></tr>`).join('')}
        </table>
      </body>
    </html>
  `;

  if (!fs.existsSync(path.join(__dirname, 'reports'))) {
    fs.mkdirSync(path.join(__dirname, 'reports'));
  }

  const insert = db.prepare("INSERT INTO reports (path, created_at) VALUES ('', ?)").run(new Date().toISOString());
  const reportId = insert.lastInsertRowid;
  const pdfPath = path.join(__dirname, 'reports', `${reportId}.pdf`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();

  db.prepare("UPDATE reports SET path = ? WHERE id = ?").run(pdfPath, reportId);

  res.status(201).json({ id: reportId, file: `/reports/${reportId}/file` });
});

app.get('/reports/:id', (req, res) => {
  const report = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  res.json({ id: report.id, path: report.path, created_at: report.created_at, file: `/reports/${report.id}/file` });
});

app.get('/reports/:id/file', (req, res) => {
  const report = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!report || !fs.existsSync(report.path)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(report.path);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`AI version on port ${PORT}`));
}

module.exports = app;
