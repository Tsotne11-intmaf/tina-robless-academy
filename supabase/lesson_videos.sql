-- One video per lesson.
--
-- The file itself never lives here. What is stored is the reference the video host
-- gave back - a Bunny guid, a Vimeo id, a link - and the host is free to change
-- later without touching a single lesson.

create table if not exists public.lesson_videos (
  course_id    text not null,
  lesson_index int  not null,
  url          text not null,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id) on delete set null,
  primary key (course_id, lesson_index)
);

alter table public.lesson_videos enable row level security;

-- The reference is part of the course, so only the people who bought the course
-- may read it. Handing it to everyone would put the lessons a link away from
-- anyone who opened the page, which is exactly what the paywall exists to stop.
create policy "lesson videos: read when owned"
  on public.lesson_videos for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.enrollments e
      where e.profile_id = auth.uid()
        and e.course_id = lesson_videos.course_id
        and (e.expires_at is null or e.expires_at > now())
    )
  );

create policy "lesson videos: admin writes"
  on public.lesson_videos for all
  using (public.is_admin())
  with check (public.is_admin());
