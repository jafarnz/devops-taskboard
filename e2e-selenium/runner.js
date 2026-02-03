

const { spawn } = require('child_process');
const { createDriver, quitDriver, getAvailableBrowsers } = require('./driver');
const { runModalTests } = require('./tests/modal.test');
const { runTagTests } = require('./tests/tags.test');
const { runValidationTests } = require('./tests/validation.test');
const { runSubmissionTests } = require('./tests/submission.test');
const config = require('./config');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Starts the web server
 * @returns {Promise<ChildProcess>} The server process
 */
async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['index.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    let started = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('3000') && !started) {
        started = true;
        setTimeout(() => resolve(server), 500); // Give server time to fully start
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    server.on('error', (err) => {
      reject(err);
    });
    
    // Timeout if server doesn't start
    setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error('Server failed to start within timeout'));
      }
    }, 10000);
  });
}

/**
 * Prints test results
 * @param {string} suiteName - Name of the test suite
 * @param {Object} results - Test results object
 */
function printResults(suiteName, results) {
  console.log(`\n${colors.cyan}${colors.bold}${suiteName}${colors.reset}`);
  console.log('─'.repeat(50));
  
  for (const test of results.tests) {
    if (test.status === 'PASS') {
      console.log(`  ${colors.green}✓${colors.reset} ${test.name}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${test.name}`);
      if (test.error) {
        console.log(`    ${colors.red}${test.error}${colors.reset}`);
      }
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bold}Selenium Test Runner${colors.reset}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('═'.repeat(50));
  
  let server = null;
  let grandTotalPassed = 0;
  let grandTotalFailed = 0;
  const browserResults = [];
  
  // Determine which browsers to test
  let browsersToTest = [config.browser];
  if (config.allBrowsers) {
    console.log('\nDetecting available browsers...');
    browsersToTest = await getAvailableBrowsers();
    if (browsersToTest.length === 0) {
      console.error(`${colors.red}No browsers available for testing${colors.reset}`);
      process.exit(1);
    }
    console.log(`Found browsers: ${browsersToTest.join(', ')}`);
  }
  
  try {
    // Start the server
    console.log('\nStarting server...');
    server = await startServer();
    console.log(`${colors.green}Server started${colors.reset}`);
    
    // Run tests on each browser
    for (const browserName of browsersToTest) {
      let driver = null;
      let totalPassed = 0;
      let totalFailed = 0;
      
      console.log(`\n${colors.bold}${colors.cyan}══ Testing on ${browserName.toUpperCase()} ══${colors.reset}`);
      
      try {
        // Create WebDriver for this browser
        console.log(`Starting ${browserName}...`);
        driver = await createDriver(browserName);
        console.log(`${colors.green}${browserName} started${colors.reset}`);
        
        // Run test suites
        const suites = [
          { name: 'Modal Tests', run: runModalTests },
          { name: 'Tag Tests', run: runTagTests },
          { name: 'Validation Tests', run: runValidationTests },
          { name: 'Submission Tests', run: runSubmissionTests },
        ];
        
        for (const suite of suites) {
          const results = await suite.run(driver);
          printResults(suite.name, results);
          totalPassed += results.passed;
          totalFailed += results.failed;
        }
        
      } catch (err) {
        console.error(`${colors.red}Error with ${browserName}: ${err.message}${colors.reset}`);
        totalFailed++;
      } finally {
        if (driver) {
          await quitDriver(driver);
          console.log(`${browserName} closed`);
        }
      }
      
      browserResults.push({ browser: browserName, passed: totalPassed, failed: totalFailed });
      grandTotalPassed += totalPassed;
      grandTotalFailed += totalFailed;
    }
    
  } catch (err) {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    grandTotalFailed++;
  } finally {
    // Cleanup
    if (server) {
      server.kill();
      console.log('\nServer stopped');
    }
  }
  
  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log(`${colors.bold}Summary${colors.reset}`);
  
  if (browserResults.length > 1) {
    console.log('\nBy Browser:');
    for (const result of browserResults) {
      const status = result.failed === 0 ? colors.green : colors.red;
      console.log(`  ${result.browser}: ${status}${result.passed} passed, ${result.failed} failed${colors.reset}`);
    }
    console.log('');
  }
  
  console.log(`  ${colors.green}Total Passed: ${grandTotalPassed}${colors.reset}`);
  console.log(`  ${colors.red}Total Failed: ${grandTotalFailed}${colors.reset}`);
  console.log(`  Total Tests: ${grandTotalPassed + grandTotalFailed}`);
  console.log('═'.repeat(50));
  
  // Exit with appropriate code
  process.exit(grandTotalFailed > 0 ? 1 : 0);
}

// Run tests
runTests();
