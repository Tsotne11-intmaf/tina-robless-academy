"use client";

import { useEffect, useState } from "react";

/* The phone menu's switch.

   The button and the panel it opens both shipped with the design, but nothing
   ever connected them: pressing ☰ did nothing, and since the links are hidden at
   this width there was no way to reach them at all.

   The class goes on <body> because that is what the stylesheet's rules hang off.
   Nothing closes the menu on navigation - every link here is a plain href, so
   the page reloads and the class goes with it. */
export default function MenuButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // A press anywhere outside the header is a press on the page behind it.
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("header")) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Leaving the class behind would lock the menu open on the next page.
  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  return (
    <button
      className="menu-btn"
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      {open ? "✕" : "☰"}
    </button>
  );
}
