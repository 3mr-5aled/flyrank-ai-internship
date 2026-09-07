const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./db');
const { getReportData } = require('./report');
const { renderPdf } = require('./renderer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// GET /reports - Control panel: list all generated reports
app.get('/reports', (req, res) => {
  try {
    const db = getDb();
    const reports = db.prepare("SELECT id, path, created_at FROM reports WHERE path != '' ORDER BY id DESC").all();
    const formatted = reports.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      file: `/reports/${r.id}/file`
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error listing reports:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /reports - Generate report (Idempotent: once per day unless force: true)
app.post('/reports', async (req, res) => {
  try {
    const db = getDb();
    const isForced = Boolean(req.body && req.body.force === true);
    const minRating = req.body && typeof req.body.min_rating === 'number' ? req.body.min_rating : null;
    const todayPrefix = new Date().toISOString().slice(0, 10);

    // Stage 5 Idempotency Check: if a report was already generated today, return existing id & link
    if (!isForced) {
      const existing = db.prepare(`
        SELECT id, path, created_at
        FROM reports
        WHERE created_at LIKE ? AND path != ''
        ORDER BY id DESC
        LIMIT 1;
      `).get(`${todayPrefix}%`);

      if (existing && fs.existsSync(path.resolve(__dirname, existing.path))) {
        return res.status(200).json({
          id: existing.id,
          file: `/reports/${existing.id}/file`
        });
      }
    }

    const createdAt = new Date().toISOString();

    // 1. Reserve report ID
    const insertResult = db.prepare('INSERT INTO reports (path, created_at) VALUES (?, ?)').run('', createdAt);
    const reportId = Number(insertResult.lastInsertRowid);

    // 2. Query and Render
    const fileName = `${reportId}.pdf`;
    const relativePath = path.join('reports', fileName);
    const absolutePath = path.join(__dirname, relativePath);

    const reportData = getReportData({ min_rating: minRating });
    await renderPdf(reportData, absolutePath);

    // 3. Update report record with file path
    db.prepare('UPDATE reports SET path = ? WHERE id = ?').run(relativePath, reportId);

    // 4. Return 201 Created with JSON pointer link
    return res.status(201).json({
      id: reportId,
      file: `/reports/${reportId}/file`
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /reports/:id - Metadata including file link
app.get('/reports/:id', (req, res) => {
  try {
    const db = getDb();
    const reportId = req.params.id;
    const report = db.prepare('SELECT id, path, created_at FROM reports WHERE id = ?').get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({
      id: report.id,
      path: report.path,
      created_at: report.created_at,
      file: `/reports/${report.id}/file`
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reports/:id/file - Serve PDF file from disk
app.get('/reports/:id/file', (req, res) => {
  try {
    const db = getDb();
    const reportId = req.params.id;
    const report = db.prepare('SELECT id, path, created_at FROM reports WHERE id = ?').get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const absolutePath = path.resolve(__dirname, report.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Report file missing from disk' });
    }

    const dateStr = report.created_at.slice(0, 10);
    const downloadFilename = `bookstore-report-${dateStr}-id${report.id}.pdf`;

    return res.sendFile(absolutePath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${downloadFilename}"`
      }
    });
  } catch (error) {
    console.error('Error serving report file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Report API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
