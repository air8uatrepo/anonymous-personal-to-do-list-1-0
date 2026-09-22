# REQ-A8-133 Development Tasks

Baseline: confirmed `specs/REQ-A8-133/spec.md` revision 3.

Each task is one independently verifiable behavior and links to the Product-owned acceptance criteria. No task changes product meaning or adds a feature outside the confirmed baseline.

| Task | Behavior-sized objective | Product acceptance | Verification | Risk |
| --- | --- | --- | --- | --- |
| TASK-001 | Establish the Next.js, TypeScript, unit-test, browser-test, and environment-safe project shell. | AC-1 | Project-contract unit test, lint, build. | Medium |
| TASK-002 | Create or reuse one automatic anonymous visitor identifier without user typing. | AC-1, AC-2 | Visitor and validation unit tests. | High |
| TASK-003 | Persist and retrieve only the current visitor’s tasks through a server-only repository boundary. | AC-1, AC-2, AC-3, AC-4 | Repository unit tests with typed driver doubles. | High |
| TASK-004 | Provide the additive Supabase schema, grants, RLS enablement, and owner policy. | AC-2, AC-3, AC-4 | Migration contract test and manifest hash verification. | High |
| TASK-005 | Provide add/list/complete/restore/delete HTTP operations with validation and ownership-safe errors. | AC-1, AC-2, AC-3, AC-4 | Route tests for two synthetic visitors and mutation outcomes. | High |
| TASK-006 | Render the anonymous task-list experience with accessible controls and reload-backed state. | AC-1, AC-3, AC-4 | Component tests and local browser flow. | Medium |
| TASK-007 | Verify the cumulative browser key path, including isolation and persistence after reload. | AC-1, AC-2, AC-3, AC-4 | Playwright `anonymous-tasks.spec.ts`. | High |
| TASK-008 | Complete focused and full repository verification without modifying state or using live data. | AC-1, AC-2, AC-3, AC-4 | `npm test`, `npm run lint`, `npm run build`, `npm run verify`, safe E2E. | High |

## Execution order

1. TASK-001 establishes the runnable test harness.
2. TASK-002 defines domain and anonymous identity behavior.
3. TASK-003 and TASK-004 establish the persistence boundary and database contract.
4. TASK-005 exposes behavior through HTTP.
5. TASK-006 renders the end-user flow.
6. TASK-007 verifies the cumulative browser path.
7. TASK-008 performs final verification and evidence collection.

## Test-first requirement

For every behavior task, create or identify the failing test, run it and capture the expected red result, implement the smallest change, then run the focused test to capture green. Any unexpected test, build, lint, migration, or runtime result requires systematic-debugging root-cause investigation before a correction.

## Scope boundary

The implementation does not add accounts, authentication, email input, sharing, due dates, reminders, priority levels, tags, attachments, or search.
