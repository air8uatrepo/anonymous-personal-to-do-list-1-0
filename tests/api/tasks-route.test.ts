import { describe, expect, it, vi } from "vitest";
import { createTaskCollectionHandlers } from "@/lib/tasks/http";
import { createTaskItemHandlers } from "@/lib/tasks/http-item";
import type { TaskRepository } from "@/lib/tasks/types";

const visitorId = "00000000-0000-4000-8000-000000000001";
const taskId = "00000000-0000-4000-8000-000000000002";
const task = {
  id: taskId,
  title: "DEMO-REQ-A8-133-API-001",
  completed: false,
  createdAt: "2026-09-22T08:00:00.000Z",
};

function repositoryDouble(): TaskRepository {
  return {
    list: vi.fn().mockResolvedValue([task]),
    create: vi.fn().mockResolvedValue(task),
    setCompleted: vi.fn().mockResolvedValue({ ...task, completed: true }),
    remove: vi.fn().mockResolvedValue(true),
  };
}

describe("task HTTP handlers", () => {
  it("lists tasks and sets an anonymous cookie on first visit", async () => {
    const repository = repositoryDouble();
    const { GET } = createTaskCollectionHandlers(repository);

    const response = await GET(new Request("http://localhost/api/tasks"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ tasks: [task] });
    expect(response.headers.get("set-cookie")).toContain("anonymous_task_visitor=");
    expect(repository.list).toHaveBeenCalledWith(expect.any(String));
  });

  it("creates a task for the visitor cookie", async () => {
    const repository = repositoryDouble();
    const { POST } = createTaskCollectionHandlers(repository);

    const response = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { cookie: `anonymous_task_visitor=${visitorId}`, "content-type": "application/json" },
        body: JSON.stringify({ title: " DEMO-REQ-A8-133-API-002 " }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ task });
    expect(repository.create).toHaveBeenCalledWith(visitorId, "DEMO-REQ-A8-133-API-002");
  });

  it("rejects blank input without calling persistence", async () => {
    const repository = repositoryDouble();
    const { POST } = createTaskCollectionHandlers(repository);

    const response = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: " " }),
      }),
    );

    expect(response.status).toBe(400);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("completes and restores a task through the item handler", async () => {
    const repository = repositoryDouble();
    const { PATCH } = createTaskItemHandlers(repository);

    const complete = await PATCH(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { cookie: `anonymous_task_visitor=${visitorId}` },
        body: JSON.stringify({ completed: true }),
      }),
      { params: Promise.resolve({ taskId }) },
    );
    const restore = await PATCH(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { cookie: `anonymous_task_visitor=${visitorId}` },
        body: JSON.stringify({ completed: false }),
      }),
      { params: Promise.resolve({ taskId }) },
    );

    expect(complete.status).toBe(200);
    expect(restore.status).toBe(200);
    expect(repository.setCompleted).toHaveBeenNthCalledWith(1, visitorId, taskId, true);
    expect(repository.setCompleted).toHaveBeenNthCalledWith(2, visitorId, taskId, false);
  });

  it("returns not found for another visitor's task", async () => {
    const repository = repositoryDouble();
    vi.mocked(repository.setCompleted).mockResolvedValue(null);
    const { PATCH } = createTaskItemHandlers(repository);

    const response = await PATCH(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { cookie: `anonymous_task_visitor=00000000-0000-4000-8000-000000000003` },
        body: JSON.stringify({ completed: true }),
      }),
      { params: Promise.resolve({ taskId }) },
    );

    expect(response.status).toBe(404);
  });

  it("deletes an owned task and returns not found when it is absent", async () => {
    const repository = repositoryDouble();
    const { DELETE } = createTaskItemHandlers(repository);

    const deleted = await DELETE(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { cookie: `anonymous_task_visitor=${visitorId}` },
      }),
      { params: Promise.resolve({ taskId }) },
    );
    vi.mocked(repository.remove).mockResolvedValue(false);
    const missing = await DELETE(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { cookie: `anonymous_task_visitor=${visitorId}` },
      }),
      { params: Promise.resolve({ taskId }) },
    );

    expect(deleted.status).toBe(204);
    expect(missing.status).toBe(404);
  });
});
