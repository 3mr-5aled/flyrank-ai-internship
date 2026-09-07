const path = require('path');
const fs = require('fs');
const { getReportData } = require('./report');
const { renderPdf } = require('./renderer');

async function main() {
  console.log('Fetching report data from SQLite...');
  const data = getReportData();
  const outputPath = path.join(__dirname, 'reports', 'test.pdf');

  console.log(`Rendering PDF to ${outputPath}...`);
  await renderPdf(data, outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Report generated successfully!`);
  console.log(`File size: ${stats.size} bytes`);
  console.log(`Location: ${outputPath}`);
}

main().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
