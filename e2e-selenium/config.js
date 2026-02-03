

module.exports = {
  baseUrl: 'http://localhost:3000',
  
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  
  allBrowsers: process.env.SELENIUM_ALL_BROWSERS === 'true',

  browsers: ['chrome', 'firefox'],
  
  timeouts: {
    implicit: 5000,      // Wait for elements to appear
    pageLoad: 10000,     // Wait for page to load
    script: 5000,        // Wait for async scripts
  },
  
  chromeOptions: {
    args: [
      '--headless',           // Run in headless mode
      '--no-sandbox',         // Required for CI environments
      '--disable-gpu',        // Disable GPU acceleration
      '--window-size=1280,720'
    ]
  },
  
  // Firefox-specific options (legacy browser support)
  firefoxOptions: {
    args: ['-headless']
  },
  
  // Edge-specific options (Chromium-based Edge)
  edgeOptions: {
    args: [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1280,720'
    ]
  },
  
  // Safari-specific options (macOS only)
  // Note: Safari doesn't support headless mode
  safariOptions: {
    // Safari Technology Preview can be used for testing
    useTechnologyPreview: false
  }
};
