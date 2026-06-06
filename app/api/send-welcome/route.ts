import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const firstName = name ? name.split(' ')[0] : 'there';

  const { error } = await resend.emails.send({
    from: 'The Common Room <contact@lifework-lab.com>',
    to: email,
    subject: 'Welcome to The Common Room',
    html: buildEmailHtml(firstName),
  });

  if (error) {
    console.error('[send-welcome] Resend error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildEmailHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to The Common Room</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F6F3;font-family:'Calibri','Segoe UI',Arial,sans-serif;color:#2B2B2B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F6F3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#465362;border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">The Common Room</p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:normal;color:#ffffff;line-height:1.3;">Welcome, ${firstName}.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2B2B2B;">
                We&rsquo;re glad you&rsquo;re here. The Common Room is a space for reflection, clarity, and purpose &mdash; and you&rsquo;ve just taken the first step.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2B2B2B;">
                Inside the app, you&rsquo;ll explore the ADOPT themes &mdash; 39 ideas across five areas of life &mdash; and choose the ones that feel most alive for you right now. From there, you&rsquo;ll receive personalised Points of Reflection, and have space to write and keep your own notes.
              </p>
              <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#2B2B2B;">
                There&rsquo;s no right way to use it. Take your time.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://common-room-website.vercel.app/sign-in"
                       style="display:inline-block;min-height:52px;line-height:52px;padding:0 32px;background-color:#465362;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
                      Go to The Common Room
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="background-color:#EAC67A;height:4px;border-radius:0;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F6F6F3;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#999999;line-height:1.5;">
                The Common Room &mdash; a programme by Lifework Lab
              </p>
              <p style="margin:0;font-size:13px;color:#999999;">
                <a href="mailto:contact@lifework-lab.com" style="color:#999999;text-decoration:underline;">contact@lifework-lab.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
