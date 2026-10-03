"use client";

import { useState } from "react";

export type Shot = { url: string; name: string };

/* The course's pictures and its video, in one panel.

   The video stays the main thing; the work students have shown sits underneath
   as thumbnails. Picking one puts it in the panel, full size, with whose work it
   is written on it - a wall of pictures with no names said nothing about who
   had done them. Closing it brings the video back. */
export default function CourseMedia({
  photo,
  img,
  locked,
  lockedTitle,
  lockedNote,
  player,
  title,
  shots,
}: {
  photo: string | null;
  img: string | null;
  /* True when the course has a video the reader has not bought. */
  locked: boolean;
  lockedTitle: string;
  lockedNote: string;
  player: { kind: "iframe" | "file"; src: string } | null;
  title: string;
  shots: Shot[];
}) {
  // null means the main panel is showing the video, a number picks a picture.
  const [open, setOpen] = useState<number | null>(null);
  const shown = open === null ? null : shots[open];

  return (
    <div className="media">
      <div className="media-main">
        {shown ? (
          <div className="media-shot">
            {/* plain img: the file is on UploadThing's CDN, outside next/image config */}
            <img src={shown.url} alt={shown.name} />
            <button
              type="button"
              className="media-close"
              title="დახურვა"
              onClick={() => setOpen(null)}
            >
              ✕
            </button>
            <span className="media-by">{shown.name}</span>
          </div>
        ) : player ? (
          <div className="video">
            {player.kind === "iframe" ? (
              <iframe
                src={player.src}
                title={title}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={player.src}
                poster={photo ?? undefined}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
              />
            )}
          </div>
        ) : (
          <div
            className={"thumb " + (photo ? "" : img || "")}
            style={{
              aspectRatio: "16/9",
              borderRadius: "var(--r-card)",
              ...(photo ? { background: `url(${photo}) center/cover` } : {}),
            }}
          >
            {locked ? (
              <div className="locked">
                <span className="locked-play">▶</span>
                <b>{lockedTitle}</b>
                <span className="locked-note">🔒 {lockedNote}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {shots.length ? (
        <div className="media-strip">
          {/* Back to the video, in the same row as everything else it sits beside. */}
          <button
            type="button"
            className={"media-thumb vid" + (open === null ? " on" : "")}
            style={photo ? { backgroundImage: `url(${photo})` } : undefined}
            onClick={() => setOpen(null)}
            title="ვიდეო"
          >
            <span>▶</span>
          </button>
          {shots.map((s, i) => (
            <button
              key={s.url}
              type="button"
              className={"media-thumb" + (open === i ? " on" : "")}
              style={{ backgroundImage: `url(${s.url})` }}
              onClick={() => setOpen(i)}
              title={s.name}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
