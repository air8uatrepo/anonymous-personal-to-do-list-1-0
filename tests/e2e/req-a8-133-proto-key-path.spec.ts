import { expect, test } from "@playwright/test";

const runPrefix = "DEMO-REQ-A8-133-bd-a8-133-20260922-171500";

test("E2E-KP-REQ-A8-133-001: anonymous task lifecycle is isolated and durable", async ({ browser }) => {
  test.setTimeout(45000);
  const taskTitle = `${runPrefix}-ac1-task`;
  const visitorA = await browser.newContext();
  const visitorB = await browser.newContext();
  const pageA = await visitorA.newPage();
  const pageB = await visitorB.newPage();

  try {
    await pageA.goto("/");
    await expect(pageA.getByRole("heading", { name: "Your to-do list" })).toBeVisible();
    await expect(pageA.getByText("No tasks yet.", { exact: true })).toBeVisible();
    await expect(pageA.getByText(/sign in|register|login|pay/i)).toHaveCount(0);

    await pageA.getByRole("button", { name: "Add task" }).click();
    await expect(pageA.getByText("Enter a task.", { exact: true })).toBeVisible();
    await expect(pageA.getByText(taskTitle, { exact: true })).toHaveCount(0);

    await pageA.getByLabel("New task").fill(taskTitle);
    await pageA.getByRole("button", { name: "Add task" }).click();
    const taskA = pageA.getByRole("article").filter({ hasText: taskTitle });
    await expect(taskA).toHaveCount(1);
    await expect(taskA.getByText(taskTitle, { exact: true })).toBeVisible();
    const taskId = await pageA.evaluate(async (title) => {
      const response = await fetch("/api/tasks");
      const result = (await response.json()) as { tasks: Array<{ id: string; title: string }> };
      return result.tasks.find((task) => task.title === title)?.id ?? null;
    }, taskTitle);
    expect(taskId).not.toBeNull();

    await pageB.goto("/");
    await expect(pageB.getByText("No tasks yet.", { exact: true })).toBeVisible();
    await expect(pageB.getByText(taskTitle, { exact: true })).toHaveCount(0);
    const visitorBUpdate = await pageB.request.patch(`/api/tasks/${taskId}`, { data: { completed: true } });
    expect(visitorBUpdate.status()).toBe(404);
    const visitorBDelete = await pageB.request.delete(`/api/tasks/${taskId}`);
    expect(visitorBDelete.status()).toBe(404);
    await pageA.reload();
    await expect(pageA.getByRole("checkbox", { name: `Mark ${taskTitle} complete` })).not.toBeChecked();

    await pageA.getByRole("checkbox", { name: `Mark ${taskTitle} complete` }).click();
    await expect(pageA.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` })).toBeChecked();
    await pageA.reload();
    await expect(pageA.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` })).toBeChecked();

    await pageA.getByRole("checkbox", { name: `Restore ${taskTitle} to incomplete` }).click();
    await expect(pageA.getByRole("checkbox", { name: `Mark ${taskTitle} complete` })).not.toBeChecked();
    await pageA.reload();
    await expect(pageA.getByRole("checkbox", { name: `Mark ${taskTitle} complete` })).not.toBeChecked();

    await pageA.getByRole("button", { name: `Delete ${taskTitle}` }).click();
    await expect(pageA.getByText(taskTitle, { exact: true })).toHaveCount(0);
    await expect(pageA.getByText("No tasks yet.", { exact: true })).toBeVisible();
    await pageA.reload();
    await expect(pageA.getByText(taskTitle, { exact: true })).toHaveCount(0);
    await expect(pageA.getByText("No tasks yet.", { exact: true })).toBeVisible();
    const persistedTasks = await pageA.evaluate(async () => (await (await fetch("/api/tasks")).json()) as { tasks: unknown[] });
    expect(persistedTasks.tasks).toEqual([]);
    const repeatedDelete = await pageA.request.delete(`/api/tasks/${taskId}`);
    expect(repeatedDelete.status()).toBe(404);
  } finally {
    await visitorB.close();
    await visitorA.close();
  }
});
