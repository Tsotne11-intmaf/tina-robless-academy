-- Notifications: what has to exist in the database before any email can be sent.
-- Written to be re-runnable, so it can be applied again without dropping anything.

-- ---------------------------------------------------------------------------
-- 1. When was this student last actually here?
-- ---------------------------------------------------------------------------
-- auth.users.last_sign_in_at cannot answer this. A session survives for weeks,
-- so someone who bought a course, signed in once and never came back still has
-- a recent sign-in. Visiting the cabinet is the signal we need, not signing in.
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- The token that lets someone unsubscribe from a link in an email, where by
-- definition they are not signed in. Random per profile, so it identifies the
-- recipient without exposing their id and cannot be guessed for anyone else.
alter table public.profiles
  add column if not exists unsub_token uuid not null default gen_random_uuid();

create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

revoke all on function public.touch_last_seen() from public;
grant execute on function public.touch_last_seen() to authenticated;

-- Unsubscribing works from the email link alone, with no session. The token is
-- the only thing accepted, and it can only ever switch marketing off.
create or replace function public.unsubscribe(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit int;
begin
  update public.profiles set marketing_ok = false where unsub_token = token;
  get diagnostics hit = row_count;
  return hit > 0;
end;
$$;

revoke all on function public.unsubscribe(uuid) from public;
grant execute on function public.unsubscribe(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. What has already been sent
-- ---------------------------------------------------------------------------
-- Without this the daily job would send the same "we miss you" message every
-- single day to the same person for as long as they stayed away, and a course
-- announcement would go out again on every click of the button.
create table if not exists public.email_log (
  id        bigserial primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  kind      text not null,                -- 'inactive' | 'new_course'
  ref       text not null default '',     -- course id, or the visit the reminder was about
  sent_at   timestamptz not null default now()
);

-- The uniqueness is the whole mechanism, not a nicety: one row per
-- (person, kind, occasion), enforced by the database rather than by the job
-- remembering to check.
create unique index if not exists email_log_once
  on public.email_log (user_id, kind, ref);

create index if not exists email_log_sent_at
  on public.email_log (sent_at desc);

alter table public.email_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'email_log' and policyname = 'email_log admin read'
  ) then
    create policy "email_log admin read" on public.email_log
      for select using (public.is_admin());
  end if;
end $$;

-- No insert policy: rows are written only by the server-side jobs, never by a
-- browser. A student cannot forge a record saying they were already emailed.
