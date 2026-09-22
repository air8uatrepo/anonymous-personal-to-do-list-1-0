import { z } from "zod";
import type { CreateTaskInput } from "./types";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export function parseCreateTaskInput(value: unknown): CreateTaskInput {
  return createTaskSchema.parse(value);
}

export function parseTaskId(value: string): string {
  return z.string().uuid().parse(value);
}

export function parseCompletionInput(value: unknown): { completed: boolean } {
  return z.object({ completed: z.boolean() }).parse(value);
}
