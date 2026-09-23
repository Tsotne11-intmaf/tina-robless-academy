# Tina Robless Nail Academy — project notes for Claude Code

Read this before touching anything. It replaces the chat history in which the site was built.

## What this is
Website + online school for **Tina Kuchukhidze (Tina Robless)** — nail master, educator, CMC World Champion,
President of Georgia Nails, based in Tbilisi. Instagram @tinarobless_, TikTok @tinarobless, Facebook tiniko.kuchukhidze.
Business: online video courses about long sculpted ("American") nails, French, nail art; students get a personal
account, sequential lessons, homework with deadlines, certificates; a shop is planned.

Owner/operator of this repo: Tsotne (GitHub `Tsotne11-intmaf`). Tina is the client and the admin user.
Deployed at **https://www.tinarobless.com** via Vercel (project `tina-robless-academy`, connected to this GitHub repo).
GitHub Pages was also enabled earlier (`https://tsotne11-intmaf.github.io/tina-robless-academy/`); Vercel is the primary.
Domain bought at domenebi.ge; nameservers should point to `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

## Architecture — one file, on purpose
- **Everything is in `index.html`** (~1.6 MB): CSS, JS, all photos as base64. No build step, no frameworks,
  no external JS. Only external requests: Google Fonts and (from the admin panel) a public translate endpoint.
  Keep it that way unless explicitly asked to split. The owner deploys by uploading `index.html` to GitHub.
- **Pages** are `<main data-page="...">` blocks; only one is visible. Client-side router at the bottom
  (`go(hash)`, `route()`), driven by `#hash`. Links `href="#..."` are intercepted with JS (works inside
  sandboxed previews). Routes: `home`, `catalog`, `catalog/<cat>`, `kurs/<id>`, `certificates`, `students`,
  `about`, `shop`, `terms`, `privacy`, `refund`, `login`, `dashboard`, `course/<id>`, `lesson/<id>/<n>`,
  `hw`, `mycert`, `admin`, `admin/<tab>`, `admin/student/<i>`.
- **Source language is Georgian.** All text in the HTML/JS is Georgian (ka). Other languages are produced at
  runtime by `translateDom()` using `DICT` — `{ "<georgian>": [en, ru, el] }` — a text-node walker that
  stores the original in `node.__ka`. Exact match first, then longest-substring replacement.
  Languages: ka (default), en, ru, el. Switcher in the header; choice saved in localStorage `tr_lang`.
  **When you add or change any visible Georgian string, add a DICT entry with en/ru/el**, or it will show in
  Georgian in the other languages. Admin page (`data-page="admin"`) is never translated.
- **Fonts**: Fraunces (italic headlines) + DM Sans; Noto Sans/Serif Georgian and Noto Sans/Serif for Greek.
- **Design**: hot-pink brand (`--plum:#E5177A`, `--plum-deep:#B80F5F`, blush backgrounds, deep berry `#3A0B24`
  for dark sections), white hero with near-black italic headline, gold (`#E3B85C`) only for "premium" badges.
  Prices are pink pills. Cards have fixed heights (text clamps, never resizes the box). Motion is CSS-only and
  wrapped in `prefers-reduced-motion: no-preference`. Header hides on scroll down, returns on stop/scroll up.
  No scroll-reveal (removed: it looked like slow loading).
- **Mobile**: breakpoints at 1120/860/640/380px. Mobile menu is `body.menu-open`. Hero nail captions become
  a `.hand-tags` chip row on phones.

## Data model (all in JS, all in this file)
- `CATALOG` — public course list (id, cat, title, desc, dur, price, was, badge, img/photo, learn[], incl[]).
  cats: `package`, `program`, `technique`, `art`, `business`. badge: `package` (pink), `premium` (gold), `sale`
  (percent computed from `was` vs `price`). Course ids in use: master-1, master-2, bundle, american, french,
  extreme, correction, efile, crystals, chrome, ombre, pink, money.
