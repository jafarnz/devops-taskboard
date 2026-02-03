

const { By, until, Key } = require('selenium-webdriver');
const { assertTrue, assertVisible, assertNotVisible } = require('../assertions');
const config = require('../config');

/**
 * Modal Tests
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Object} Test results
 */
async function runModalTests(driver) {
  const results = { passed: 0, failed: 0, tests: [] };
  
  try {
    await driver.get(config.baseUrl);
    const createBtn = await driver.findElement(By.id('createTaskBtn'));
    await createBtn.click();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    const className = await modal.getAttribute('class');
    assertTrue(className.includes('active'), 'Modal should have active class');
    
    results.passed++;
    results.tests.push({ name: 'Opens modal on Create Task button click', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Opens modal on Create Task button click', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    const createBtn = await driver.findElement(By.id('createTaskBtn'));
    await createBtn.click();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    const closeBtn = await driver.findElement(By.id('closeCreateModal'));
    await closeBtn.click();
    
    await driver.wait(async () => {
      const className = await modal.getAttribute('class');
      return !className.includes('active');
    }, 3000);
    
    const className = await modal.getAttribute('class');
    assertTrue(!className.includes('active'), 'Modal should not have active class');
    
    results.passed++;
    results.tests.push({ name: 'Closes modal on X button click', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Closes modal on X button click', status: 'FAIL', error: err.message });
  }
  
  // Test: Closes modal on Escape key press
  try {
    await driver.get(config.baseUrl);
    const createBtn = await driver.findElement(By.id('createTaskBtn'));
    await createBtn.click();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    const body = await driver.findElement(By.tagName('body'));
    await body.sendKeys(Key.ESCAPE);
    
    await driver.wait(async () => {
      const className = await modal.getAttribute('class');
      return !className.includes('active');
    }, 3000);
    
    const className = await modal.getAttribute('class');
    assertTrue(!className.includes('active'), 'Modal should close on Escape');
    
    results.passed++;
    results.tests.push({ name: 'Closes modal on Escape key press', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Closes modal on Escape key press', status: 'FAIL', error: err.message });
  }
  
  // Test: Closes modal on overlay click
  try {
    await driver.get(config.baseUrl);
    const createBtn = await driver.findElement(By.id('createTaskBtn'));
    await createBtn.click();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    await driver.executeScript(() => {
      const overlay = document.querySelector('#createTaskModal .modal-overlay');
      if (overlay) overlay.click();
    });
    
    await driver.wait(async () => {
      const className = await modal.getAttribute('class');
      return !className.includes('active');
    }, 3000);
    
    const className = await modal.getAttribute('class');
    assertTrue(!className.includes('active'), 'Modal should close on overlay click');
    
    results.passed++;
    results.tests.push({ name: 'Closes modal on overlay click', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Closes modal on overlay click', status: 'FAIL', error: err.message });
  }
  
  // Test: Resets form fields and tags when modal reopened
  try {
    await driver.get(config.baseUrl);
    const createBtn = await driver.findElement(By.id('createTaskBtn'));
    await createBtn.click();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    // Fill in some data
    const titleInput = await driver.findElement(By.id('taskTitle'));
    await titleInput.sendKeys('Test Title');
    
    const tagInput = await driver.findElement(By.id('taskTagsInput'));
    await tagInput.sendKeys('testtag');
    await tagInput.sendKeys(Key.ENTER);
    await driver.sleep(100);
    
    // Close modal
    const cancelBtn = await driver.findElement(By.id('cancelCreateBtn'));
    await cancelBtn.click();
    
    await driver.wait(async () => {
      const className = await modal.getAttribute('class');
      return !className.includes('active');
    }, 3000);
    
    // Reopen modal
    await createBtn.click();
    await driver.wait(until.elementIsVisible(modal), 3000);
    
    // Check fields are reset
    const titleValue = await titleInput.getAttribute('value');
    assertTrue(titleValue === '', 'Title should be empty after reset');
    
    // Check tags are cleared
    const tagPills = await driver.findElements(By.css('#tagInputContainer .tag-pill'));
    assertTrue(tagPills.length === 0, 'Tags should be cleared after reset');
    
    results.passed++;
    results.tests.push({ name: 'Resets form fields and tags when modal reopened', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Resets form fields and tags when modal reopened', status: 'FAIL', error: err.message });
  }
  
  return results;
}

module.exports = { runModalTests };
