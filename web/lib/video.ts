import { createHash } from "crypto";

/* Turning what Tina pasted into something that plays.

   She should be able to paste whatever the video host handed her - the share
   link, the embed link, or the bare id - without knowing which of those it is.
   The host can also be swapped later without re-entering anything, because the
   stored value is read rather than assumed. Server-only: signing a Bunny link
   needs a key that must never reach the browser. */

export type Player =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string };

const BUNNY_LIBRARY = process.env.BUNNY_LIBRARY_ID ?? "";
const BUNNY_KEY = process.env.BUNNY_TOKEN_KEY ?? "";

/* Bunny ids are uuids. Anything shaped like one is taken to be a video in the
   configured library rather than a link that happens to look odd. */
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* Bunny's embed token: sha256 of the security key, the video and the moment the
   link stops working, in that order. Without a key configured the plain embed is
   returned - it still plays, it just is not tied to one viewer for one sitting. */
function bunny(libraryId: string, videoId: string, ttlSeconds = 4 * 60 * 60): string {
  const base = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
  if (!BUNNY_KEY) return base;
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = createHash("sha256")
    .update(BUNNY_KEY + videoId + expires)
    .digest("hex");
  return `${base}?token=${token}&expires=${expires}`;
}

export function playerFor(raw: string | null | undefined): Player | null {
  const v = (raw ?? "").trim();
  if (!v) return null;

  // The bare id, for a library set once in the environment.
  if (GUID.test(v)) {
    return BUNNY_LIBRARY ? { kind: "iframe", src: bunny(BUNNY_LIBRARY, v) } : null;
  }

  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;

  const host = u.hostname.toLowerCase();
  const path = u.pathname.replace(/\/+$/, "");

  // Bunny, however it was copied: /embed/<lib>/<guid> or /play/<lib>/<guid>.
  if (host === "iframe.mediadelivery.net") {
    const m = path.match(/^\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})$/i);
    return m ? { kind: "iframe", src: bunny(m[1], m[2]) } : null;
  }

  if (host === "player.vimeo.com") return { kind: "iframe", src: u.toString() };
  if (host === "vimeo.com" || host === "www.vimeo.com") {
    const m = path.match(/^\/(\d+)/);
    return m ? { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}` } : null;
  }

  /* YouTube plays, but nothing here can stop the link being passed on - the
     warning belongs in the admin panel, beside the field, not in this function. */
  if (host === "youtu.be") {
    const id = path.slice(1);
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  }
  if (host === "youtube.com" || host === "www.youtube.com") {
    const id = u.searchParams.get("v") ?? path.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  }

  // A file served straight from storage, including an HLS playlist.
  if (/\.(mp4|webm|m3u8)$/i.test(path)) return { kind: "file", src: u.toString() };

  return null;
}
