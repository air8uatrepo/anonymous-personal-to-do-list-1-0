import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(".");

describe("project contract", () => {
  it("defines the required safe application and verification entry points", () => {
    const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts).toMatchObject({
      build: "next build",
      lint: "eslint .",
      test: "vitest",
      "test:e2e": "playwright test",
      verify: "tsx scripts/verify.ts",
    });
    expect(existsSync(path.join(root, "next-env.d.ts"))).toBe(true);
    expect(existsSync(path.join(root, "playwright.config.ts"))).toBe(true);
    expect(existsSync(path.join(root, ".env.example"))).toBe(true);
    expect(existsSync(path.join(root, "supabase/migrations/manifest.json"))).toBe(true);
    expect(existsSync(path.join(root, "scripts/verify.ts"))).toBe(true);
  });

  it("does not place server credentials in browser source or committed env files", () => {
    const browserSource = readFileSync(path.join(root, "app/page.tsx"), "utf8");
    const exampleEnv = readFileSync(path.join(root, ".env.example"), "utf8");

    expect(browserSource).not.toContain("BUSINESS_DIRECT_DATABASE_URL");
    expect(browserSource).not.toContain("SUPABASE_SECRET_KEY");
    expect(exampleEnv).not.toContain("SUPABASE_SECRET_KEY=");
  });
});
