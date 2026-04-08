import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase
      .from('products')
      .select('name')
      .eq('is_active', false);

    if (error) throw error;

    const hiddenNames = (data || []).map(row => row.name.toLowerCase());
    return res.status(200).json({ hiddenNames });
  } catch (err) {
    console.error('Error fetching hidden products:', err);
    return res.status(200).json({ hiddenNames: [] });
  }
}
