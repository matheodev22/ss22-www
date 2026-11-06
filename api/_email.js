export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) return { sent: false, reason: 'email_not_configured' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend email error:', detail);
    return { sent: false, reason: 'provider_error' };
  }
  return { sent: true };
}

export function emailLayout(content) {
  return `<div style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:auto;padding:28px"><div style="font-size:24px;font-weight:900;letter-spacing:3px">SS22.WWW</div><hr style="border:0;border-top:1px solid #ddd;margin:20px 0">${content}<p style="margin-top:32px;font-size:12px;color:#777">SS22.WWW · Streetwear</p></div>`;
}
