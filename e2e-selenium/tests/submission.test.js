

const { By, until, Key } = require('selenium-webdriver');
const { assertTrue, assertContains } = require('../assertions');
const config = require('../config');


async function openModal(driver) {
  const createBtn = await driver.findElement(By.id('createTaskBtn'));
  await createBtn.click();
  const modal = await driver.findElement(By.id('createTaskModal'));
  await driver.wait(until.elementIsVisible(modal), 3000);
}


async function fillValidForm(driver, options = {}) {
  const {
    title = 'Valid Test Task',
    description = 'Test description',
    priority = 'medium',
    dueDate = '2026-12-31',
    tags = ['validtag']
  } = options;
  
  const titleInput = await driver.findElement(By.id('taskTitle'));
  await titleInput.clear();
  await titleInput.sendKeys(title);
  
  if (description) {
    const descInput = await driver.findElement(By.id('taskDescription'));
    await descInput.clear();
    await descInput.sendKeys(description);
  }
  
  const prioritySelect = await driver.findElement(By.id('taskPriority'));
  await prioritySelect.sendKeys(priority);
  
  const dueDateInput = await driver.findElement(By.id('taskDueDate'));
  await dueDateInput.clear();
  await dueDateInput.sendKeys(dueDate);
  
  const tagInput = await driver.findElement(By.id('taskTagsInput'));
  for (const tag of tags) {
    await tagInput.sendKeys(tag);
    await tagInput.sendKeys(Key.ENTER);
  }
}

/**
 * Submission Tests
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Object} Test results
 */
async function runSubmissionTests(driver) {
  const results = { passed: 0, failed: 0, tests: [] };
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    await fillValidForm(driver, { title: 'Selenium Test Task ' + Date.now() });
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    
    assertContains(alertText.toLowerCase(), 'created', 'Should show success message');
    await alert.accept();
    
    const modal = await driver.findElement(By.id('createTaskModal'));
    await driver.wait(async () => {
      const className = await modal.getAttribute('class');
      return !className.includes('active');
    }, 3000);
    
    results.passed++;
    results.tests.push({ name: 'Creates task with valid data', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Creates task with valid data', status: 'FAIL', error: err.message });
  }
  
  try {
    await driver.get(config.baseUrl);
    await openModal(driver);
    await fillValidForm(driver, { title: 'API Error Test ' + Date.now() });
    
    await driver.executeScript(`
      const originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;
        
        xhr.open = function(method, url) {
          this._url = url;
          return originalOpen.apply(this, arguments);
        };
        
        xhr.send = function() {
          if (this._url === '/tasks') {
            Object.defineProperty(this, 'status', { value: 500 });
            Object.defineProperty(this, 'responseText', { value: JSON.stringify({ message: 'Server error' }) });
            setTimeout(() => {
              if (this.onload) this.onload();
            }, 50);
            return;
          }
          return originalSend.apply(this, arguments);
        };
        
        return xhr;
      };
    `);
    
    await driver.executeScript(`
      document.getElementById('createTaskForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `);
    
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    
    assertTrue(alertText.length > 0, 'Should show an error message');
    await alert.accept();
    
    results.passed++;
    results.tests.push({ name: 'Handles API errors gracefully', status: 'PASS' });
  } catch (err) {
    results.failed++;
    results.tests.push({ name: 'Handles API errors gracefully', status: 'FAIL', error: err.message });
  }
  
  return results;
}

module.exports = { runSubmissionTests };
