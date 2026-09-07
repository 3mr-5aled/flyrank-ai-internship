const fs = require('fs');
const path = require('path');
const app = require('./server');

async function testStage4() {
  const server = app.listen(3001, async () => {
    try {
      console.log('Testing Stage 4: POST /reports (timing request)...');
      const startTime = Date.now();
      const postRes = await fetch('http://localhost:3001/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const duration = (Date.now() - startTime) / 1000;
      console.log(`POST /reports completed in ${duration.toFixed(2)}s with status ${postRes.status}`);
      
      const postBody = await postRes.json();
      console.log('Response Body:', postBody);

      if (postRes.status !== 201 || !postBody.id || !postBody.file) {
        throw new Error('POST /reports failed checkpoint expectation');
      }

      const reportId = postBody.id;
      const fileUrl = `http://localhost:3001${postBody.file}`;

      console.log(`\nTesting GET /reports/${reportId}...`);
      const getMetaRes = await fetch(`http://localhost:3001/reports/${reportId}`);
      console.log(`Status: ${getMetaRes.status}`);
      console.log('Metadata:', await getMetaRes.json());

      console.log(`\nTesting GET /reports/999999 (Unknown ID)...`);
      const get404Res = await fetch('http://localhost:3001/reports/999999');
      console.log(`Status: ${get404Res.status} (expected 404)`);

      console.log(`\nTesting GET ${fileUrl} (Download file)...`);
      const downloadRes = await fetch(fileUrl);
      console.log(`Status: ${downloadRes.status}`);
      console.log(`Content-Type: ${downloadRes.headers.get('content-type')}`);

      const arrayBuffer = await downloadRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const downloadPath = path.join(__dirname, 'reports', 'downloaded-stage4.pdf');
      fs.writeFileSync(downloadPath, buffer);
      console.log(`Downloaded ${buffer.length} bytes to ${downloadPath}`);

      const isPdf = buffer.slice(0, 5).toString() === '%PDF-';
      console.log(`Is valid PDF header: ${isPdf}`);

      if (!isPdf) {
        throw new Error('Downloaded file is not a valid PDF');
      }

      console.log('\n Stage 4 Checkpoint Passed Successfully!');
    } catch (err) {
      console.error('Stage 4 test failed:', err);
    } finally {
      server.close();
    }
  });
}

testStage4();
