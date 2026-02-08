const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

const coverageDir = path.join(process.cwd(), 'coverage/temp'); // Playwright v8 coverage
const istanbulCoverageDir = path.join(process.cwd(), 'coverage/frontend'); // Final report output
const publicJsDir = path.join(process.cwd(), 'public/js');

async function convertCoverage() {
  console.log('Starting coverage conversion...');
  console.log('Coverage source dir:', coverageDir);
  console.log('Output dir:', istanbulCoverageDir);

  try {
    await fs.access(coverageDir);
  } catch {
    console.log('No coverage data found. Run playwright tests first with coverage enabled.');
    console.log('Expected coverage data in:', coverageDir);
    return;
  }

  const coverageMap = createCoverageMap();
  const files = await fs.readdir(coverageDir);
  
  console.log(`Found ${files.length} coverage files`);

  let processedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(coverageDir, file);
    let v8Coverage;
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      v8Coverage = JSON.parse(content);
    } catch (err) {
      console.warn(`Skipping invalid JSON file: ${file}`);
      continue;
    }

    if (!Array.isArray(v8Coverage)) {
      console.warn(`Skipping non-array coverage file: ${file}`);
      continue;
    }

    for (const entry of v8Coverage) {
      if (!entry.url || !entry.source) continue;

      let urlPath;
      try {
        if (entry.url.startsWith('http://') || entry.url.startsWith('https://')) {
          const url = new URL(entry.url);
          if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
            continue;
          }
          urlPath = url.pathname;
        } else if (entry.url.startsWith('file://')) {
          urlPath = new URL(entry.url).pathname;
        } else {
          urlPath = entry.url;
        }
      } catch {
        urlPath = entry.url;
      }

      if (!urlPath.endsWith('.js') || urlPath.includes('node_modules')) {
        continue;
      }

      const fileName = path.basename(urlPath);
      
      if (fileName !== 'jafar.js') {
        continue;
      }
      
      const localFilePath = path.join(publicJsDir, fileName);
      
      try {
        await fs.access(localFilePath);
      } catch {
        const altPath = path.join(process.cwd(), 'public', urlPath);
        try {
          await fs.access(altPath);
        } catch {
          console.warn(`Local file not found: ${localFilePath} or ${altPath}`);
          continue;
        }
      }

      try {
        const converter = v8toIstanbul(localFilePath, 0, { source: entry.source });
        await converter.load();
        converter.applyCoverage(entry.functions);
        coverageMap.merge(converter.toIstanbul());
        processedCount++;
        console.log(`Processed coverage for: ${fileName}`);
      } catch (err) {
        console.warn(`Skipping coverage for ${urlPath}: ${err.message}`);
      }
    }
  }

  console.log(`\nProcessed ${processedCount} coverage entries`);

  if (!Object.keys(coverageMap.data).length) {
    console.log('No coverage data was converted.');
    console.log('Make sure Playwright tests ran with coverage collection enabled.');
    return;
  }

  try {
    await fs.access(istanbulCoverageDir);
  } catch {
    await fs.mkdir(istanbulCoverageDir, { recursive: true });
  }

  const context = createContext({ dir: istanbulCoverageDir, coverageMap });
  
  console.log('\nGenerating reports...');
  ['html', 'text', 'lcovonly', 'json-summary'].forEach(type => {
    try {
      reports.create(type).execute(context);
      console.log(`  - ${type} report generated`);
    } catch (err) {
      console.warn(`  - Failed to generate ${type} report: ${err.message}`);
    }
  });

  console.log(`\nCoverage report generated in ${istanbulCoverageDir}`);
  console.log(`Open ${path.join(istanbulCoverageDir, 'index.html')} in your browser to view.`);

  const summary = coverageMap.getCoverageSummary();
  console.log('\n=== Coverage Summary ===');
  console.log(`Statements: ${summary.statements.pct}%`);
  console.log(`Branches:   ${summary.branches.pct}%`);
  console.log(`Functions:  ${summary.functions.pct}%`);
  console.log(`Lines:      ${summary.lines.pct}%`);

  const thresholds = {
    lines: 80,
    statements: 80,
    functions: 80,
    branches: 80
  };

  let belowThreshold = [];
  for (const [metric, threshold] of Object.entries(thresholds)) {
    const covered = summary[metric].pct;
    if (covered < threshold) {
      belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
    }
  }

  if (belowThreshold.length > 0) {
    console.error('\n✗ Coverage threshold NOT met:');
    belowThreshold.forEach(msg => console.error(`  - ${msg}`));
    process.exitCode = 1;
  } else {
    console.log('\n✓ All coverage thresholds met.');
  }
}

convertCoverage().catch(err => {
  console.error('Coverage conversion failed:', err);
  process.exit(1);
});
