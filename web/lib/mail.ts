/* Outgoing email that is not part of authentication.

   Supabase's SMTP settings only cover auth mail - confirmation, recovery, email
   change. Reminders and announcements are ours to send, so they go through the
   Resend API directly with the same key, from the same verified domain, which
   keeps the DKIM signature and the sender identity consistent across everything
   a student receives. */

const ENDPOINT = "https://api.resend.com/emails/batch";
const FROM = "Tina Robless Nail Academy <noreply@tinarobless.com>";
const SITE = "https://www.tinarobless.com";

export type Message = { to: string; subject: string; html: string };

/* The shell every message shares, so a reminder and an announcement look like
   they came from the same academy. Inline styles and a table, because email
   clients discard stylesheets. */
export function layout(opts: {
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
  note?: string;
  preview?: string;
  unsubToken?: string;
}) {
  /* The line the inbox shows next to the subject before anything is opened.
     Left to itself a client grabs whatever text comes first, which here is the
     wordmark, so every message would preview as "Tina Robless Nail Academy". */
  const preview = esc(opts.preview ?? stripTags(opts.lead)).slice(0, 140);

  const unsub = opts.unsubToken
    ? `<p style="margin:10px 0 0;font-size:11px;line-height:1.7;color:#BCA8B2;">აღარ გსურთ ასეთი წერილები? <a href="${SITE}/unsubscribe?t=${opts.unsubToken}" style="color:#BCA8B2;text-decoration:underline;">გამოწერის გაუქმება</a></p>`
    : "";

  const note = opts.note
    ? `<tr><td style="padding:22px 36px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFF6F9;border-radius:12px;">
<tr><td style="padding:15px 18px;font-size:13.5px;line-height:1.75;color:#7A4A5F;">${opts.note}</td></tr>
</table></td></tr>`
    : "";

  return `<div style="margin:0;padding:0;background:#FBEFF4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preview}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FBEFF4;">
<tr><td align="center" style="padding:34px 14px;font-family:'Noto Sans Georgian','Segoe UI',Arial,Helvetica,sans-serif;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;background:#FFFFFF;border-radius:20px;border:1px solid #F4DDE7;">

<tr><td style="padding:34px 36px 0;text-align:center;">
<div style="font-size:23px;font-weight:600;letter-spacing:.01em;color:#2B0F1F;">Tina <span style="color:#E5177A;">Robless</span></div>
<div style="font-size:11px;color:#A07E8E;margin-top:5px;letter-spacing:.2em;text-transform:uppercase;">Nail Academy</div>
<div style="width:46px;height:3px;background:#E5177A;border-radius:3px;margin:18px auto 0;"></div>
</td></tr>

<tr><td style="padding:24px 36px 0;">
<h1 style="margin:0 0 14px;font-size:23px;line-height:1.4;color:#2B0F1F;font-weight:600;">${opts.heading}</h1>
<p style="margin:0;font-size:15.5px;line-height:1.8;color:#5E5259;">${opts.lead}</p>
</td></tr>

<tr><td style="padding:26px 36px 0;text-align:center;">
<a href="${opts.ctaHref}" style="display:inline-block;background:#E5177A;color:#FFFFFF;text-decoration:none;font-size:15.5px;font-weight:600;padding:15px 40px;border-radius:999px;">${opts.ctaLabel}</a>
</td></tr>
${note}
<tr><td style="padding:28px 36px 32px;">
<div style="height:1px;background:#F4DDE7;margin-bottom:16px;"></div>
<p style="margin:0;font-size:12px;line-height:1.8;color:#A07E8E;">
Tina Robless Nail Academy · თბილისი<br>
<a href="${SITE}" style="color:#A07E8E;text-decoration:underline;">tinarobless.com</a>
</p>
${unsub}
</td></tr>

</table>
</td></tr>
</table>
</div>`;
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
function esc(text: string) {
  return text.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}
function stripTags(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/* Resend accepts up to 100 messages per batch call, so a send of any realistic
   size is a handful of requests rather than one per student. */
export async function sendBatch(
  messages: Message[]
): Promise<{ sent: number; error?: string }> {
  if (!messages.length) return { sent: 0 };

  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, error: "RESEND_API_KEY არ არის დაყენებული" };

  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        chunk.map((m) => ({ from: FROM, to: [m.to], subject: m.subject, html: m.html }))
      ),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    sent += chunk.length;
  }
  return { sent };
}
