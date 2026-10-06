-- 1. A student may hand work in again after it was sent back.
--
-- Students were blocked from updating their own submission, for a good reason:
-- otherwise they could mark their own homework passed. The result was that work
-- returned as "needs redoing" could never be redone - the page had nothing to
-- offer but the verdict.
--
-- The update is allowed only on a row of theirs that is sitting in 'redo', and a
-- trigger decides what the update may actually change: the work goes back into
-- the queue, and the mark and the comment are cleared rather than carried over.
-- So the policy opens the door and the trigger holds the reins.

drop policy if exists "submissions: resend own when sent back" on public.submissions;
create policy "submissions: resend own when sent back"
  on public.submissions for update
  using (auth.uid() = profile_id and status = 'redo')
  with check (auth.uid() = profile_id);

create or replace function public.submission_student_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if public.is_admin() then
    return new;
  end if;
  -- Anyone else may only replace the work itself.
  new.status     := 'sent';
  new.grade      := null;
  new.feedback   := null;
  new.profile_id := old.profile_id;
  new.course_id  := old.course_id;
  new.task_id    := old.task_id;
  return new;
end;
$fn$;

drop trigger if exists submissions_student_guard on public.submissions;
create trigger submissions_student_guard
  before update on public.submissions
  for each row execute function public.submission_student_update();

-- 2. Only someone who holds the course may write about it.
--
-- Comments were opened to everyone with an account, with a mark showing who had
-- actually taken the course. Reading an opinion from someone who has not done
-- the course is worth less than not reading one, so the gate goes back.

drop policy if exists "reviews: write own" on public.course_reviews;
drop policy if exists "reviews: write own when owned" on public.course_reviews;
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
