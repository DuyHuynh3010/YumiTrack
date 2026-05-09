create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  practice_date date default current_date not null,
  overall_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ends (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  arrow_1 boolean not null,
  arrow_2 boolean not null,
  arrow_3 boolean not null,
  arrow_4 boolean not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.ends enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can read their own sessions" on public.practice_sessions;
drop policy if exists "Users can create their own sessions" on public.practice_sessions;
drop policy if exists "Users can update their own sessions" on public.practice_sessions;
drop policy if exists "Users can delete their own sessions" on public.practice_sessions;
drop policy if exists "Users can read their own ends" on public.ends;
drop policy if exists "Users can create their own ends" on public.ends;
drop policy if exists "Users can update their own ends" on public.ends;
drop policy if exists "Users can delete their own ends" on public.ends;

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can create their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Users can read their own sessions"
on public.practice_sessions for select
using (user_id = auth.uid());

create policy "Users can create their own sessions"
on public.practice_sessions for insert
with check (user_id = auth.uid());

create policy "Users can update their own sessions"
on public.practice_sessions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own sessions"
on public.practice_sessions for delete
using (user_id = auth.uid());

create policy "Users can read their own ends"
on public.ends for select
using (user_id = auth.uid());

create policy "Users can create their own ends"
on public.ends for insert
with check (user_id = auth.uid());

create policy "Users can update their own ends"
on public.ends for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own ends"
on public.ends for delete
using (user_id = auth.uid());
