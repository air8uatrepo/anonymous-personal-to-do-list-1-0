import { expect, test } from "@playwright/test";

test("anonymous visitor can manage an isolated task through reloads", async ({ browser, page }) => {
  test.setTimeout(30000);
  const runId = process.env.BUSINESS_DIRECT_E2E_RUN_ID ?? "DEMO-REQ-A8-133-E2E-001";
  const taskTitle = `${runId}-retained`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your to-do list" })).toBeVisible();
  await expect(page.getByText("No tasks yet.")).toBeVisible();
  await expect(page.getByText(/sign in|register|login/i)).toHaveCount(0);

  await page.getByLabel("New task").fill(taskTitle);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await otherPage.goto("/");
  await expect(otherPage.getByText(taskTitle, { exact: true })).toHaveCount(0);
  await expect(otherPage.getByText("No tasks yet.")).toBeVisible();
  await otherContext.close();

  await page.getByRole("checkbox", { name: `Mark ${taskTitle} complete` }).click();
  await expect(page.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` })).toBeChecked();

  await page.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` }).click();
  await expect(page.getByRole("checkbox", { name: `Mark ${taskTitle} complete` })).not.toBeChecked();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: `Mark ${taskTitle} complete` })).not.toBeChecked();

  await page.getByRole("button", { name: `Delete ${taskTitle}` }).click();
  await expect(page.getByText(taskTitle, { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(taskTitle, { exact: true })).toHaveCount(0);
  await expect(page.getByText("No tasks yet.")).toBeVisible();
});
