-- Tina Robless Nail Academy — Supabase schema
-- Run this once in the Supabase SQL editor (Database → SQL Editor → New query).
--
-- Scope: student accounts (email), course enrollments with expiry, lesson progress,
-- and photo storage. Course VIDEO is deliberately NOT here — that goes to Bunny Stream.
--
-- Security model, in one line: the site is a single public HTML file, so the anon key
-- and every query in it are readable by anyone. Nothing is protected by being hidden.
-- Row Level Security below is the actual protection. Every table has RLS enabled and
-- denies by default; each policy grants the narrowest thing that still works.

-- ---------------------------------------------------------------------------
-- 1. Who is an admin
-- ---------------------------------------------------------------------------
-- Admin status lives in a table, never in client code. To make someone an admin,
-- insert their auth user id here by hand from the Supabase dashboard.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Nobody can read or write this table from the client at all. It is managed only
-- from the dashboard, so no policy is created — RLS with no policy = deny everything.

-- SECURITY DEFINER so the function itself can read admins while callers cannot.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Profiles — one row per student, created automatically on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  phone         text,
  -- Marketing consent must be explicit and separate. Your privacy policy already
  -- promises this, and EU students (you support Greek) make it a legal requirement.
  marketing_ok  boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert policy on purpose: rows are created by the trigger below, not by clients.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Enrollments — who may watch what, and until when
-- ---------------------------------------------------------------------------
-- expires_at null = lifetime access. This is what finally makes the per-course
-- access period real: in localStorage a student could just clear storage or change
-- their clock, because the check ran on their own machine. Here the row is on the
-- server and the policy below refuses to return it once it has expired.
create table if not exists public.enrollments (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  granted_at  timestamptz not null default now(),
  expires_at  timestamptz,
  unique (profile_id, course_id)
);

create index if not exists enrollments_profile_idx on public.enrollments(profile_id);

alter table public.enrollments enable row level security;

create policy "enrollments: read own unexpired"
  on public.enrollments for select
  using (
    (auth.uid() = profile_id and (expires_at is null or expires_at > now()))
    or public.is_admin()
  );

create policy "enrollments: admin writes"
  on public.enrollments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Students must never grant themselves access, so there is no student insert policy.
-- Enrollments are created by an admin, or later by a payment webhook using the
-- service_role key from the server side — never from the browser.

-- ---------------------------------------------------------------------------
-- 4. Progress — how far through a course a student is
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  course_id     text not null,
  lessons_done  integer not null default 0 check (lessons_done >= 0),
  updated_at    timestamptz not null default now(),
  primary key (profile_id, course_id)
);

alter table public.progress enable row level security;

create policy "progress: read own"
  on public.progress for select
  using (auth.uid() = profile_id or public.is_admin());

-- A student may record progress only for a course they are actually enrolled in
-- and whose access has not lapsed.
create policy "progress: upsert own when enrolled"
  on public.progress for insert
  with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.enrollments e
      where e.profile_id = auth.uid()
        and e.course_id = progress.course_id
        and (e.expires_at is null or e.expires_at > now())
    )
  );

create policy "progress: update own when enrolled"
  on public.progress for update
  using (auth.uid() = profile_id)
  with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.enrollments e
      where e.profile_id = auth.uid()
        and e.course_id = progress.course_id
        and (e.expires_at is null or e.expires_at > now())
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Storage — photos
-- ---------------------------------------------------------------------------
-- Two buckets, because the two kinds of photo have opposite rules.
--   media       public site images (portraits, certificates, course photos).
--               Anyone may look; only an admin may put anything there.
--   submissions student homework photos. Private. A student sees only their own
--               folder; an admin sees everything.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media: admin write"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

create policy "media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- Student uploads are namespaced by user id: submissions/<uid>/<file>.
-- The policy pins the first path segment to the caller, so one student cannot
-- read or overwrite another student's work.
create policy "submissions: read own"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "submissions: write own"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "submissions: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'submissions'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
