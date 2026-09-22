# Anonymous Personal To-do List

This application provides an anonymous personal task list. A visitor receives an automatic browser cookie on first visit; no registration, login, email, or payment is required.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to a local environment file and provide only the platform-approved server values when using Supabase.
3. Run `npm run dev`.

The production route uses `BUSINESS_DIRECT_DATABASE_URL` and `BUSINESS_DIRECT_DATABASE_SCHEMA` on the server. The browser never receives those values. The local Playwright suite sets `BUSINESS_DIRECT_TEST_MODE=memory` and uses an isolated in-memory repository, so it does not connect to Supabase or any live environment.

## Verification

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run verify`
- `npm run test:e2e`

All committed fixtures and browser evidence use synthetic `DEMO-REQ-A8-133-*` values. Do not place real names, telephone numbers, addresses, or business data in tests, logs, screenshots, or exports.
