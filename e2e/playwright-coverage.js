
const fs = require('fs');
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');

const JAFAR_JS_PATH = path.join(__dirname, '..', 'public', 'js', 'jafar.js');
const COVERAGE_DIR = path.join(__dirname, '..', 'coverage-frontend');

async function collectCoverage(page) {
  await page.coverage.startJSCoverage();
  return async () => {
    const coverage = await page.coverage.stopJSCoverage();
    return coverage;
  };
}

async function processCoverage(coverageData) {
  const jafarCoverage = coverageData.filter(entry => 
    entry.url.includes('jafar.js')
  );

  if (jafarCoverage.length === 0) {
    console.log('No coverage data for jafar.js');
    return null;
  }

  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(COVERAGE_DIR, 'jafar-coverage.json'),
    JSON.stringify(jafarCoverage, null, 2)
  );

  return jafarCoverage;
}

function calculateCoveragePercentage(coverageData) {
  if (!coverageData || coverageData.length === 0) return 0;
  
  let totalBytes = 0;
  let usedBytes = 0;

  coverageData.forEach(entry => {
    totalBytes += entry.text.length;
    entry.ranges.forEach(range => {
      usedBytes += range.end - range.start;
    });
  });

  return totalBytes > 0 ? ((usedBytes / totalBytes) * 100).toFixed(2) : 0;
}

module.exports = {
  collectCoverage,
  processCoverage,
  calculateCoveragePercentage,
  JAFAR_JS_PATH,
  COVERAGE_DIR,
};
