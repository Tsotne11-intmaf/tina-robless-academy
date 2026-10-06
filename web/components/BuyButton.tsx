"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* Buying requires an account. If nobody is signed in we remember which course was
   wanted and send them to register, then return them here rather than dropping
   them on a generic dashboard. */

/* Where a buyer is sent while card payment is still being built. These are the
   accounts already linked in the footer, so they are ones that get answered. */
const REACH = [
  { label: "Instagram", href: "https://www.instagram.com/tinarobless_/" },
  { label: "Facebook", href: "https://www.facebook.com/tiniko.kuchukhidze" },
  { label: "TikTok", href: "https://www.tiktok.com/@tinarobless" },
];

/* The course is sold two ways. The site shows the cheaper one everywhere, so the
   choice belongs here, at the moment it is being made, rather than as a second
   price on every card. */
export default function BuyButton({
  courseId,
  price,
  pricePlus,
}: {
  courseId: string;
  price: string;
  pricePlus: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [asking, setAsking] = useState(false);
  const [plan, setPlan] = useState<"solo" | "coached">("solo");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, [supabase]);

  function buy() {
    if (signedIn === false) {
      try {
        sessionStorage.setItem("tr_buy", courseId);
      } catch {}
      router.push("/login?next=/kurs/" + courseId);
      return;
    }
    /* Payment is not connected yet. The alert that used to say "get in touch"
       closed again and left the buyer with nothing to act on; the ways to reach
       Tina stay on the screen instead, as links rather than as a sentence. */
    setAsking(true);
  }

  if (asking) {
    return (
      <div className="buy-reach">
        {pricePlus ? (
          <>
            <b>აირჩიეთ ვარიანტი</b>
            <div className="plans">
              {/* Name and price on one line. The sidebar this sits in is narrow,
                  so each plan is a row rather than a column - two columns were
                  being asked to fit a 320px rail and ran past its edge. */}
              <button
                type="button"
                className={"plan" + (plan === "solo" ? " on" : "")}
                aria-pressed={plan === "solo"}
                onClick={() => setPlan("solo")}
              >
                <span className="plan-top">
                  <span className="plan-name">დამოუკიდებლად</span>
                  <span className="plan-price">{price}</span>
                </span>
                <span className="plan-note">
                  ყველა გაკვეთილი და მასალა. დავალებებს თვითონ აკეთებთ.
                </span>
              </button>
              <button
                type="button"
                className={"plan" + (plan === "coached" ? " on" : "")}
                aria-pressed={plan === "coached"}
                onClick={() => setPlan("coached")}
              >
                <span className="plan-top">
                  <span className="plan-name">თინას გასწორებით</span>
                  <span className="plan-price">{pricePlus}</span>
                </span>
                <span className="plan-note">
                  იგივე, პლუს თინა ამოწმებს ნამუშევრებს და წერილობით გიბრუნებთ შენიშვნებს.
                </span>
              </button>
            </div>
          </>
        ) : (
          <b>გადახდა ჯერ ეწყობა</b>
        )}
        <p>
          {pricePlus
            ? "ბარათით გადახდა ჯერ ეწყობა — მოგვწერეთ არჩეული ვარიანტი და წვდომას გაგიხსნით."
            : "ამ კურსის შესაძენად მოგვწერეთ — გიპასუხებთ და წვდომას გაგიხსნით."}
        </p>
        <div className="buy-reach-links">
          {REACH.map((r) => (
            <a key={r.label} className="btn btn-plum" href={r.href} target="_blank" rel="noopener">
              {r.label}
            </a>
          ))}
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => setAsking(false)}>
          დახურვა
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-plum"
      style={{ justifyContent: "center", width: "100%" }}
      onClick={buy}
      disabled={signedIn === null}
    >
      კურსის ყიდვა
    </button>
  );
}
