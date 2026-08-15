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

1. Add automated tests for practice calculations and Supabase mapping.
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