- `COURSES` — lesson structure for the student area (modules → lessons) for master-1 and french.
- `HOMEWORK` — tasks: {id, course, lesson, title, task, due(ms), status todo|sent|done, student(email|null),
  attach(dataURL), attachName, photo, note, grade, created}. `student` null = common to everyone on that course.
- `CFG` — the editable site config (see admin). Default built by `cfgDefault()` from the HTML; merged with
  localStorage `tr_site_config` by `cfgLoad()`; `applyConfig()` writes it into the DOM at startup.
  Keys: hero{title,sub,btn,nails[5],tags[5]}, about{p1,p2,creds[],portrait,instagram,tiktok,facebook},
  poster, gallery[6], t{ "<data-edit key>": html }, catalog[], homework[], enrolled[], sales[], students[]
  (graduate cards), shop{open, products[]}, tr{ "<ka text>": {en,ru,el} }.
- `LMS` — student area (demo auth: any email/password; if the email matches `CFG.enrolled` the student gets
  those courses/progress). Progress = `done[courseId] = number of completed lessons` (sequential unlock).
- `ADMIN` — admin panel + inline edit mode. Password `ADMIN_PASS = 'tina2026'` (client-side only, placeholder).
  Tabs: activity (STATS + CFG.sales), homework (students accordion → profile → assign/grade), courses, data
  (export/import JSON, translation editor). **Inline edit mode**: elements carry `data-edit="t.<page>.<n>"`
  or `data-edit="hero.title"`, images carry `data-img="<cfg path>"`; `ADMIN.decorate()` makes them editable /
  adds 📷 buttons, course-card ✎, graduate ✎/✕/+, shop tools. Saving = `cfgSave()` → localStorage → reload.
- `TR` — auto-translation on admin save: collects new Georgian strings (`TR.strings()`), translates via
  translate.googleapis.com (gtx) with MyMemory fallback, stores in `CFG.tr`, merges into `DICT` at start.
- `STATS` — per-browser visit counts in localStorage `tr_stats` (day → {v,i,o}).
- `COOKIES` — consent banner (`tr_cookies`); analytics snippet slot in `COOKIES.enableAnalytics()`.

## Known limitations (this is why a backend is next)
Everything the admin or a student saves lives in **that browser's localStorage** only. No real accounts,
passwords, payments, video streaming, email, or shared data yet. Photos uploaded via admin are capped at
~900 KB each because of the ~5 MB localStorage limit.

## Planned next (agreed with the owner)
1. **Supabase** (region Frankfurt): auth (email), Postgres tables profiles, courses, purchases, progress,
   homework, submissions, comments, samples, certificates, posts; Storage bucket `media`; replace the
   localStorage layer in `LMS`, `ADMIN`, `SHOP` with supabase-js calls. Keep the same UI.
2. **Resend** for email: welcome + password after purchase, new course / discount posts to opted-in students,
   lesson reminders (7 and 21 days inactive), homework deadline (48 h) and "feedback ready", certificate PDF,
   shop opening. Only marketing mail needs the `marketing_ok` opt-in (already in the privacy policy).
3. **Payments**: TBC or Bank of Georgia gateway (or Stripe); webhook → create account → email.
4. **Video**: Bunny Stream; lesson `.video` placeholder gets the player.
5. Optional: move images out of `index.html` into `images/` once deploy is automated.

## Conventions when editing
- Keep Georgian as the source text; add DICT entries for en/ru/el.
- Don't add libraries or a build step.
- Test quickly with jsdom: load `index.html`, call `go('home')`, `LMS.login('nino@example.com')`,
  `ADMIN.login('tina2026')`, `setLang('en')` and check for leftover Georgian in `main:not([hidden])`.
- After changes: `git add index.html && git commit -m "..." && git push` — Vercel redeploys automatically.
- Placeholders still to be filled by Tina: legal entity name/ID/address/email in terms/privacy/refund, real
  student reviews and graduates, award list beyond the CMC entry, real prices, signature scan for certificates.
