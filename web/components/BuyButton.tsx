"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* Buying requires an account. If nobody is signed in we remember which course was
   wanted and send them to register, then return them here rather than dropping
   them on a generic dashboard. */
export default function BuyButton({ courseId }: { courseId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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
    // Payments are not connected yet; say so rather than pretending the click worked.
    alert("გადახდის სისტემა ჯერ არ არის ჩართული. შესყიდვისთვის დაგვიკავშირდით.");
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
