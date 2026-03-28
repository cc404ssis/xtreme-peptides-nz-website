import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { verifyAdmin, escapeHtml } from './_auth.js';

function wrapEmailContent(title, content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050b14; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b14;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a1628; border-radius: 24px; overflow: hidden; border: 1px solid #1a3a5c; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 60px 40px 40px 40px; text-align: center;">
              <h1 style="color: #00d4ff; margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: bold; text-transform: uppercase;">XTREME PEPTIDES NZ</h1>
              <p style="color: #8b9cb5; margin: 15px 0 0 0; font-size: 14px; letter-spacing: 4px; font-weight: 500; text-transform: uppercase;">LABORATORY SUPPLY</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #00d4ff, transparent); opacity: 0.5;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 60px 60px 40px 60px; color: #a0aec0; font-size: 16px; line-height: 1.8;">
              ${content}
              <div style="margin-top: 60px; text-align: center;">
                <p style="color: #8b9cb5; margin: 0; font-size: 16px;">
                  Questions? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff; text-decoration: underline;">support@xtremepeptides.nz</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 60px; text-align: center; border-top: 1px solid rgba(26, 58, 92, 0.5);">
              <p style="color: #5a6a7d; margin: 0; font-size: 13px; line-height: 1.6;">
                Products sold for research purposes only. Not for human consumption.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdmin(req, res)) return;

  const { messageId, recipientEmail, subject, body } = req.body;

  if (!recipientEmail || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const now = new Date().toISOString();
    const htmlContent = wrapEmailContent(
      `Reply: ${escapeHtml(subject)}`,
      `<p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">${escapeHtml(body).replace(/\n/g, '<br>')}</p>
       <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a3a5c; color: #8b9cb5; font-size: 12px;">
         This is a reply to your message regarding: ${escapeHtml(subject)}
       </div>`
    );

    const { data, error } = await resend.emails.send({
      from: `XTREME PEPTIDES NZ <${fromEmail}>`,
      to: recipientEmail,
      subject: `Re: ${subject}`,
      html: htmlContent,
    });

    if (error) throw error;

    // Update message status in Supabase
    if (messageId) {
      await supabase
        .from('messages')
        .update({ status: 'replied', reply_body: body, replied_at: now })
        .eq('id', messageId);
    }

    // Log the reply
    await supabase.from('email_logs').insert({
      recipient_email: recipientEmail,
      subject: `Re: ${subject}`,
      body,
      type: 'admin_reply',
      sent_at: now,
      status: 'sent',
      resend_id: data?.id || null,
    });

    return res.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error('Reply error:', err);
    return res.status(500).json({ error: 'Failed to send reply.' });
  }
}
