import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const MAX = 6 * 1024 * 1024;

/* Uploads one picture chosen from the page itself.

   The editor replaces a picture by clicking it, so the file arrives from a
   plain input rather than through UploadThing's own button component. It goes
   to the same place either way; this route just carries it there, after
   checking that the person sending it is allowed to change the site. */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return NextResponse.json({ error: "წვდომა აკრძალულია" }, { status: 403 });

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "ფაილი არ მოვიდა" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "მხოლოდ სურათი" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "ფაილი 6 MB-ზე დიდია" }, { status: 400 });
  }

  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) return NextResponse.json({ error: "ატვირთვა არ არის გამართული" }, { status: 503 });

  const res = await new UTApi().uploadFiles(file);
  if (res.error || !res.data?.ufsUrl) {
    return NextResponse.json(
      { error: res.error?.message ?? "ატვირთვა ვერ მოხერხდა" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, url: res.data.ufsUrl });
}
