import { z } from "zod";
import type { Task, TaskRepository } from "./types";

export type DatabaseQueryResult<Row> = {
  rows: Row[];
  rowCount: number | null;
};

export type DatabaseClient = {
  query<Row extends Record<string, unknown>>(text: string, values?: unknown[]): Promise<DatabaseQueryResult<Row>>;
  release(): void;
};

export type DatabasePool = {
  connect(): Promise<DatabaseClient>;
};

type TaskRow = {
  id: string;
  title: string;
  completed: boolean;
  created_at: Date | string;
};

const visitorIdSchema = z.string().uuid();

function tableName(schema: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(schema)) {
    throw new Error("Invalid database schema");
  }

  return `"${schema}"."tasks"`;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function createTaskRepository(pool: DatabasePool, schema: string): TaskRepository {
  const tasksTable = tableName(schema);

  async function withVisitor<T>(visitorId: string, operation: (client: DatabaseClient) => Promise<T>): Promise<T> {
    visitorIdSchema.parse(visitorId);
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select set_config('app.visitor_id', $1, true)", [visitorId]);
      const result = await operation(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    list(visitorId) {
      return withVisitor(visitorId, async (client) => {
        const result = await client.query<TaskRow>(
          `select id, title, completed, created_at from ${tasksTable} order by created_at asc, id asc`,
        );
        return result.rows.map(mapTask);
      });
    },
    create(visitorId, title) {
      return withVisitor(visitorId, async (client) => {
        const result = await client.query<TaskRow>(
          `insert into ${tasksTable} (visitor_id, title) values (current_setting('app.visitor_id', true)::uuid, $1) returning id, title, completed, created_at`,
          [title],
        );
        return mapTask(result.rows[0]);
      });
    },
    setCompleted(visitorId, taskId, completed) {
      return withVisitor(visitorId, async (client) => {
        const result = await client.query<TaskRow>(
          `update ${tasksTable} set completed = $1 where id = $2 returning id, title, completed, created_at`,
          [completed, taskId],
        );
        return result.rows[0] ? mapTask(result.rows[0]) : null;
      });
    },
    remove(visitorId, taskId) {
      return withVisitor(visitorId, async (client) => {
        const result = await client.query<{ id: string }>(`delete from ${tasksTable} where id = $1 returning id`, [taskId]);
        return result.rowCount === 1;
      });
    },
  };
}
