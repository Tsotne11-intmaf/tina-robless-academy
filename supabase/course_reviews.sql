-- What a student says about a course she has taken, and the work she has to show
-- for it. One per student per course, editable afterwards.

create table if not exists public.course_reviews (
  id          bigint generated always as identity primary key,
  course_id   text not null,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  -- The name as it stood when the review was written. The course page is public,
  -- so reading it must not mean reading the profiles table.
  author_name text not null default '',
  body        text,
  photo_url   text,
  -- Taken down rather than deleted, so a removal can be undone.
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, course_id)
);

create index if not exists course_reviews_course_idx on public.course_reviews(course_id);

alter table public.course_reviews enable row level security;

-- Anyone may read what is shown, including a visitor who is not signed in - that
-- is the point of putting it on the sales page. The author and the admin also
-- see what has been taken down.
create policy "reviews: read what is shown"
  on public.course_reviews for select
  using (not hidden or auth.uid() = profile_id or public.is_admin());

-- Only someone who actually holds the course may write about it, and only as
-- herself. The same rule the homework table uses.
create policy "reviews: write own when owned"
  on public.course_reviews for insert
  with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.enrollments e
      where e.profile_id = auth.uid()
        and e.course_id = course_reviews.course_id
        and (e.expires_at is null or e.expires_at > now())
    )
  );

create policy "reviews: change own"
  on public.course_reviews for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Tina can take one down; a student can withdraw her own.
create policy "reviews: admin moderates"
  on public.course_reviews for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews: delete own or admin"
  on public.course_reviews for delete
  using (auth.uid() = profile_id or public.is_admin());
