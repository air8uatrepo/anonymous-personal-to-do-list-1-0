import { getDatabasePool } from "@/lib/db";
import { createTaskCollectionHandlers } from "@/lib/tasks/http";
import { getMemoryTaskRepository } from "@/lib/tasks/memory-repository";
import { createTaskRepository } from "@/lib/tasks/repository";

function handlers() {
  if (process.env.BUSINESS_DIRECT_TEST_MODE === "memory") {
    return createTaskCollectionHandlers(getMemoryTaskRepository());
  }

  const schema = process.env.BUSINESS_DIRECT_DATABASE_SCHEMA;
  if (!schema) {
    throw new Error("BUSINESS_DIRECT_DATABASE_SCHEMA is not configured");
  }
  return createTaskCollectionHandlers(createTaskRepository(getDatabasePool(), schema));
}

export async function GET(request: Request): Promise<Response> {
  return handlers().GET(request);
}

export async function POST(request: Request): Promise<Response> {
  return handlers().POST(request);
}
