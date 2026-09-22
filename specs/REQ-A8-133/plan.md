# Anonymous Personal To-do List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute this plan task-by-task with test-first development and fresh verification evidence.

**Goal:** Deliver the confirmed revision 3 anonymous personal to-do list behavior for `REQ-A8-133` without registration or login.

**Architecture:** A Next.js App Router application serves a small task list UI and same-origin REST route handlers. The server creates or reads an HttpOnly anonymous visitor cookie, validates request data, and accesses Supabase through a server-only pooled `pg` connection. Each database transaction sets the visitor identifier locally; a schema-qualified task table with RLS permits a dedicated application role to access only rows whose owner matches that setting.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, `pg`, Vitest, and Playwright.

**Spec:** `specs/REQ-A8-133/spec.md` revision 3 (confirmed), especially `AC-1` through `AC-4`.

## Global Constraints

- Keep the automatic anonymous identifier only; do not add registration, login, passwords, verified identity, or email input.
- A visitor can add, view, complete, restore, and delete only their own tasks.
- Preserve every earlier key-path E2E artifact; this scaffold has no earlier application E2E artifact.
- Keep `SUPABASE_SECRET_KEY` and all database connection values server-only; browser code may use no secret or pooled connection.
- The additive migration must create the application schema and task table, enable RLS, grant schema/table access to the dedicated application role, and create the owner policy.
- All fixtures, tests, seeds, logs, and evidence use only `DEMO-REQ-A8-133-*` values.
- Do not modify workflow state or Linear, deploy, run production/UAT writes, or access credentials.

## File Map

