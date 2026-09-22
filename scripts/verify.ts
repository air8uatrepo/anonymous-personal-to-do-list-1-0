import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationFile = "supabase/migrations/templates/0001_anonymous_tasks.sql.tmpl";
const migrationPath = path.join(root, migrationFile);
const manifestPath = path.join(root, "supabase/migrations/manifest.json");

if (!existsSync(migrationPath) || !existsSync(manifestPath)) {
  throw new Error("Migration manifest is incomplete");
}

const migration = readFileSync(migrationPath);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  migrations: Array<{ file: string; sha256: string }>;
};
const entry = manifest.migrations.find((item) => item.file === migrationFile.replace("supabase/migrations/", ""));
const hash = createHash("sha256").update(migration).digest("hex");

if (!entry || entry.sha256 !== hash) {
  throw new Error("Migration manifest hash does not match");
}

const source = readFileSync(path.join(root, "app/page.tsx"), "utf8");
if (source.includes("SUPABASE_SECRET_KEY") || source.includes("BUSINESS_DIRECT_DATABASE_URL")) {
  throw new Error("Server-only configuration is present in browser source");
}

console.log("verify: migration hash and browser secret boundary passed");
