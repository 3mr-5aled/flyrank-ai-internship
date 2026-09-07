const fs = require('fs');
const path = require('path');
const app = require('./server');

async function testStage5() {
  const server = app.listen(3002, async () => {
    try {
      console.log('Testing Stage 5 Idempotency...');
      const reportsDir = path.join(__dirname, 'reports');
      const getFileCount = () => fs.readdirSync(reportsDir).filter(f => f.endsWith('.pdf')).length;

      const initialCount = getFileCount();
      console.log(`Initial PDF files in reports/: ${initialCount}`);

      // Rapid request 1
      console.log('\nFiring Request 1 (POST /reports)...');
      const res1 = await fetch('http://localhost:3002/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data1 = await res1.json();
      console.log(`Request 1 Response: Status ${res1.status}, ID: ${data1.id}`);

      // Rapid request 2 (Duplicate / double-click)
      console.log('\nFiring Request 2 (POST /reports, rapid duplicate)...');
      const res2 = await fetch('http://localhost:3002/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data2 = await res2.json();
      console.log(`Request 2 Response: Status ${res2.status}, ID: ${data2.id}`);

      const countAfterDuplicates = getFileCount();
      console.log(`File count after duplicate request: ${countAfterDuplicates}`);

      if (data1.id !== data2.id) {
        throw new Error(`Expected identical IDs but got ${data1.id} and ${data2.id}`);
      }
      if (res2.status !== 200) {
        throw new Error(`Expected status 200 for idempotent duplicate, got ${res2.status}`);
      }
      if (countAfterDuplicates !== initialCount) {
        throw new Error(`File count changed on duplicate! Before: ${initialCount}, After: ${countAfterDuplicates}`);
      }
      console.log('Duplicate request check passed: same ID, status 200, 0 new files!');

      // Request 3 with force: true
      console.log('\nFiring Request 3 with { force: true }...');
      const res3 = await fetch('http://localhost:3002/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data3 = await res3.json();
      console.log(`Request 3 Response: Status ${res3.status}, ID: ${data3.id}`);

      const countAfterForce = getFileCount();
      console.log(`File count after forced generation: ${countAfterForce}`);

      if (res3.status !== 201) {
        throw new Error(`Expected status 201 for forced report, got ${res3.status}`);
      }
      if (data3.id === data1.id) {
        throw new Error(`Expected new ID for forced report, but got same ID ${data3.id}`);
      }
      if (countAfterForce !== countAfterDuplicates + 1) {
        throw new Error('Expected exactly 1 new file in reports/ directory');
      }

      console.log('\n Stage 5 Checkpoint Passed Successfully!');
    } catch (err) {
      console.error('Stage 5 test failed:', err);
    } finally {
      server.close();
    }
  });
}

testStage5();
