# REQ-A8-133 Test Cases

Baseline: confirmed `specs/REQ-A8-133/spec.md` revision 3.

All fixtures and test values are synthetic and use the approved prefix `DEMO-REQ-A8-133-`. No real names, telephone numbers, addresses, or business data are used.

## TC-001 — First visit can manage tasks without authentication

- Risk: High
- Linked tasks: TASK-001, TASK-002, TASK-005, TASK-006, TASK-007
- Linked acceptance: AC-1
- Preconditions: Local app uses the deterministic test repository; a fresh browser context has no visitor cookie.
- Steps: Open the app; confirm no registration or login prompt; submit task title `DEMO-REQ-A8-133-E2E-001`; complete it; restore it; delete it.
- Expected outcome: The task is listed, completion and restore are visible and functional, deletion removes it, and no authentication or payment step appears.
- Edge/error coverage: Blank title returns a user-visible validation error and does not create a task.
- Review focus: Anonymous first-visit identity is automatic and requires no typing.

## TC-002 — Visitors are isolated

- Risk: High
- Linked tasks: TASK-002, TASK-003, TASK-004, TASK-005, TASK-007
- Linked acceptance: AC-2
- Preconditions: Two fresh browser contexts use different automatic visitor cookies.
- Steps: Visitor A creates `DEMO-REQ-A8-133-E2E-002`; Visitor B opens the app and lists tasks.
- Expected outcome: Visitor B sees an empty list and cannot update or delete Visitor A’s task.
- Edge/error coverage: Direct item mutation with Visitor B’s context returns `404` and leaves Visitor A’s task unchanged.
- Review focus: Cookie identity and RLS owner predicate agree.

## TC-003 — Completion and restore survive reload

- Risk: High
- Linked tasks: TASK-003, TASK-004, TASK-005, TASK-006, TASK-007
- Linked acceptance: AC-3
- Preconditions: One visitor has a task `DEMO-REQ-A8-133-E2E-003`.
- Steps: Mark it complete; reload; inspect the completed state; restore it; reload again.
- Expected outcome: The first reload shows the task complete; the second reload shows it incomplete.
- Edge/error coverage: Repeating the same completion value remains stable and does not create another task.
- Review focus: Stored boolean state is read back from persistence rather than only retained in client memory.

## TC-004 — Deletion survives reload

- Risk: High
- Linked tasks: TASK-003, TASK-004, TASK-005, TASK-006, TASK-007
- Linked acceptance: AC-4
- Preconditions: One visitor has a task `DEMO-REQ-A8-133-E2E-004`.
- Steps: Delete the task; reload the page; request the task list again.
- Expected outcome: The task is absent after the reload and remains absent from the persisted list.
- Edge/error coverage: Deleting the same task ID again returns `404` without affecting another task.
- Review focus: Delete is scoped by visitor identity and is durable.

## TC-005 — Persistence contract is complete and additive

- Risk: High
- Linked tasks: TASK-003, TASK-004
- Linked acceptance: AC-2, AC-3, AC-4
- Preconditions: Migration SQL and manifest are present.
- Steps: Parse the migration and manifest; inspect schema/table creation, RLS, grants, owner policy, and destructive-statement guard.
- Expected outcome: The migration creates the working target required by the platform contract and the manifest matches the exact SQL bytes.
- Edge/error coverage: The test fails if RLS is enabled without grants/policy or if a destructive statement is introduced.
- Review focus: The application role can operate only on rows owned by the current anonymous identifier.

## Cumulative E2E coverage

`tests/e2e/anonymous-tasks.spec.ts` is the first and only application E2E artifact in this empty scaffold. It retains all required key paths in one cumulative scenario suite: unauthenticated first visit, add/list, visitor isolation, complete/reload, restore/reload, delete/reload, and invalid-input handling.
