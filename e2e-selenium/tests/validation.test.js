
const { By, until, Key } = require('selenium-webdriver');
const { assertTrue, assertContains } = require('../assertions');
const config = require('../config');

async function openModal(driver) {
  const createBtn = await driver.findElement(By.id('createTaskBtn'));
  await createBtn.click();
  const modal = await driver.findElement(By.id('createTaskModal'));
  await driver.wait(until.elementIsVisible(modal), 3000);
}


async function submitAndWaitForAlert(driver) {
  // Use JavaScript to trigger form submission directly
  await driver.executeScript(`
    document.getElementById('createTaskForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  `);
  
  // Wait for alert
  await driver.wait(until.alertIsPresent(), 5000);
  return await driver.switchTo().alert();
}

/**
 * Validation Tests
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Object} Test results
 */
async function runValidationTests(driver) {
  const results = { passed: 0, failed: 0, tests: [] };
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('testtag');
    await tagInput.sendKeys(Key.ENTER);

    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText, 'Title', 'Should show title error');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for empty title', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for empty title', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('ab');
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('testtag');
    await tagInput.sendKeys(Key.ENTER);

    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText, '3', 'Should mention 3 characters');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for short title', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for short title', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('A'.repeat(101));
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('testtag');
    await tagInput.sendKeys(Key.ENTER);

    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText, '100', 'Should mention 100 character limit');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for title exceeding 100 characters', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for title exceeding 100 characters', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Valid Title');
    
    const descInput = await driver.findElement(By.id('taskDescription'));
    await descInput.sendKeys('A'.repeat(501));
    
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('tag1');
    await tagInput.sendKeys(Key.ENTER);
    
    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText, '500', 'Should mention 500 character limit');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for description exceeding 500 characters', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for description exceeding 500 characters', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Valid Title');
    
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('tag1');
    await tagInput.sendKeys(Key.ENTER);
    
    // Inject invalid priority option
    await driver.executeScript(`
      const select = document.getElementById('taskPriority');
      const option = document.createElement('option');
      option.value = 'invalid';
      option.text = 'Invalid';
      select.add(option);
      select.value = 'invalid';
    `);
    
    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText.toLowerCase(), 'priority', 'Should mention priority');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for invalid priority value', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for invalid priority value', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Valid Title');
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('tag1');
    await tagInput.sendKeys(Key.ENTER);
    
    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText.toLowerCase(), 'due', 'Should mention due date');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for missing due date', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for missing due date', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Valid Title');
    
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    
    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText.toLowerCase(), 'tag', 'Should mention tags');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for no tags', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for no tags', status: 'FAIL', error: err.message });
  }
  
  // Test: Shows error for tag too short
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Valid Title');
    
    const dueDateInput = await driver.findElement(By.id('taskDueDate'));
    await dueDateInput.sendKeys('2026-12-31');
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('a');
    await tagInput.sendKeys(Key.ENTER);
    
    const alert = await submitAndWaitForAlert(driver);
    const alertText = await alert.getText();
    
    assertContains(alertText, '2-20', 'Should mention tag length requirements');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Shows error for tag too short', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Shows error for tag too short', status: 'FAIL', error: err.message });
  }
  
  return results;
}

module.exports = { runValidationTests };
