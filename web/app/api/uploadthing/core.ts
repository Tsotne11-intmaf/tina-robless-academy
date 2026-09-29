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

/* Course videos are big and go straight to the paid storage, so being signed in
   is not enough - any student is signed in. Only the owner may send one. */
async function requireAdmin() {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    throw new UploadThingError({ code: "FORBIDDEN", message: "წვდომა აკრძალულია" });
  }
  return { userId };
}

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(requireUser)
    .onUploadComplete(async ({ metadata, file }) => {
      /* No database write here, deliberately.

         This hook is called by UploadThing's servers, not by the student's browser,
         so there are no session cookies to build a Supabase client from. The write
         that used to live here ran as the anonymous role against an "auth.uid() = id"
         policy, matched no rows, and reported no error - the avatar appeared to save
         and was gone on the next load. The browser posts the URL to /api/avatar
         instead, where the session exists and RLS applies as usual. */
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  homework: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(requireUser)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Saved the same way as the course photo: the URL goes back into the course
  // form and is written with the rest of it, from the admin's own browser.
  courseVideo: f({ video: { maxFileSize: "1GB", maxFileCount: 1 } })
    .middleware(requireAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
