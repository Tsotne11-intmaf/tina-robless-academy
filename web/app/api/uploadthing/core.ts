import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from "@/lib/supabase/server";

const f = createUploadthing();

/* This is the whole reason UploadThing needs a server. The token stays in an env
   var here and is never sent to the browser; the middleware below decides who is
   allowed to upload before UploadThing ever issues an upload URL.
   Without this step the token would have to ship in the page, and anyone reading
   the source could upload to the account. */
export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new UploadThingError("ავტორიზაცია საჭიროა");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Write the resulting URL straight onto the student's own profile row.
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ avatar_url: file.ufsUrl })
        .eq("id", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Homework photos: same auth gate, larger allowance, several files at once.
  homework: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new UploadThingError("ავტორიზაცია საჭიროა");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
