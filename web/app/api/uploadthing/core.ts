import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from "@/lib/supabase/server";

const f = createUploadthing();

/* The whole reason UploadThing needs a server: the token stays in an env var here
   and never reaches the browser, and this gate decides who may upload before an
   upload URL is ever issued. Without it the token would have to ship inside the
   public page, where anyone reading the source could use it. */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Given a code, UploadThing answers 403 instead of a bare 500, so the client can
  // tell "you are not signed in" apart from "the server broke".
  if (!user) {
    throw new UploadThingError({
      code: "FORBIDDEN",
      message: "ავტორიზაცია საჭიროა",
    });
  }
  return { userId: user.id };
}

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(requireUser)
    .onUploadComplete(async ({ metadata, file }) => {
      /* Written straight onto the student's own profile row. The RLS update policy
         is "auth.uid() = id", so this can only ever touch their own record. */
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ avatar_url: file.ufsUrl })
        .eq("id", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  homework: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(requireUser)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
