
import { test, expect, Page, BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const coverageDir = path.join(process.cwd(), "coverage", "temp");

test.beforeAll(async () => {
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
});

async function startCoverage(page: Page, context: BrowserContext): Promise<void> {
  if (context.browser()?.browserType().name() === "chromium") {
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
  }
}

async function stopCoverage(page: Page, context: BrowserContext, testName: string): Promise<void> {
  if (context.browser()?.browserType().name() === "chromium") {
    const coverage = await page.coverage.stopJSCoverage();
    const filtered = coverage.filter((e) => e.url.includes("/js/"));
    if (filtered.length > 0) {
      const fileName = `coverage-${testName.replace(/[^a-z0-9]/gi, "_")}-${Date.now()}.json`;
      fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(filtered, null, 2));
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function openModal(page: Page): Promise<void> {
  await page.click("#createTaskBtn");
  await expect(page.locator("#createTaskModal")).toHaveClass(/active/, { timeout: 3000 });
}

async function addTag(page: Page, tag: string): Promise<void> {
  await page.fill("#taskTagsInput", tag);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(50);
}

async function submitFormAndGetAlert(page: Page): Promise<string> {
  return new Promise(async (resolve) => {
    page.once("dialog", async (dialog) => {
      const msg = dialog.message();
      await dialog.accept();
      resolve(msg);
    });
    
    await page.evaluate(() => {
      const form = document.getElementById("createTaskForm") as HTMLFormElement;
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  });
}



test.describe("Modal Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("1. Opens modal on Create Task button click", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.click("#createTaskBtn");
    await expect(page.locator("#createTaskModal")).toHaveClass(/active/);
    await stopCoverage(page, context, "modal-open");
  });

  test("2. Closes modal on X button click", async ({ page, context }) => {
    await startCoverage(page, context);
    await openModal(page);
    await page.click("#closeCreateModal");
    await expect(page.locator("#createTaskModal")).not.toHaveClass(/active/);
    await stopCoverage(page, context, "modal-close-x");
  });

  test("3. Closes modal on Escape key", async ({ page, context }) => {
    await startCoverage(page, context);
    await openModal(page);
    await page.keyboard.press("Escape");
    await expect(page.locator("#createTaskModal")).not.toHaveClass(/active/);
    await stopCoverage(page, context, "modal-escape");
  });

  test("4. Closes modal on overlay click", async ({ page, context }) => {
    await startCoverage(page, context);
    await openModal(page);
    await page.locator("#createTaskModal .modal-overlay").click({ position: { x: 5, y: 5 } });
    await expect(page.locator("#createTaskModal")).not.toHaveClass(/active/);
    await stopCoverage(page, context, "modal-overlay");
  });
});


test.describe("Tag Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await openModal(page);
  });

  test("5. Adds tag on Enter key", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTagsInput", "urgent");
    await page.keyboard.press("Enter");
    await expect(page.locator(".tag-pill")).toHaveCount(1);
    await expect(page.locator("#taskTagsInput")).toHaveValue("");
    await stopCoverage(page, context, "tag-add");
  });

  test("6. Removes tag on X button click", async ({ page, context }) => {
    await startCoverage(page, context);
    await addTag(page, "remove");
    await page.click(".tag-remove");
    await expect(page.locator(".tag-pill")).toHaveCount(0);
    await stopCoverage(page, context, "tag-remove");
  });

  test("7. Removes last tag on Backspace", async ({ page, context }) => {
    await startCoverage(page, context);
    await addTag(page, "first");
    await addTag(page, "second");
    await page.locator("#taskTagsInput").focus();
    await page.keyboard.press("Backspace");
    await expect(page.locator(".tag-pill")).toHaveCount(1);
    await stopCoverage(page, context, "tag-backspace");
  });

  test("8. Prevents duplicate tags", async ({ page, context }) => {
    await startCoverage(page, context);
    await addTag(page, "duplicate");
    await addTag(page, "duplicate");
    await expect(page.locator(".tag-pill")).toHaveCount(1);
    await stopCoverage(page, context, "tag-duplicate");
  });

  test("9. Focuses input on container click", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.click("#tagInputContainer");
    await expect(page.locator("#taskTagsInput")).toBeFocused();
    await stopCoverage(page, context, "tag-focus");
  });
});


test.describe("Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await openModal(page);
  });

  test("10. Error for empty title", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "testtag");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("Title is required");
    await stopCoverage(page, context, "val-empty-title");
  });

  test("11. Error for title less than 3 chars", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "AB");
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "testtag");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("at least 3 characters");
    await stopCoverage(page, context, "val-short-title");
  });

  test("12. Error for title over 100 chars", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "A".repeat(101));
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "testtag");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("not exceed 100");
    await stopCoverage(page, context, "val-long-title");
  });

  test("13. Error for description over 500 chars", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "Valid Title");
    await page.fill("#taskDescription", "A".repeat(501));
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "testtag");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("500");
    await stopCoverage(page, context, "val-long-desc");
  });

  test("14. Error for invalid priority", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "Valid Title");
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "testtag");
    await page.evaluate(() => {
      const sel = document.getElementById("taskPriority") as HTMLSelectElement;
      const opt = document.createElement("option");
      opt.value = "invalid";
      sel.add(opt);
      sel.value = "invalid";
    });
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("valid priority");
    await stopCoverage(page, context, "val-priority");
  });

  test("15. Error for missing due date", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "Valid Title");
    await addTag(page, "testtag");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("Due date is required");
    await stopCoverage(page, context, "val-date");
  });

  test("16. Error for no tags", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "Valid Title");
    await page.fill("#taskDueDate", "2026-12-31");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("at least one tag");
    await stopCoverage(page, context, "val-no-tags");
  });

  test("17. Error for tag too short", async ({ page, context }) => {
    await startCoverage(page, context);
    await page.fill("#taskTitle", "Valid Title");
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "a");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("2-20 characters");
    await stopCoverage(page, context, "val-tag-length");
  });
});


test.describe("Form Submission", () => {
  test("18. Creates task successfully", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await startCoverage(page, context);
    await openModal(page);
    await page.fill("#taskTitle", "Success Task");
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "success");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("Task created");
    await expect(page.locator("#createTaskModal")).not.toHaveClass(/active/);
    await stopCoverage(page, context, "submit-success");
  });

  test("19. Handles API errors", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.route("**/tasks", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 500, body: JSON.stringify({}) });
      } else {
        await route.continue();
      }
    });
    await startCoverage(page, context);
    await openModal(page);
    await page.fill("#taskTitle", "Error Task");
    await page.fill("#taskDueDate", "2026-12-31");
    await addTag(page, "error");
    const msg = await submitFormAndGetAlert(page);
    expect(msg).toContain("Unable to add task");
    await stopCoverage(page, context, "submit-error");
  });
});

test.describe("Form Reset", () => {
  test("20. Resets form when modal reopened", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await startCoverage(page, context);
    await openModal(page);
    await page.fill("#taskTitle", "Will Be Cleared");
    await addTag(page, "cleartag");
    await page.click("#cancelCreateBtn");
    await openModal(page);
    await expect(page.locator("#taskTitle")).toHaveValue("");
    await expect(page.locator(".tag-pill")).toHaveCount(0);
    await stopCoverage(page, context, "form-reset");
  });
});
