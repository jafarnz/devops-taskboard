

const { By, until, Key } = require('selenium-webdriver');
const { assertTrue, assertEqual } = require('../assertions');
const config = require('../config');


async function openModal(driver) {
  const createBtn = await driver.findElement(By.id('createTaskBtn'));
  await createBtn.click();
  const modal = await driver.findElement(By.id('createTaskModal'));
  await driver.wait(until.elementIsVisible(modal), 3000);
}

/**
 * Tag Management Tests
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Object} Test results
 */
async function runTagTests(driver) {
  const results = { passed: 0, failed: 0, tests: [] };
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('testtag');
    await tagInput.sendKeys(Key.ENTER);
    
    await driver.sleep(100);
    
    const tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 1, 'Should have 1 tag pill');
    
    const inputValue = await tagInput.getAttribute('value');
    assertEqual(inputValue, '', 'Input should be cleared');
    
    results.passed++;
    results.tests.push({ name: 'Adds tag on Enter key and clears input', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Adds tag on Enter key and clears input', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('removeme');
    await tagInput.sendKeys(Key.ENTER);
    await driver.sleep(100);
    
    const removeBtn = await driver.findElement(By.css('#tagInputContainer .tag-remove'));
    await removeBtn.click();
    await driver.sleep(100);
    
    const tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 0, 'Should have no tag pills after removal');
    
    results.passed++;
    results.tests.push({ name: 'Removes tag when X button clicked', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Removes tag when X button clicked', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    
    await tagInput.sendKeys('firsttag');
    await tagInput.sendKeys(Key.ENTER);
    await tagInput.sendKeys('secondtag');
    await tagInput.sendKeys(Key.ENTER);
    await driver.sleep(100);
    
    let tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 2, 'Should have 2 tag pills initially');
    
    await tagInput.sendKeys(Key.BACK_SPACE);
    await driver.sleep(100);
    
    tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 1, 'Should have 1 tag pill after backspace');
    
    results.passed++;
    results.tests.push({ name: 'Removes last tag on Backspace when input is empty', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Removes last tag on Backspace when input is empty', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    
    await tagInput.sendKeys('duplicate');
    await tagInput.sendKeys(Key.ENTER);
    await tagInput.sendKeys('duplicate');
    await tagInput.sendKeys(Key.ENTER);
    await driver.sleep(100);
    
    const tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 1, 'Should only have 1 tag pill (no duplicates)');
    
    results.passed++;
    results.tests.push({ name: 'Prevents duplicate tags from being added', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Prevents duplicate tags from being added', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const tagContainer = await driver.findElement(By.id('tagInputContainer'));
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.click();
    
    await tagContainer.click();
    await driver.sleep(100);
    
    const activeElement = await driver.switchTo().activeElement();
    const activeId = await activeElement.getAttribute('id');
    assertEqual(activeId, 'taskTagsInput', 'Tag input should be focused');
    
    results.passed++;
    results.tests.push({ name: 'Focuses input when clicking tag container', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Focuses input when clicking tag container', status: 'FAIL', error: err.message });
  }
  
  return results;
}

module.exports = { runTagTests };
