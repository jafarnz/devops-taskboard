/**
 * Selenium WebDriver Factory
 * 
 * Creates and configures WebDriver instances for testing.
 * Supports legacy browsers: Chrome, Firefox, Edge, Safari
 */

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const safari = require('selenium-webdriver/safari');
const config = require('./config');

/**
 * Creates a new WebDriver instance based on configuration
 * @param {string} browserName - Optional browser name override
 * @returns {Promise<WebDriver>} Configured WebDriver instance
 */
async function createDriver(browserName = null) {
  const browser = browserName || config.browser;
  const builder = new Builder();
  
  switch (browser.toLowerCase()) {
    case 'chrome':
      const chromeOptions = new chrome.Options();
      config.chromeOptions.args.forEach(arg => chromeOptions.addArguments(arg));
      builder.forBrowser('chrome').setChromeOptions(chromeOptions);
      break;
      
    case 'firefox':
      const firefoxOptions = new firefox.Options();
      config.firefoxOptions.args.forEach(arg => firefoxOptions.addArguments(arg));
      builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
      break;
      
    case 'edge':
    case 'msedge':
      const edgeOptions = new edge.Options();
      config.edgeOptions.args.forEach(arg => edgeOptions.addArguments(arg));
      builder.forBrowser('MicrosoftEdge').setEdgeOptions(edgeOptions);
      break;
      
    case 'safari':
      const safariOptions = new safari.Options();
      if (config.safariOptions.useTechnologyPreview) {
        safariOptions.setTechnologyPreview(true);
      }
      builder.forBrowser('safari').setSafariOptions(safariOptions);
      break;
      
    default:
      // Fallback for other browsers
      builder.forBrowser(browser);
  }
  
  const driver = await builder.build();
  
  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: config.timeouts.implicit,
    pageLoad: config.timeouts.pageLoad,
    script: config.timeouts.script,
  });
  
  return driver;
}

/**
 * Checks if a browser is available on the system
 * @param {string} browserName - Name of the browser to check
 * @returns {Promise<boolean>} True if browser is available
 */
async function isBrowserAvailable(browserName) {
  try {
    const driver = await createDriver(browserName);
    await driver.quit();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Gets list of available browsers on the system
 * @returns {Promise<string[]>} List of available browser names
 */
async function getAvailableBrowsers() {
  const available = [];
  for (const browser of config.browsers) {
    if (await isBrowserAvailable(browser)) {
      available.push(browser);
    }
  }
  return available;
}

/**
 * Quits the WebDriver instance
 * @param {WebDriver} driver - The WebDriver instance to quit
 */
async function quitDriver(driver) {
  if (driver) {
    await driver.quit();
  }
}

module.exports = {
  createDriver,
  quitDriver,
  isBrowserAvailable,
  getAvailableBrowsers,
};
