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

// POST /reports - Generate report
app.post('/reports', async (req, res) => {
  try {
    const db = getDb();
    const createdAt = new Date().toISOString();

    // 1. Reserve report ID
    const insertResult = db.prepare('INSERT INTO reports (path, created_at) VALUES (?, ?)').run('', createdAt);
    const reportId = Number(insertResult.lastInsertRowid);

    // 2. Query and Render
    const fileName = `${reportId}.pdf`;
    const relativePath = path.join('reports', fileName);
    const absolutePath = path.join(__dirname, relativePath);

    const reportData = getReportData();
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
    const report = db.prepare('SELECT id, path FROM reports WHERE id = ?').get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const absolutePath = path.resolve(__dirname, report.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Report file missing from disk' });
    }

    return res.sendFile(absolutePath);
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
