import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

  const { name, email, subject, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const now = new Date().toISOString();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Save to messages table
    await supabase.from('messages').insert({
      customer_name: name || null,
      customer_email: email,
      subject: subject || 'Contact Form Submission',
      message,
      status: 'unread',
      source: 'contact_form',
      created_at: now,
    });

    // Send notification to support
    await resend.emails.send({
      from: `XTREME PEPTIDES NZ <${fromEmail}>`,
      to: 'support@xtremepeptides.nz',
      subject: `New Contact Form Message: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>New Message from ${name || email}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    // Send confirmation to customer
    const thankYouContent = `
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Message Received</h2>
      </div>
      <p style="margin-bottom: 20px;">
        Hi ${name || 'there'},<br><br>
        Thank you for reaching out to XTREME PEPTIDES NZ. We have received your message regarding "<strong>${subject || 'Contact Form Submission'}</strong>" and our team will get back to you as soon as possible.
      </p>
      <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Your Message:</p>
        <p style="color: #e0e6ed; margin: 0; font-style: italic;">"${message}"</p>
      </div>
      <p>Best regards,<br>The XTREME PEPTIDES NZ Team</p>
    `;

    const { data: confirmData } = await resend.emails.send({
      from: `XTREME PEPTIDES NZ <${fromEmail}>`,
      to: email,
      subject: `Thank you for your message - XTREME PEPTIDES NZ`,
      html: wrapEmailContent('Thank you for your message', thankYouContent),
    });

    await supabase.from('email_logs').insert({
      recipient_email: email,
      subject: `Thank you for your message - XTREME PEPTIDES NZ`,
      body: `Thank you for reaching out regarding: ${subject || 'Contact Form Submission'}`,
      type: 'contact_confirmation',
      sent_at: now,
      status: 'sent',
      resend_id: confirmData?.id || null,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Failed to process contact form.' });
  }
}
