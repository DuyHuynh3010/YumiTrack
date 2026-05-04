# YumiTrack

YumiTrack is a Kyudo practice tracker based on the provided PDF specification.

## Built So Far

- Next.js App Router project structure
- TypeScript models for sessions and 4-arrow ends
- Dashboard with today/week/month style summaries
- Practice page with interactive O/X end input
- Calendar page with color-coded day states
- Stats page with chart mockups and filters
- Login and signup demo screens
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

## Next Build Steps

1. Replace mock data with Supabase reads.
2. Wire login/signup to Supabase Auth.
3. Persist session creation and end input.
4. Add protected routes.
5. Replace chart mockups with real grouped data.
