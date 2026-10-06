"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { coachPrice, COACH_STEP } from "@/lib/price";

export type AdminCourse = {
  id: string;
  cat: string;
  title: string;
  dur: string;
  price: string;
  was?: string;
  pricePlus?: string | null;
  desc: string;
  photo?: string | null;
  img?: string | null;
  video?: string | null;
  badge?: string | null;
  featured?: boolean;
  order?: number;
  inCode: boolean;
  hidden: boolean;
};

const CATS: Record<string, string> = {
  package: "პაკეტები",
  program: "პროგრამები",
  technique: "ტექნიკა",
  art: "დიზაინი",
  business: "ბიზნესი",
};

const BADGES: Record<string, string> = {
  "": "— არცერთი —",
  package: "პაკეტი",
  sale: "ფასდაკლება",
};

/* The catalogue, as something the owner can actually work with.

   Adding a course and deciding where it shows are the same job, so the front
   page placement is a checkbox on the course rather than a separate screen to
   remember. */
export default function CoursesTab({ courses }: { courses: AdminCourse[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind?: "ok" | "bad" } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  /* Null when nothing is uploading. A video is hundreds of megabytes and takes
     minutes to send; with no sign of movement the page looks frozen, which is
     exactly what it was reported as. */
  const [pct, setPct] = useState<number | null>(null);
  const [only, setOnly] = useState<"all" | "live" | "hidden">("all");
  /* The address a new course lives at. Held in state so it can be cleaned as it
     is typed: the server only accepts latin letters, digits and hyphens, and a
     title typed in Georgian was refused after the form had been filled in. */
  const [slug, setSlug] = useState("");

  async function save(body: Record<string, unknown>) {
    setBusy(true);
    setMsg({ text: "ინახება…" });
    const r = await fetch("/api/admin/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMsg({ text: "ვერ შეინახა: " + (out.error ?? r.status), kind: "bad" });
      return;
    }
    setMsg({
      text: out.created
        ? "კურსი დაემატა."
        : body.hidden === true
          ? "კურსი დამალულია."
          : body.hidden === false
            ? "კურსი დაბრუნდა საიტზე."
            : "შენახულია.",
      kind: "ok",
    });
    setEditing(null);
    setAdding(false);
    setPhoto(null);
    setVideo(null);
    setSlug("");
    router.refresh();
  }

  /* Removing a course for good, as opposed to taking it off the site. Only
     offered for courses added from the panel - the built-in ones cannot go,
     which the route says too rather than relying on this button not to ask. */
  async function destroy(c: AdminCourse) {
    if (
      !confirm(
        `სამუდამოდ წაიშალოს „${c.title}“?

კურსი, მისი კომენტარები და ვიდეოები წაიშლება. დაბრუნება შეუძლებელია.

თუ მხოლოდ საიტიდან მოხსნა გინდა, გამოიყენე „დამალვა“.`
      )
    )
      return;
    setBusy(true);
    setMsg({ text: "იშლება…" });
    const r = await fetch(`/api/admin/course?id=${encodeURIComponent(c.id)}`, {
      method: "DELETE",
    });
    const out = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMsg({ text: out.error ?? "ვერ წაიშალა", kind: "bad" });
      return;
    }
    setMsg({ text: "კურსი წაიშალა.", kind: "ok" });
    setEditing(null);
    router.refresh();
  }

  function form(c: AdminCourse | null) {
    const isNew = c === null;
    return (
      <form
        className="adm-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          save({
            id: isNew ? String(f.get("id")) : c!.id,
            cat: String(f.get("cat")),
            title: String(f.get("title")),
            dur: String(f.get("dur")),
            price: String(f.get("price")),
            was: String(f.get("was") || ""),
            price_plus: String(f.get("price_plus") || ""),
            descr: String(f.get("descr")),
            video: String(f.get("video") || ""),
            badge: String(f.get("badge") || ""),
            photo: photo ?? (isNew ? "" : c!.photo ?? ""),
            featured: f.get("featured") === "on",
            sort: f.get("sort") ? Number(f.get("sort")) : null,
          });
        }}
      >
        <h2 style={{ marginBottom: 14 }}>
          {isNew ? "ახალი კურსი" : "კურსის რედაქტირება"}
        </h2>

        {isNew ? (
          <div className="field">
            <label>მისამართი (ლათინურად, მაგ. french-pro)</label>
            <input
              name="id"
              placeholder="french-pro"
              required
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/-+/g, "-")
                    .slice(0, 40)
                )
              }
            />
            <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
              {slug
                ? `კურსის მისამართი: tinarobless.com/kurs/${slug}`
                : "ქართული ასოები აქ არ მუშაობს — დაწერე ლათინურად, მაგ. french-pro"}
            </p>
          </div>
        ) : null}

        <div className="adm-2">
          <div className="field">
            <label>სახელი</label>
            <input name="title" defaultValue={c?.title ?? ""} required />
          </div>
          <div className="field">
            <label>კატეგორია</label>
            <select name="cat" defaultValue={c?.cat ?? "technique"}>
              {Object.entries(CATS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>აღწერა</label>
          <textarea name="descr" rows={3} defaultValue={c?.desc ?? ""} required />
        </div>

        <div className="adm-2">
          <div className="field">
            <label>ფასი</label>
            <input name="price" defaultValue={c?.price ?? ""} placeholder="590 ₾" required />
          </div>
          <div className="field">
            <label>ძველი ფასი (ფასდაკლებისთვის)</label>
            <input name="was" defaultValue={c?.was ?? ""} placeholder="750 ₾" />
          </div>
        </div>

        <div className="adm-2">
          <div className="field">
            <label>ფასი თინას გასწორებით</label>
            <input
              name="price_plus"
              defaultValue={c?.pricePlus ?? ""}
              placeholder={c ? coachPrice(c.price, null) ?? "" : "+50 ₾"}
            />
            <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
              ცარიელი = ძირითადი ფასი +{COACH_STEP} ₾. საიტზე ყოველთვის ძირითადი, დაბალი ფასი ჩანს;
              ორივე ყიდვის მომენტში გამოჩნდება.
            </p>
          </div>
        </div>

        <div className="adm-2">
          <div className="field">
            <label>ხანგრძლივობა</label>
            <input name="dur" defaultValue={c?.dur ?? ""} placeholder="მინ. 5 დღე · 22 გაკვეთილი" />
          </div>
          <div className="field">
            <label>ნიშანი</label>
            <select name="badge" defaultValue={c?.badge ?? ""}>
              {Object.entries(BADGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>ვიდეო</label>
          {/* Uploading fills the same field a pasted link would, so both end up
              as one address in courses.video and nothing downstream can tell. */}
          <input
            name="video"
            value={video ?? c?.video ?? ""}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://… (YouTube, Vimeo ან სხვა)"
          />
          <UploadButton
            endpoint="courseVideo"
            /* A fixed label was the bug: it overrode the component's own progress
               text, so a ten-minute upload showed the same words from beginning
               to end and looked like nothing was happening. */
            content={{
              button: ({ isUploading, uploadProgress }) =>
                isUploading ? `იტვირთება… ${uploadProgress ?? 0}%` : "ვიდეოს ატვირთვა",
              allowedContent: "ვიდეო, 1 GB-მდე",
            }}
            onUploadBegin={() => {
              setPct(0);
              setMsg({ text: "ვიდეო იტვირთება — არ დახუროთ გვერდი.", kind: "ok" });
            }}
            onUploadProgress={(p) => setPct(p)}
            onClientUploadComplete={(res) => {
              setPct(null);
              const url = res?.[0]?.ufsUrl;
              if (url) {
                setVideo(url);
                setMsg({ text: "ვიდეო აიტვირთა. დააჭირეთ შენახვას.", kind: "ok" });
              }
            }}
            onUploadError={(e: Error) => {
              setPct(null);
              setMsg({ text: "ვიდეო ვერ აიტვირთა: " + e.message, kind: "bad" });
            }}
          />
          {pct !== null ? (
            <div className="up-bar" aria-label="ატვირთვის მიმდინარეობა">
              <i style={{ width: pct + "%" }} />
              <b>{pct}%</b>
            </div>
          ) : null}
          <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
            ატვირთე ფაილი ან ჩასვი ბმული. შენახვისთვის დააჭირე „{isNew ? "დამატება" : "შენახვა"}“.
          </p>
          {/* Up to 1 GB goes through; what is scarce is the 2 GB the whole
              account has, so a handful of lessons fills it. */}
          <p className="hint warn" style={{ textAlign: "left", marginTop: 6 }}>
            ⚠ ატვირთვას რამდენიმე წუთი სჭირდება — გვერდი არ დახუროთ. მთელი საცავი 2 GB-ია,
            ანუ 3-4 ვიდეო. მეტისთვის ატვირთე Bunny-ზე და ბმული ჩასვი ამ ველში.
          </p>
        </div>

        <div className="field">
          <label>ფოტო</label>
          {(photo ?? c?.photo) ? (
            <div
              className="thumb"
              style={{
                height: 140,
                borderRadius: 12,
                marginBottom: 8,
                background: `url(${photo ?? c?.photo}) center/cover`,
              }}
            />
          ) : c?.img ? (
            <div
              className={"thumb " + c.img}
              style={{ height: 140, borderRadius: 12, marginBottom: 8 }}
            />
          ) : null}
          <UploadButton
            endpoint="avatar"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setPhoto(url);
            }}
            onUploadError={(e: Error) =>
              setMsg({ text: "ფოტო ვერ აიტვირთა: " + e.message, kind: "bad" })
            }
          />
        </div>

        <div className="adm-2">
          <div className="field">
            <label>რიგითობა (ცარიელი = ავტომატური)</label>
            <input name="sort" type="number" defaultValue={c?.order ?? ""} />
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <label className="auth-check">
              <input type="checkbox" name="featured" defaultChecked={!!c?.featured} /> მთავარ
              გვერდზე ჩვენება
            </label>
            <p className="hint" style={{ textAlign: "left", marginTop: 4 }}>
              მონიშნული კურსები რიგში პირველები დგება; დანარჩენი ადგილები ავტომატურად ივსება.
              „რიგითობა“ წყობას განსაზღვრავს — პატარა რიცხვი წინ.
            </p>
          </div>
        </div>

        {/* Said here as well as at the top of the tab. The form is taller than the
            screen, so a refusal printed above it was never seen and the button
            looked broken. */}
        {msg && msg.kind === "bad" ? (
          <p className="auth-msg bad" style={{ marginBottom: 12 }}>
            {msg.text}
          </p>
        ) : null}

        <div className="stu-give-btns">
          <button className="btn btn-plum" type="submit" disabled={busy}>
            {isNew ? "დამატება" : "შენახვა"}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setEditing(null);
              setAdding(false);
              setPhoto(null);
              setVideo(null);
            }}
          >
            გაუქმება
          </button>
        </div>

        {/* Deleting is kept apart from saving, and only where it can work: a
            built-in course would come straight back from the code. */}
        {!isNew && !c!.inCode ? (
          <div className="crs-danger">
            <b>კურსის სამუდამოდ წაშლა</b>
            <p>
              კურსი, მისი კომენტარები და ვიდეოები წაიშლება. დაბრუნება შეუძლებელია. თუ მხოლოდ
              საიტიდან მოხსნა გინდა, გამოიყენე „დამალვა“.
            </p>
            <button
              className="btn btn-danger"
              type="button"
              disabled={busy}
              onClick={() => destroy(c!)}
            >
              წაშლა
            </button>
          </div>
        ) : null}
        {!isNew && c!.inCode ? (
          <p className="hint" style={{ textAlign: "left", marginTop: 16 }}>
            ეს კურსი საიტის საწყის ნაკრებშია — წაშლა არ შეიძლება. „დამალვა“ საიტიდან მოხსნის.
          </p>
        ) : null}
      </form>
    );
  }

  const liveCount = courses.filter((c) => !c.hidden).length;
  const shown = courses.filter((c) =>
    only === "all" ? true : only === "live" ? !c.hidden : c.hidden
  );

  return (
    <>
      {msg ? <p className={"auth-msg" + (msg.kind ? " " + msg.kind : "")}>{msg.text}</p> : null}

      {adding ? (
        form(null)
      ) : (
        <button
          className="btn btn-new stu-add"
          style={{ marginBottom: 18 }}
          onClick={() => {
            setAdding(true);
            setEditing(null);
            setPhoto(null);
            setVideo(null);
          }}
        >
          + ახალი კურსის დამატება
        </button>
      )}

      {/* Which courses are on the site and which are put away. Hiding one used
          to take it out of this list as well, so it could never be brought
          back - the list showed only what was already visible. */}
      <div className="chips" style={{ marginBottom: 14 }}>
        <a className="chip" aria-pressed={only === "all"} onClick={() => setOnly("all")}>
          ყველა ({courses.length})
        </a>
        <a className="chip" aria-pressed={only === "live"} onClick={() => setOnly("live")}>
          საიტზე ({liveCount})
        </a>
        <a className="chip" aria-pressed={only === "hidden"} onClick={() => setOnly("hidden")}>
          დამალული ({courses.length - liveCount})
        </a>
      </div>

      {shown.length === 0 ? (
        <p className="lead">
          {only === "hidden" ? "დამალული კურსი არ არის." : "კურსი არ არის."}
        </p>
      ) : null}

      {shown.map((c) =>
        editing === c.id ? (
          <div key={c.id}>{form(c)}</div>
        ) : (
          <div className={"stu-card" + (c.hidden ? " crs-off" : "")} key={c.id}>
            <div className="stu-head">
              {/* Its own picture, whether that is an uploaded file or the class
                  the launch courses carry. A letter in a circle told her nothing
                  about which course she was looking at. */}
              <div
                className={"crs-thumb " + (c.photo ? "" : c.img ?? "")}
                style={c.photo ? { background: `url(${c.photo}) center/cover` } : undefined}
              >
                {c.photo || c.img ? "" : c.title.trim().charAt(0)}
              </div>
              <div className="stu-who">
                <b>{c.title}</b>
                <span>
                  {CATS[c.cat] ?? c.cat} · {c.price}
                  {c.dur ? " · " + c.dur : ""}
                </span>
                <span>
                  {c.featured ? "★ მთავარ გვერდზე" : "მთავარზე არ ჩანს"}
                  {c.inCode ? "" : " · დამატებულია პანელიდან"}
                </span>
                {/* The sales page shows a buyer the locked poster, so this is
                    where the upload itself can be checked. */}
                {c.video ? (
                  <a className="crs-vid" href={c.video} target="_blank" rel="noopener">
                    ▶ ვიდეოს შემოწმება
                  </a>
                ) : null}
                {/* Said outright rather than left to be inferred from a button. */}
                <span className={"crs-state " + (c.hidden ? "off" : "on")}>
                  {c.hidden ? "დამალულია — საიტზე არ ჩანს" : "საიტზე ჩანს"}
                </span>
              </div>
            </div>
            <div className="stu-give-btns" style={{ marginTop: 14 }}>
              <button
                className="btn btn-plum"
                onClick={() => {
                  setEditing(c.id);
                  setAdding(false);
                  setPhoto(null);
                  setVideo(null);
                }}
                disabled={busy}
              >
                რედაქტირება
              </button>
              {c.hidden ? (
                <button
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => save({ id: c.id, hidden: false })}
                >
                  საიტზე დაბრუნება
                </button>
              ) : (
                <button
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    if (!confirm(`დავმალოთ „${c.title}"? საიტზე აღარ გამოჩნდება, მაგრამ აქ დარჩება და ნებისმიერ დროს დააბრუნებ.`)) return;
                    save({ id: c.id, hidden: true });
                  }}
                >
                  დამალვა
                </button>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
}
