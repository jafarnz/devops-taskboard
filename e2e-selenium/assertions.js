/**
 * Selenium Test Assertions Helper
 * 
 * Simple assertion utilities for Selenium tests.
 */

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Asserts that a condition is true
 * @param {boolean} condition - The condition to check
 * @param {string} message - Error message if assertion fails
 */
function assertTrue(condition, message = 'Expected condition to be true') {
  if (!condition) {
    throw new AssertionError(message);
  }
}

/**
 * Asserts that two values are equal
 * @param {*} actual - The actual value
 * @param {*} expected - The expected value
 * @param {string} message - Error message if assertion fails
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError(message || `Expected "${expected}" but got "${actual}"`);
  }
}

/**
 * Asserts that a string contains a substring
 * @param {string} str - The string to check
 * @param {string} substring - The substring to find
 * @param {string} message - Error message if assertion fails
 */
function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new AssertionError(message || `Expected "${str}" to contain "${substring}"`);
  }
}

/**
 * Asserts that an element is visible
 * @param {WebElement} element - The element to check
 * @param {string} message - Error message if assertion fails
 */
async function assertVisible(element, message = 'Expected element to be visible') {
  const isDisplayed = await element.isDisplayed();
  if (!isDisplayed) {
    throw new AssertionError(message);
  }
}

/**
 * Asserts that an element is not visible
 * @param {WebElement} element - The element to check
 * @param {string} message - Error message if assertion fails
 */
async function assertNotVisible(element, message = 'Expected element to not be visible') {
  try {
    const isDisplayed = await element.isDisplayed();
    if (isDisplayed) {
      throw new AssertionError(message);
    }
  } catch (err) {
    // Element not found is also considered "not visible"
    if (err.name === 'NoSuchElementError') {
      return;
    }
    throw err;
  }
}

module.exports = {
  AssertionError,
  assertTrue,
  assertEqual,
  assertContains,
  assertVisible,
  assertNotVisible,
};
