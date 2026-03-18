create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role text not null default 'faculty' check (role in ('faculty', 'admin')),
  provider text not null default 'email',
  full_name text,
  last_sign_in_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
