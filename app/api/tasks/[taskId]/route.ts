import { getDatabasePool } from "@/lib/db";
import { createTaskItemHandlers } from "@/lib/tasks/http-item";
import { getMemoryTaskRepository } from "@/lib/tasks/memory-repository";
import { createTaskRepository } from "@/lib/tasks/repository";

function handlers() {
  if (process.env.BUSINESS_DIRECT_TEST_MODE === "memory") {
    return createTaskItemHandlers(getMemoryTaskRepository());
  }

  const schema = process.env.BUSINESS_DIRECT_DATABASE_SCHEMA;
  if (!schema) {
    throw new Error("BUSINESS_DIRECT_DATABASE_SCHEMA is not configured");
  }
  return createTaskItemHandlers(createTaskRepository(getDatabasePool(), schema));
}

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }): Promise<Response> {
  return handlers().PATCH(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ taskId: string }> }): Promise<Response> {
  return handlers().DELETE(request, context);
}
