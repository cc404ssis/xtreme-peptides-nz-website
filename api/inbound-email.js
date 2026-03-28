import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Resend inbound webhook payload: { type, created_at, data: { from, to, subject, text, html } }
    const payload = req.body?.data || req.body;
    const { from, subject, text, html } = payload;

    if (!from) {
      return res.status(400).json({ error: 'Missing sender' });
    }

    // Parse "Display Name <email@example.com>" format
    const emailMatch = from.match(/<([^>]+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : from.trim();
    const senderName = emailMatch ? from.replace(/<[^>]+>/, '').trim().replace(/^"|"$/g, '') : null;

    // Use plain text body; strip quoted reply chains
    const rawText = text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');
    const cleanMessage = rawText
      .split(/\n--\s*\n|\nOn .+ wrote:|\n_{3,}|\n-{3,}/)[0]
      .trim() || '(no message body)';

    await supabase.from('messages').insert({
      customer_name: senderName || null,
      customer_email: senderEmail,
      subject: subject || 'No Subject',
      message: cleanMessage,
      status: 'unread',
      source: 'email',
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Inbound email webhook error:', err);
    return res.status(500).json({ error: 'Failed to process inbound email' });
  }
}
