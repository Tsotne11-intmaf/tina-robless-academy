"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* Editing the site on the site itself.

   The alternative - a form listing eighty text fields by key - would mean
   knowing that t.home.42 is the second line of the third card. Here the owner
   presses "რედაქტირება", clicks the sentence she wants to change, and types.
   Every spot that can be edited is already marked in the markup with the key it
   belongs to, so nothing has to be matched up by hand.

   Only an admin is ever given this component. */
export default function EditBar() {
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [dirty, setDirty] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // The wording each spot had when editing started, so "changed" means changed.
  const before = useRef(new Map<string, string>());

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-edit]")
    ).filter((el) => el.closest("[data-no-edit]") === null);

    if (!on) {
      nodes.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.classList.remove("ed-on", "ed-changed");
      });
      document.body.classList.remove("ed-mode");
      return;
    }

    document.body.classList.add("ed-mode");
    before.current.clear();

    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const key = el.dataset.edit!;
      const was = before.current.get(key) ?? "";
      const now = (el.innerText ?? "").trim();
      el.classList.toggle("ed-changed", now !== was);
      setDirty(document.querySelectorAll(".ed-changed").length);
    };

    nodes.forEach((el) => {
      const key = el.dataset.edit!;
      before.current.set(key, (el.innerText ?? "").trim());
      el.setAttribute("contenteditable", "plaintext-only");
      el.classList.add("ed-on");
      el.addEventListener("input", onInput);
    });

    return () => {
      nodes.forEach((el) => el.removeEventListener("input", onInput));
    };
  }, [on]);

  async function save() {
    const edits = Array.from(document.querySelectorAll<HTMLElement>(".ed-changed")).map(
      (el) => ({ key: el.dataset.edit!, value: (el.innerText ?? "").trim() })
    );
    if (!edits.length) {
      setOn(false);
      return;
    }
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
      return;
    }
    setMsg(`შენახულია (${body.saved}).`);
    setDirty(0);
    setOn(false);
    router.refresh();
    setTimeout(() => setMsg(null), 3000);
  }

  function cancel() {
    setOn(false);
    setDirty(0);
    setMsg(null);
    // Reload rather than undo by hand: the page then shows exactly what is saved.
    router.refresh();
  }

  return (
    <div className="ed-bar" data-no-edit>
      {msg ? <span className="ed-msg">{msg}</span> : null}
      {on ? (
        <>
          <span className="ed-count">
            {dirty ? `შეცვლილია: ${dirty}` : "დააჭირეთ ტექსტს და შეცვალეთ"}
          </span>
          <button className="btn btn-plum" onClick={save} disabled={busy}>
            შენახვა
          </button>
          <button className="btn btn-ghost" onClick={cancel} disabled={busy}>
            გაუქმება
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
