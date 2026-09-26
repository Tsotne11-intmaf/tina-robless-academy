"use client";

import { useRef } from "react";

/* Ports the legacy card slider: the prev/next circles and fade edges, reusing the
   .slider / .sl-btn / .sl-fade classes already in the stylesheet.

   It wraps the existing .cards row rather than rendering its own, so the original
   class names and grid rules still apply.

   The legacy version cloned every card to fake an infinite loop and then silently
   jumped scrollLeft to keep the illusion. That is dropped: cloned cards meant
   duplicate links and headings in the DOM, which hurts screen readers and search
   engines. Scrolling stops at the ends instead. */
export default function CardSlider({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  function scrollBy(dir: number) {
    const track = wrap.current?.querySelector<HTMLElement>(".cards");
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    // one card plus the grid gap
    const step = first ? first.getBoundingClientRect().width + 22 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="slider" ref={wrap}>
      {children}
      <div className="sl-fade l" />
      <div className="sl-fade r" />
      <button type="button" className="sl-btn prev" aria-label="წინა" onClick={() => scrollBy(-1)}>
        &#8249;
      </button>
      <button type="button" className="sl-btn next" aria-label="შემდეგი" onClick={() => scrollBy(1)}>
        &#8250;
      </button>
    </div>
  );
}
