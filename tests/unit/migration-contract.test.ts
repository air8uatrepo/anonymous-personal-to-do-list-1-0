import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.resolve("supabase/migrations/templates/0001_anonymous_tasks.sql.tmpl");
const manifestPath = path.resolve("supabase/migrations/manifest.json");

describe("Supabase migration contract", () => {
  it("creates the complete additive working target", () => {
    const sql = readFileSync(migrationPath, "utf8").toLowerCase();

    expect(sql).toContain("create schema if not exists {{schema}}");
    expect(sql).toContain("create table if not exists {{schema}}.tasks");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("grant usage on schema {{schema}} to {{app_role}}");
    expect(sql).toContain("grant select, insert, update, delete on table {{schema}}.tasks to {{app_role}}");
    expect(sql).toContain("create policy");
    expect(sql).toContain("current_setting('app.visitor_id', true)");
    expect(sql).not.toMatch(/\b(drop|truncate)\b/);
  });

  it("pins the exact migration bytes in the manifest", () => {
    const sql = readFileSync(migrationPath);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      migrations: Array<{ file: string; sha256: string }>;
    };
    const entry = manifest.migrations.find((migration) => migration.file === "templates/0001_anonymous_tasks.sql.tmpl");

    expect(entry?.sha256).toBe(createHash("sha256").update(sql).digest("hex"));
  });
});
