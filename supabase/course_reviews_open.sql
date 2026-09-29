-- Comments move to every course page, not only the ones the writer has bought.
--
-- The guarantee that used to come from who was allowed to write now comes from a
-- mark on the comment itself: a review written by someone who holds the course
-- says so, and one written by anyone else does not. The mark is set by the
-- database, not sent by the browser, so it cannot be claimed by asking for it.

alter table public.course_reviews
  add column if not exists verified boolean not null default false;

create or replace function public.mark_review_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.verified := exists (
    select 1
    from public.enrollments e
    where e.profile_id = new.profile_id
      and e.course_id = new.course_id
      and (e.expires_at is null or e.expires_at > now())
  );
  return new;
end;
$$;

drop trigger if exists course_reviews_verify on public.course_reviews;
create trigger course_reviews_verify
  before insert or update on public.course_reviews
  for each row execute function public.mark_review_verified();

-- Anyone signed in may now write, as themselves. Holding the course is what the
-- mark records, no longer what the gate checks.
drop policy if exists "reviews: write own when owned" on public.course_reviews;
drop policy if exists "reviews: write own" on public.course_reviews;
create policy "reviews: write own"
  on public.course_reviews for insert
  with check (auth.uid() = profile_id);

-- Existing rows predate the column, so they are marked from the enrolments now.
update public.course_reviews r
set verified = exists (
  select 1 from public.enrollments e
  where e.profile_id = r.profile_id
    and e.course_id = r.course_id
    and (e.expires_at is null or e.expires_at > now())
);
