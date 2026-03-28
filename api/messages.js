import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req, res)) return;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.url.split('/').pop();
    if (!id) {
      return res.status(400).json({ error: 'Message ID required' });
    }
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err) {
      console.error('Error deleting message:', err);
      return res.status(500).json({ error: 'Failed to delete message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
