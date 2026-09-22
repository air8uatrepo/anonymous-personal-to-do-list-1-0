import { describe, expect, it } from "vitest";
import { createTaskRepository, type DatabaseClient, type DatabasePool } from "@/lib/tasks/repository";

const visitorId = "00000000-0000-4000-8000-000000000001";
const taskId = "00000000-0000-4000-8000-000000000002";

class FakeClient implements DatabaseClient {
  readonly queries: Array<{ text: string; values: unknown[] }> = [];

  async query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
    this.queries.push({ text, values });
    if (text.includes("insert into")) {
      return {
        rows: [{ id: taskId, title: String(values[0]), completed: false, created_at: new Date("2026-09-22T08:00:00.000Z") } as unknown as T],
        rowCount: 1,
      };
    }

    if (text.includes("select id")) {
      return {
        rows: [{ id: taskId, title: "DEMO-REQ-A8-133-TASK-002", completed: true, created_at: new Date("2026-09-22T08:00:00.000Z") } as unknown as T],
        rowCount: 1,
      };
    }

    return { rows: [], rowCount: 1 };
  }

  release(): void {}
}

describe("task repository", () => {
  it("sets the visitor transaction context and normalizes driver dates", async () => {
    const client = new FakeClient();
    const pool: DatabasePool = { connect: async () => client };
    const repository = createTaskRepository(pool, "app_anonymous_personal_to_do_list_1_0");

    const task = await repository.create(visitorId, "DEMO-REQ-A8-133-TASK-001");

    expect(task).toEqual({
      id: taskId,
      title: "DEMO-REQ-A8-133-TASK-001",
      completed: false,
      createdAt: "2026-09-22T08:00:00.000Z",
    });
    expect(client.queries[1]).toEqual({
      text: "select set_config('app.visitor_id', $1, true)",
      values: [visitorId],
    });
    expect(client.queries.some(({ text }) => text.includes("current_setting('app.visitor_id', true)"))).toBe(true);
  });

  it("uses the same visitor context for list reads", async () => {
    const client = new FakeClient();
    const pool: DatabasePool = { connect: async () => client };
    const repository = createTaskRepository(pool, "app_anonymous_personal_to_do_list_1_0");

    await expect(repository.list(visitorId)).resolves.toEqual([
      {
        id: taskId,
        title: "DEMO-REQ-A8-133-TASK-002",
        completed: true,
        createdAt: "2026-09-22T08:00:00.000Z",
      },
    ]);
    expect(client.queries[1].values).toEqual([visitorId]);
  });
});
