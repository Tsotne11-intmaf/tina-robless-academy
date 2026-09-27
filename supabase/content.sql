-- Editable site content.
--
-- Every piece of text on the public pages already carries a stable key from the
-- original single-file site - t.about.3, t.home.14 and so on - and the same keys
-- survived the conversion. A row here overrides the text that ships in the code
-- for that key; no row means the code's own wording stands. That way the site is
-- complete and correct before anyone has edited anything, and an edit is a small
-- row rather than a redeploy.
--
-- Re-runnable.

create table if not exists public.content (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

alter table public.content enable row level security;

do $$
begin
  -- Readable by anyone, because it is the text of a public web page. There is
  -- nothing here a visitor could not already read by looking at the site.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'content'
                   and policyname = 'content public read') then
    create policy "content public read" on public.content
      for select using (true);
  end if;

  -- Written only by an admin. Without this, anyone with the publishable key
  -- could rewrite the homepage.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'content'
                   and policyname = 'content admin write') then
    create policy "content admin write" on public.content
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