- `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`: application and test tooling.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`: accessible task-list shell and browser interactions.
- `app/api/tasks/route.ts`, `app/api/tasks/[taskId]/route.ts`: same-origin task collection and item HTTP boundaries.
- `lib/tasks/types.ts`, `lib/tasks/validation.ts`, `lib/tasks/visitor.ts`: task contracts, input validation, and cookie identity.
- `lib/tasks/repository.ts`, `lib/db.ts`: server-only persistence boundary and transaction setup.
- `supabase/migrations/templates/0001_anonymous_tasks.sql.tmpl`, `supabase/migrations/manifest.json`: additive schema/role-templated RLS migration and integrity manifest.
- `tests/unit/*.test.ts`, `tests/api/*.test.ts`, `tests/e2e/anonymous-tasks.spec.ts`: behavioral, API, migration-contract, and key-path browser coverage.
- `README.md`, `.env.example`, `.gitignore`: local setup and secret-safety documentation.

### Task 1: Scaffold the application and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/globals.css`
- Test: `tests/unit/project-contract.test.ts`

**Interfaces:**
- Produces the scripts and aliases used by all later tasks.
- Keeps runtime configuration names aligned with the platform contract without embedding values.

- [ ] Write `project-contract.test.ts` to assert required scripts, the server-only environment variable names, the migration manifest path, and absence of committed secret files.
- [ ] Run `npm test -- --run tests/unit/project-contract.test.ts` and record the expected red result because the scaffold files do not exist.
- [ ] Add the minimal Next.js/TypeScript/Vitest/Playwright configuration and a server-only database module boundary.
- [ ] Run the focused project-contract test and record green output.

### Task 2: Define anonymous identity and task-domain contracts

**Files:**
- Create: `lib/tasks/types.ts`, `lib/tasks/validation.ts`, `lib/tasks/visitor.ts`
- Test: `tests/unit/task-validation.test.ts`, `tests/unit/visitor.test.ts`

**Interfaces:**
- `Task`: `{ id: string; title: string; completed: boolean; createdAt: string }`.
- `CreateTaskInput`: `{ title: string }`.
- `parseCreateTaskInput(value: unknown): { title: string }` rejects missing or blank titles.
- `ensureVisitorId(request: Request): { visitorId: string; setCookie: boolean }` accepts only a UUID cookie and generates a UUID when absent or invalid.

- [ ] Write tests for a synthetic title, blank/oversized input rejection, valid visitor-cookie reuse, and missing-cookie generation with the `DEMO-REQ-A8-133-*` prefix in test inputs.
- [ ] Run the two focused test files and record red failures for missing domain modules.
- [ ] Implement the types, Zod validation, and cookie helpers with an HttpOnly, SameSite=Lax cookie; set `Secure` only when the request is HTTPS.
- [ ] Run the focused test files and record green output.

### Task 3: Implement the server persistence boundary

**Files:**
- Create: `lib/db.ts`, `lib/tasks/repository.ts`
- Test: `tests/unit/repository.test.ts`

**Interfaces:**
- `TaskRepository` exposes `list(visitorId)`, `create(visitorId, title)`, `setCompleted(visitorId, taskId, completed)`, and `remove(visitorId, taskId)`.
- Each operation runs inside a transaction that executes `select set_config('app.visitor_id', $1, true)` before the RLS-protected query.
- The repository normalizes driver `Date` values to ISO strings at its boundary.

- [ ] Write repository tests using a typed `pg`-style double that returns `Date` for `created_at`; assert visitor setting, parameterization, normalization, and no cross-visitor query path.
- [ ] Run `npm test -- --run tests/unit/repository.test.ts` and record red output before implementation.
- [ ] Implement the pool factory and repository queries against the schema-qualified task table from `BUSINESS_DIRECT_DATABASE_SCHEMA`.
- [ ] Run the repository test and record green output.

### Task 4: Add the additive Supabase schema and RLS contract

**Files:**
- Create: `supabase/migrations/0001_anonymous_tasks.sql`, `supabase/migrations/manifest.json`
- Test: `tests/unit/migration-contract.test.ts`

**Interfaces:**
- Schema: `app_anonymous_personal_to_do_list_1_0` (production) with the platform’s corresponding `proto_...` deployment substitution.
- Table: `tasks(id uuid, visitor_id uuid, title text, completed boolean, created_at timestamptz)` with a generated UUID primary key and nonblank title check.
- Policy: the dedicated role may select/insert/update/delete only when `visitor_id = current_setting('app.visitor_id', true)::uuid`.

- [ ] Write migration-contract tests that parse the committed SQL and manifest, requiring schema/table creation, RLS enablement, schema/table grants, policy predicates for all four operations, and no destructive statements.
- [ ] Run the focused migration test and record red output before the migration exists.
- [ ] Add the complete additive migration with schema-qualified grants to `anonymous_personal_to_do_list_1_0_app` and an owner policy.
- [ ] Generate the SHA-256 manifest entry from the exact migration bytes and run the focused contract test green.

### Task 5: Expose task HTTP behavior

**Files:**
- Create: `app/api/tasks/route.ts`, `app/api/tasks/[taskId]/route.ts`
- Test: `tests/api/tasks-route.test.ts`

**Interfaces:**
- `GET /api/tasks` returns `{ tasks: Task[] }` and establishes the visitor cookie when needed.
- `POST /api/tasks` accepts `{ title }`, returns `201` with `{ task: Task }`, and establishes the visitor cookie when needed.
- `PATCH /api/tasks/:taskId` accepts `{ completed: boolean }`, returns the updated task, and returns `404` for a task not owned by the visitor.
- `DELETE /api/tasks/:taskId` returns `204` only for an owned task and `404` otherwise.
- Invalid input returns `400`; database failures return a generic `500` response without secrets or identifiers in the body.

- [ ] Write route tests for add/list, complete/restore, delete, invalid input, cookie continuity, and two visitor IDs using only synthetic task values.
- [ ] Run `npm test -- --run tests/api/tasks-route.test.ts` and record expected red output.
- [ ] Implement route handlers using the visitor helper and repository interface, with dependency injection for tests.
- [ ] Run the route tests and record green output.

### Task 6: Build the accessible task-list UI

**Files:**
- Create: `app/page.tsx`, `app/globals.css`
- Test: `tests/unit/task-list-ui.test.tsx`

**Interfaces:**
- The page renders an add-task form, task list, completion controls, restore controls, delete controls, empty state, and request-error state.
- The UI calls only same-origin `/api/tasks` routes and does not access Supabase or server-only variables.
- Successful mutations update visible state without requiring registration or login; reload is supported by `GET /api/tasks`.

- [ ] Write component tests for empty state, synthetic task creation display, complete/restore labels, delete action, and error rendering.
- [ ] Run the focused component test and record red output before the page exists.
- [ ] Implement the client component and accessible styles with stable labels and no non-approved fields such as due date or priority.
- [ ] Run the focused component test and record green output.

### Task 7: Preserve and extend key-path browser coverage

**Files:**
- Create: `tests/e2e/anonymous-tasks.spec.ts`, `README.md`
- Modify: `playwright.config.ts` only if needed by the local test server.

**Interfaces:**
- The browser suite uses an isolated browser context per visitor and synthetic values `DEMO-REQ-A8-133-E2E-<run-id>`.
- The key path covers first visit without auth, add/list, isolation between contexts, complete and reload, restore, delete and reload.

- [ ] Write the Playwright scenario and assert each observable result from `AC-1` through `AC-4`.
- [ ] Run the browser scenario against the local app with a deterministic mock repository or approved test database only; record any unavailable environment as a blocker rather than using live data.
- [ ] Document local setup, required non-secret variables, and the synthetic-data rule.

### Task 8: Full verification and handoff evidence

**Files:**
- Modify: only files needed to correct failures found by the commands below.

- [ ] Run `npm test` and record the complete red/green outcome.
- [ ] Run `npm run lint`, `npm run build`, and `npm run verify`; apply systematic debugging before any correction if one fails.
- [ ] Run `npm run test:e2e` only with a local deterministic mock or explicitly configured safe local target; do not run UAT scripts.
- [ ] Re-read `spec.md`, `plan.md`, `tasks.md`, and `testcases.md`; verify each `AC-1`–`AC-4`, synthetic-data compliance, and retained E2E coverage.
- [ ] Inspect `git diff --check`, `git status`, and the changed-path list; do not edit state or workflow records.
