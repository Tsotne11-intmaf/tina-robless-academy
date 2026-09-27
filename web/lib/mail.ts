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
  unsubToken?: string;
}) {
  const unsub = opts.unsubToken
    ? `<p style="margin:14px 0 0;font-size:11px;line-height:1.7;color:#B9A7B0;">აღარ გსურთ ასეთი წერილები? <a href="${SITE}/unsubscribe?t=${opts.unsubToken}" style="color:#B9A7B0;">გამოწერის გაუქმება</a></p>`
    : "";
  const note = opts.note
    ? `<tr><td style="padding:20px 32px 0;"><p style="margin:0;padding:14px 16px;background:#FFF6F9;border-radius:10px;font-size:13px;line-height:1.7;color:#7A4A5F;">${opts.note}</p></td></tr>`
    : "";

  return `<div style="background:#FFF6F9;padding:32px 16px;font-family:'Noto Sans Georgian',Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:16px;">
<tr><td style="padding:30px 32px 0;text-align:center;">
<div style="font-size:21px;font-weight:600;color:#2B0F1F;">Tina <span style="color:#E5177A;">Robless</span></div>
<div style="font-size:12px;color:#7A4A5F;margin-top:4px;letter-spacing:.14em;text-transform:uppercase;">Nail Academy</div>
</td></tr>
<tr><td style="padding:26px 32px 0;">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.4;color:#2B0F1F;font-weight:600;">${opts.heading}</h1>
<p style="margin:0;font-size:15px;line-height:1.75;color:#5E5259;">${opts.lead}</p>
</td></tr>
<tr><td style="padding:24px 32px 0;text-align:center;">
<a href="${opts.ctaHref}" style="display:inline-block;background:#E5177A;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 34px;border-radius:999px;">${opts.ctaLabel}</a>
</td></tr>
${note}
<tr><td style="padding:24px 32px 30px;">
<p style="margin:0;padding-top:16px;border-top:1px solid #F3E3EB;font-size:12px;line-height:1.7;color:#9B8791;">Tina Robless Nail Academy · <a href="${SITE}" style="color:#9B8791;">tinarobless.com</a></p>
${unsub}
</td></tr>
</table>
</div>`;
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
