-- Courses the owner adds or changes herself.
--
-- The thirteen courses the site launched with live in the code, and they stay
-- there: they are complete, translated, and the site renders them with no
-- database at all. A row here either overrides fields of one of those, by id,
-- or introduces a course that was not in the code. Null means "leave whatever
-- the code says", so changing a price does not require restating the title.
--
-- Re-runnable.

create table if not exists public.courses (
  id           text primary key,
  cat          text,
  title        text,
  dur          text,
  price        text,
  was          text,
  descr        text,          -- desc is reserved in SQL
  photo        text,
  video        text,          -- a link: YouTube, Vimeo, Bunny. The file lives with the host, never here.
  badge        text,
  access       text,
  access_days  int,
  -- Placement on the front page. featured drives the top row, sort orders it.
  featured     boolean,
  sort         int,
  -- Retired rather than deleted, so a course can come back and so the rows it
  -- is referenced from - enrollments, submissions - keep meaning something.
  hidden       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id) on delete set null
);

alter table public.courses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'courses'
                   and policyname = 'courses public read') then
    -- A catalogue is public by definition.
    create policy "courses public read" on public.courses
      for select using (true);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'courses'
                   and policyname = 'courses admin write') then
    create policy "courses admin write" on public.courses
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
