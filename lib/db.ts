import "server-only";
import { Pool } from "pg";
import type { DatabasePool } from "./tasks/repository";

let pool: Pool | undefined;

export function getDatabasePool(): DatabasePool {
  const connectionString = process.env.BUSINESS_DIRECT_DATABASE_URL;
  if (!connectionString) {
    throw new Error("BUSINESS_DIRECT_DATABASE_URL is not configured");
  }

  pool ??= new Pool({ connectionString, max: 5 });
  return pool;
}
