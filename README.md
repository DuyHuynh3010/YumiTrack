# YumiTrack

YumiTrack is a Kyudo practice tracker based on the provided PDF specification.

## Built So Far

- Next.js App Router project structure
- TypeScript models for sessions and 4-arrow ends
- Dashboard with today/week/month style summaries
- Practice page with interactive O/X end input
- Calendar page with color-coded day states
- Stats page with chart mockups and filters
- Login and signup wired to Supabase Auth
- Sidebar logout wired to Supabase Auth
- Session detail page
- Supabase client placeholder
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
5. In Supabase Auth settings, add `http://localhost:3000/login` as an allowed redirect URL for local development.

## Next Build Steps

1. Add protected route middleware using Supabase session cookies.
2. Replace mock data with Supabase reads.
3. Persist session creation and end input.
4. Replace chart mockups with real grouped data.
5. Deploy and add production redirect URLs.
