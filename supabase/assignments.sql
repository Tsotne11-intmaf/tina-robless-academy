-- Personal assignments: a task Tina sets for one named student.
--
-- The HOMEWORK list in the catalogue is per course - everyone who owns a course
-- sees the same tasks - so there was no way to tell one student "do this one".
-- These rows sit alongside those and appear in the same place for the student.
-- Re-runnable.

create table if not exists public.assignments (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  title       text not null,
  task        text not null,
  due_at      timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists assignments_profile on public.assignments (profile_id, created_at desc);

alter table public.assignments enable row level security;

do $$
begin
  -- A student sees the tasks set for them, and nobody else's. An admin sees all,
  -- through the same function the rest of the schema uses.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'assignments'
                   and policyname = 'assignments read own or admin') then
    create policy "assignments read own or admin" on public.assignments
      for select using (auth.uid() = profile_id or public.is_admin());
  end if;

  -- Only an admin writes. Without this a student could set themselves homework,
  -- which is harmless but meaningless, and could set it for somebody else, which
  -- is not.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'assignments'
                   and policyname = 'assignments admin write') then
    create policy "assignments admin write" on public.assignments
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
