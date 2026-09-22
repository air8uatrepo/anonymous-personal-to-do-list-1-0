# anonymous-personal-to-do-list-1-0 - agent operating guide

This file is created with the application and is versioned with it. It states
the default technology stack for a new application in this organization and the
specification-driven flow every change follows. Treat the stack as a starting
point, not a lock: an approved, requirement-specific decision may replace part
of it, and that exception is recorded in the requirement's own SDD artifacts
before development starts. Never change an existing repository's confirmed
architecture to match this default.

## Default technology stack

### Frontend

- Next.js 16
- React 19
- TypeScript

### Backend

- Node.js through Next.js API Routes
- Zod for form-data validation
- REST API endpoints

### Database

- Supabase
- Row Level Security (RLS)

An application reaches Supabase through a server-only pooled connection as a
dedicated least-privilege role, never `postgres`. Its additive migration must
produce the whole working target, not only the table: the schema, the table,
RLS enabled, **and** the schema/table grants and the RLS policy that role
needs. Enabling RLS without granting the application role a policy yields a
schema the application cannot read or write, and the failure appears at runtime
rather than at migration time.

### Deployment and source control

- Vercel for production deployment, through the repository's GitHub Actions
  workflow `.github/workflows/deploy.yml`, never the Vercel Git integration
- GitHub for source control

### Security configuration

- `SUPABASE_SECRET_KEY` is server-only. Never expose it through browser code,
  `NEXT_PUBLIC_*` variables, client bundles, logs, commits, fixtures, or test
  evidence.

## Specification-driven development (SDD)

Every change starts from an approved specification. Invoke the installed
Superpowers skills in this order:

1. `brainstorming` - clarify the change in business language before any design.
2. `writing-plans` - turn the confirmed specification into an implementation
   plan.
3. `test-driven-development` - write or identify a failing test before
   implementation, then Red-Green-Refactor.
4. `systematic-debugging` - for every failing test, build, migration check, or
   runtime result; never patch by guesswork.
5. `verification-before-completion` - before claiming completion, using fresh
   command output.

No technical plan without an approved specification; no implementation without
an approved plan and test cases.

### Specification artifacts

Per-requirement SDD artifacts live under `specs/<requirement-id>/`:

- `spec.md` - the confirmed baseline: goal, in-scope behavior, acceptance
  criteria, business assumptions, examples, explicit non-goals, and the literal
  scope boundary `This change does not`.
- `plan.md` - the approved implementation plan.
- `tasks.md` - behavior-sized tasks, each one independently verifiable and
  linked to an acceptance criterion.
- `testcases.md` - the test cases derived from the plan and the acceptance
  criteria.

The workflow's own state record lives under
`.ai-app-devops/requirements/<requirement-id>/` (`STATE.md`, `EVENTS.md`,
`OUTBOX.md`, `CHANGE-STATEMENT.md`, `TECHNICAL-RECORD.md`). That record is
authoritative for workflow state; the `specs/` artifacts above are the product
and engineering record.

### Quality bar

Run the repository's own commands before claiming a change works:

- Unit/component tests: `npm test`
- Lint: `npm run lint`
- Production build: `npm run build`
- Browser tests: `npm run test:e2e`

## Managed file

<!-- BEGIN:air8-business-direct:agents -->
This file is created and managed by the Business Direct workflow
(`workflow_type: business_direct_app_v1`). `next dev` may append its own
managed Next.js agent-rules block at the end; keep both blocks and do not
delete this file.
<!-- END:air8-business-direct:agents -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
