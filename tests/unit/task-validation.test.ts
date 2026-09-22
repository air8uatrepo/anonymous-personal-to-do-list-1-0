import { describe, expect, it } from "vitest";
import { parseCreateTaskInput } from "@/lib/tasks/validation";

describe("parseCreateTaskInput", () => {
  it("accepts a synthetic task title and trims surrounding whitespace", () => {
    expect(parseCreateTaskInput({ title: "  DEMO-REQ-A8-133-TASK-001  " })).toEqual({
      title: "DEMO-REQ-A8-133-TASK-001",
    });
  });

  it("rejects a blank task title", () => {
    expect(() => parseCreateTaskInput({ title: "   " })).toThrow();
  });

  it("rejects a title longer than the task contract", () => {
    expect(() => parseCreateTaskInput({ title: "DEMO-REQ-A8-133-" + "x".repeat(201) })).toThrow();
  });
});
