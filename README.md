# YumiTrack

YumiTrack is a Kyudo practice tracker based on the provided PDF specification.

## Built So Far

- Next.js App Router project structure
- TypeScript models for sessions and 4-arrow ends
- Dashboard with Supabase-backed today/week/recent-session summaries
- Practice page with interactive O/X end input
- Practice sessions, overall notes, and ends persisted to Supabase
- Session detail page backed by Supabase
- Calendar page with Supabase-backed color-coded day states
- Stats page with Supabase-backed Recharts charts and filters
- Login and signup wired to Supabase Auth
- Sidebar logout wired to Supabase Auth
- Edit/delete sessions and ends
- Practice date selection and finish/reopen session flow
- Account settings and password reset
- CSV export for practice history
- Supabase SQL schema and RLS policies

## Run Locally

Install dependencies first:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. In Supabase Auth settings, add these allowed redirect URLs for local development:

```text
http://localhost:3000/login
http://localhost:3000/account
```

## Next Build Steps

1. Configure and run database integration tests with two dedicated test accounts.
2. Move protected route checks to server middleware.
3. Add technique tags and goal tracking.
4. Add dark mode.
5. Deploy to Vercel.

## Test Practice Persistence

1. Log in and open `/practice`.
2. Select the four arrow results and click `Save end`.
3. Save an overall session note.
4. Refresh the page and confirm the latest session, ends, and notes reload.
5. Check `practice_sessions` and `ends` in the Supabase Table Editor.

## Test Management Features

1. Open a saved session from the dashboard or calendar.
2. Edit the practice date or session note.
3. Edit an end result and note.
4. Delete an end.
5. Finish and reopen the session.
6. Download CSV from `/export`.

## Deployment

See `DEPLOYMENT.md` for Vercel and Supabase production setup.

## Automated Tests

Run local tests without Supabase credentials:

```bash
npm test
npm run test:watch
```

These cover hit rates, weighted totals, daily/weekly/monthly chart grouping,
date range request filters, data mapping, create/update/delete requests and errors.
Supabase HTTP responses are mocked in unit tests; they do not prove database RLS.
GitHub Actions runs these tests and TypeScript checks on pushes and pull requests.

To test actual persistence and account isolation:

1. Use a separate Supabase test project and apply `supabase/schema.sql`.
2. Create two distinct test users and confirm their emails.
3. Create `.env.test.local` using `.env.test.example` and fill in the test project
   URL, publishable key, and both users' credentials. This file is ignored by Git.
4. Run `npm run test:integration`.

Integration tests exercise real CRUD, session delete cascades, and RLS in both
directions: users cannot read, edit, delete, impersonate, or attach ends to another
user's sessions. Anonymous reads and session creation are also checked.
Only sessions created by the tests are deleted during cleanup; their ends cascade.
Integration tests are deliberately separate from the default test command and CI
because they require a configured test database and credentials.

After updating from an older schema, rerun `supabase/schema.sql`: end insert/update
policies now verify ownership of the parent session as well as the end itself.
