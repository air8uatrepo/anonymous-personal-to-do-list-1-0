"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Task } from "@/lib/tasks/types";

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/tasks")
      .then(readResponse<{ tasks: Task[] }>)
      .then((result) => {
        if (active) {
          setTasks(result.tasks);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load tasks.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Enter a task.");
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = await readResponse<{ task: Task }>(response);
      setTasks((current) => [...current, result.task]);
      setTitle("");
    } catch {
      setError("Unable to add task.");
    }
  }

  async function updateCompletion(task: Task, completed: boolean) {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      const result = await readResponse<{ task: Task }>(response);
      setTasks((current) => current.map((item) => (item.id === task.id ? result.task : item)));
    } catch {
      setError("Unable to update task.");
    }
  }

  async function deleteTask(task: Task) {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      await readResponse<void>(response);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch {
      setError("Unable to delete task.");
    }
  }

  return (
    <main className="page-shell">
      <section className="task-card" aria-labelledby="page-title">
        <p className="eyebrow">Personal tasks</p>
        <h1 id="page-title">Your to-do list</h1>
        <p className="intro">Keep a simple list for this visit.</p>

        <form className="add-form" aria-label="Add a task" onSubmit={addTask}>
          <label htmlFor="task-title">New task</label>
          <div className="add-row">
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              autoComplete="off"
              placeholder="What needs doing?"
            />
            <button type="submit">Add task</button>
          </div>
        </form>

        {error ? <p className="error" role="alert">{error}</p> : null}

        <div className="task-list" aria-live="polite">
          {loading ? <p className="status">Loading tasks…</p> : null}
          {!loading && tasks.length === 0 ? <p className="status">No tasks yet.</p> : null}
          {tasks.map((task) => (
            <article className={`task-row${task.completed ? " completed" : ""}`} key={task.id}>
              <label className="task-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(event) => updateCompletion(task, event.target.checked)}
                  aria-label={task.completed ? `Restore ${task.title} to incomplete` : `Mark ${task.title} complete`}
                />
                <span>{task.title}</span>
              </label>
              <button type="button" className="delete-button" onClick={() => deleteTask(task)}>
                Delete {task.title}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
