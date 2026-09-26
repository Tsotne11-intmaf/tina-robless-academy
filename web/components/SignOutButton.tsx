"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  return (
    <a
      onClick={async () => {
        await supabase.auth.signOut();
        // refresh() so the server components re-render without the session
        router.push("/");
        router.refresh();
      }}
      style={{ cursor: "pointer" }}
    >
      გასვლა
    </a>
  );
}
