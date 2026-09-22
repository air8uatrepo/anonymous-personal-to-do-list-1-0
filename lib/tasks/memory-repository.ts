import { randomUUID } from "node:crypto";
import type { Task, TaskRepository } from "./types";

type MemoryStore = Map<string, Task>;
type MemoryGlobal = typeof globalThis & { __anonymousTaskStores?: Map<string, MemoryStore> };

const stores = ((globalThis as MemoryGlobal).__anonymousTaskStores ??= new Map());

export function getMemoryTaskRepository(): TaskRepository {
  return {
    async list(visitorId) {
      const store = stores.get(visitorId);
      return store ? [...store.values()] : [];
    },
    async create(visitorId, title) {
      const store = stores.get(visitorId) ?? new Map<string, Task>();
      const task: Task = { id: randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
      store.set(task.id, task);
      stores.set(visitorId, store);
      return task;
    },
    async setCompleted(visitorId, taskId, completed) {
      const task = stores.get(visitorId)?.get(taskId);
      if (!task) {
        return null;
      }
      const updated = { ...task, completed };
      stores.get(visitorId)?.set(taskId, updated);
      return updated;
    },
    async remove(visitorId, taskId) {
      return stores.get(visitorId)?.delete(taskId) ?? false;
    },
  };
}
