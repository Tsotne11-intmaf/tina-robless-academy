import { ImageResponse } from "next/og";

/* The card a link turns into when it is pasted into a chat.

   Without one, the messenger has nothing to show and falls back to a blank dark
   panel - which is what the site's own link looked like. Drawn here rather than
   kept as a file so it cannot drift away from the brand, and written in Latin
   because this image is rendered with a built-in font that has no Georgian
   letters; the site's own name is Latin anyway. */

export const alt = "Tina Robless Nail Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF5F9 0%, #FFE1EF 55%, #FFD0E4 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 172,
            height: 172,
            borderRadius: 999,
            background: "#E5177A",
            color: "#fff",
            fontSize: 108,
            fontWeight: 700,
            marginBottom: 44,
          }}
        >
          R
        </div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 700, color: "#2B0F1F" }}>
          Tina Robless
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#B80F5F",
            letterSpacing: 8,
            marginTop: 14,
          }}
        >
          NAIL ACADEMY
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 52,
            fontSize: 28,
            color: "#8A5A75",
          }}
        >
          tinarobless.com
        </div>
      </div>
    ),
    size
  );
}
