import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

const task = {
  id: "00000000-0000-4000-8000-000000000002",
  title: "DEMO-REQ-A8-133-UI-001",
  completed: false,
  createdAt: "2026-09-22T08:00:00.000Z",
};

describe("task list page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty state and adds a task", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (_input, init) => {
      if (init?.method === "POST") {
        return Response.json({ task });
      }
      return Response.json({ tasks: [] });
    });

    render(<HomePage />);
    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New task"), { target: { value: task.title } });
    fireEvent.submit(screen.getByRole("form", { name: "Add a task" }));

    expect(await screen.findByText(task.title)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/tasks", expect.objectContaining({ method: "POST" }));
  });

  it("completes, restores, and deletes a task", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (_input, init) => {
      if (init?.method === "PATCH") {
        const body = JSON.parse(String(init.body)) as { completed: boolean };
        return Response.json({ task: { ...task, completed: body.completed } });
      }
      if (init?.method === "DELETE") {
        return new Response(null, { status: 204 });
      }
      return Response.json({ tasks: [task] });
    });

    render(<HomePage />);
    await screen.findByText(task.title);

    const completionControl = screen.getByRole("checkbox", { name: `Mark ${task.title} complete` });
    fireEvent.click(completionControl);
    await waitFor(() => expect(screen.getByRole("checkbox", { name: `Restore ${task.title} to incomplete` })).toBeChecked());

    fireEvent.click(screen.getByRole("checkbox", { name: `Restore ${task.title} to incomplete` }));
    await waitFor(() => expect(screen.getByRole("checkbox", { name: `Mark ${task.title} complete` })).not.toBeChecked());

    fireEvent.click(screen.getByRole("button", { name: `Delete ${task.title}` }));
    await waitFor(() => expect(screen.queryByText(task.title)).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(`/api/tasks/${task.id}`, expect.objectContaining({ method: "DELETE" }));
  });

  it("shows a request error without exposing server details", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("DEMO-REQ-A8-133-INTERNAL"));

    render(<HomePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load tasks.");
    expect(screen.queryByText("DEMO-REQ-A8-133-INTERNAL")).not.toBeInTheDocument();
  });
});
