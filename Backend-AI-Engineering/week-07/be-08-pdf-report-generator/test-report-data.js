const { getReportData } = require('./report');

const reportData = getReportData();
console.log(JSON.stringify(reportData, null, 2));
