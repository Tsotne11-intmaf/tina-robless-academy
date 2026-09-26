"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LABELS: Record<string, string> = { en: "EN", ka: "ქარ", ru: "RU", el: "EL" };

export default function LangSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pick(lang: string) {
    if (lang === current || busy) return;
    setBusy(true);
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang }),
    });
    // refresh() re-renders the server components with the new cookie
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="lang" aria-label="ენა">
      {Object.keys(LABELS).map((l) => (
        <button
          key={l}
          type="button"
          data-lang={l}
          aria-pressed={l === current}
          onClick={() => pick(l)}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
