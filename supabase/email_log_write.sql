-- Letting the admin's own session record that a letter was sent.
--
-- email_log had row level security on, a read policy for the admin, and no write
-- policy at all. The nightly reminder uses the service role and so was never
-- affected, but the two routes the admin triggers - "course opened" and "work
-- marked" - run inside her own session. Claiming the row came back empty, which
-- those routes read as "already sent", so every one of those letters was dropped
-- before Resend was ever called. Nothing was in the log because nothing could be.
--
-- Both routes check is_admin() before reaching this point; the policy says the
-- same thing again, so a student still cannot forge a record of being emailed.

drop policy if exists "email_log admin writes" on public.email_log;
create policy "email_log admin writes"
  on public.email_log for insert
  with check (public.is_admin());

-- The claim is released again when sending fails, so the letter can be retried
-- rather than counted as delivered.
drop policy if exists "email_log admin cleanup" on public.email_log;
create policy "email_log admin cleanup"
  on public.email_log for delete
  using (public.is_admin());
