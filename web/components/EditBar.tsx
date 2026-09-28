"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* Editing the site on the site itself.

   The alternative - a form listing 157 text fields and 25 picture slots by key -
   would mean knowing that t.home.42 is the second line of the third card. Here
   the owner presses "რედაქტირება", clicks the sentence she wants to change and
   types, or presses a picture and chooses a new one. Every spot is already
   marked in the markup with the key it belongs to, so nothing is matched up by
   hand.

   Only an admin is ever given this component, and the routes behind it check
   again on every write. */
export default function EditBar() {
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [dirty, setDirty] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // What each spot said when editing started, so "changed" means changed.
  const before = useRef(new Map<string, string>());
  const fileInput = useRef<HTMLInputElement | null>(null);
  const pendingSlot = useRef<string | null>(null);

  const save = useCallback(
    async (edits: { key: string; value: string }[], note: string) => {
      if (!edits.length) return true;
      setBusy(true);
      setMsg("ინახება…");
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const body = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) {
        setMsg("ვერ შეინახა: " + (body.error ?? r.status));
        return false;
      }
      setMsg(note);
      router.refresh();
      setTimeout(() => setMsg(null), 3000);
      return true;
    },
    [router]
  );

  /* Pictures save one at a time, as soon as one is chosen. Text is batched
     because a sentence is edited letter by letter and there is nothing to save
     until she stops; a picture is a single decision, already made. */
  const onFile = useCallback(
    async (file: File) => {
      const slot = pendingSlot.current;
      if (!slot) return;
      setBusy(true);
      setMsg("ფოტო იტვირთება…");
      try {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/admin/image", { method: "POST", body: fd });
        const out = await up.json().catch(() => ({}));
        if (!up.ok || !out.url) {
          setBusy(false);
          setMsg("ფოტო ვერ აიტვირთა: " + (out.error ?? up.status));
          return;
        }
        await save([{ key: "img." + slot, value: out.url }], "ფოტო შეიცვალა.");
      } finally {
        setBusy(false);
        pendingSlot.current = null;
        if (fileInput.current) fileInput.current.value = "";
      }
    },
    [save]
  );

  const listAction = useCallback(
    async (list: string, action: "add" | "remove", id?: string, at?: "before" | "after") => {
      setBusy(true);
      setMsg(action === "add" ? "ემატება…" : "იშლება…");
      const r = await fetch("/api/admin/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list, action, id, at }),
      });
      const body = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) {
        setMsg("ვერ მოხერხდა: " + (body.error ?? r.status));
        return;
      }
      setMsg(action === "add" ? "ჩანაწერი დაემატა." : "ჩანაწერი წაიშალა.");
      router.refresh();
      setTimeout(() => setMsg(null), 3000);
    },
    [router]
  );

  useEffect(() => {
    const texts = Array.from(document.querySelectorAll<HTMLElement>("[data-edit]")).filter(
      (el) => el.closest("[data-no-edit]") === null
    );
    const pictures = Array.from(document.querySelectorAll<HTMLElement>("[data-img]"));
    const lists = Array.from(document.querySelectorAll<HTMLElement>("[data-list]"));
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-list-item]"));

    if (!on) {
      texts.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.classList.remove("ed-on", "ed-changed");
      });
      pictures.forEach((el) => {
        el.classList.remove("ed-pic");
        el.querySelector(".ed-pic-btn")?.remove();
      });
      lists.forEach((el) => el.querySelector(".ed-add-btn")?.remove());
      items.forEach((el) => el.querySelector(".ed-item-bar")?.remove());
      document.body.classList.remove("ed-mode");
      return;
    }

    document.body.classList.add("ed-mode");
    before.current.clear();

    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const was = before.current.get(el.dataset.edit!) ?? "";
      el.classList.toggle("ed-changed", (el.innerText ?? "").trim() !== was);
      setDirty(document.querySelectorAll(".ed-changed").length);
    };

    texts.forEach((el) => {
      before.current.set(el.dataset.edit!, (el.innerText ?? "").trim());
      el.setAttribute("contenteditable", "plaintext-only");
      el.classList.add("ed-on");
      el.addEventListener("input", onInput);
    });

    const onPick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.currentTarget as HTMLElement;
      pendingSlot.current = btn.dataset.slot ?? null;
      fileInput.current?.click();
    };

    pictures.forEach((el) => {
      el.classList.add("ed-pic");
      if (el.querySelector(".ed-pic-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ed-pic-btn";
      btn.textContent = "ფოტოს შეცვლა";
      btn.dataset.slot = el.dataset.img!;
      btn.addEventListener("click", onPick);
      el.appendChild(btn);
    });

    /* A list gets one button to grow it, and each entry she added gets one to
       take it away. Entries that shipped in the code have no delete button:
       they are part of the page, not of her list. */
    const onAdd = (e: Event) => {
      e.preventDefault();
      listAction((e.currentTarget as HTMLElement).dataset.list!, "add");
    };
    const onDel = (e: Event) => {
      e.preventDefault();
      const btn = e.currentTarget as HTMLElement;
      if (!confirm("წავშალოთ ეს ჩანაწერი?")) return;
      listAction(btn.dataset.list!, "remove", btn.dataset.id!);
    };
    /* A story is not written in the order it happened. Appending to the end was
       the only way to grow a list, so remembering something from ten years ago
       meant retyping every entry below it. */
    const onIns = (e: Event) => {
      e.preventDefault();
      const btn = e.currentTarget as HTMLElement;
      listAction(btn.dataset.list!, "add", btn.dataset.id!, btn.dataset.at as "before" | "after");
    };

    lists.forEach((el) => {
      if (el.querySelector(".ed-add-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ed-add-btn";
      btn.textContent = "+ ჩანაწერის დამატება";
      btn.dataset.list = el.dataset.list!;
      btn.addEventListener("click", onAdd);
      el.appendChild(btn);
    });

    items.forEach((el) => {
      if (el.querySelector(".ed-item-bar")) return;
      const list = el.closest<HTMLElement>("[data-list]")?.dataset.list;
      if (!list) return;
      const id = el.dataset.listItem!;
      const bar = document.createElement("div");
      bar.className = "ed-item-bar";

      ([
        ["before", "＋ ზემოთ", "ჩანაწერის ჩამატება ზემოთ"],
        ["after", "＋ ქვემოთ", "ჩანაწერის ჩამატება ქვემოთ"],
      ] as const).forEach(([at, label, title]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ed-ins-btn";
        b.textContent = label;
        b.title = title;
        b.dataset.list = list;
        b.dataset.id = id;
        b.dataset.at = at;
        b.addEventListener("click", onIns);
        bar.appendChild(b);
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "ed-del-btn";
      del.textContent = "✕";
      del.title = "ჩანაწერის წაშლა";
      del.dataset.list = list;
      del.dataset.id = id;
      del.addEventListener("click", onDel);
      bar.appendChild(del);

      el.appendChild(bar);
    });

    return () => {
      texts.forEach((el) => el.removeEventListener("input", onInput));
      pictures.forEach((el) => el.querySelector(".ed-pic-btn")?.remove());
      lists.forEach((el) => el.querySelector(".ed-add-btn")?.remove());
      items.forEach((el) => el.querySelector(".ed-item-bar")?.remove());
    };
  }, [on, listAction]);

  async function saveText() {
    const edits = Array.from(document.querySelectorAll<HTMLElement>(".ed-changed")).map(
      (el) => ({ key: el.dataset.edit!, value: (el.innerText ?? "").trim() })
    );
    if (!edits.length) {
      setOn(false);
      return;
    }
    if (await save(edits, `შენახულია (${edits.length}).`)) {
      setDirty(0);
      setOn(false);
    }
  }

  function cancel() {
    setOn(false);
    setDirty(0);
    setMsg(null);
    // Reload rather than undo by hand, so the page shows exactly what is saved.
    router.refresh();
  }

  return (
    <div className="ed-bar" data-no-edit>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      {msg ? <span className="ed-msg">{msg}</span> : null}
      {on ? (
        <>
          <span className="ed-count">
            {dirty ? `შეცვლილია: ${dirty}` : "დააჭირეთ ტექსტს ან ფოტოს"}
          </span>
          <button className="btn btn-plum" onClick={saveText} disabled={busy}>
            შენახვა
          </button>
          <button className="btn btn-ghost" onClick={cancel} disabled={busy}>
            დახურვა
          </button>
        </>
      ) : (
        <button className="btn btn-plum" onClick={() => setOn(true)}>
          ✎ რედაქტირება
        </button>
      )}
    </div>
  );
}
