# Deployment

## Vercel

1. Import `https://github.com/DuyHuynh3010/YumiTrack` into Vercel.
2. Set the framework preset to Next.js.
3. Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

4. Deploy the `main` branch.

## Supabase Auth URLs

After Vercel creates a production URL, add these in Supabase Authentication URL Configuration:

```text
https://your-vercel-domain.vercel.app/login
https://your-vercel-domain.vercel.app/account
```

Set Site URL to:

```text
https://your-vercel-domain.vercel.app
```

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor after pulling this branch. It adds the `finished_at` column used by the finish/reopen session flow.

## Local Verification

```bash
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```
