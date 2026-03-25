/**
 * Supabase Configuration
 * 
 * Production credentials for XTREME PEPTIDES NZ
 */

const SUPABASE_CONFIG = {
  // Your Supabase project URL
  URL: process.env.SUPABASE_URL || 'https://bnqnsqfimobqkfwziz.supabase.co',
  
  // Your Supabase anon key (safe for client-side)
  // Get this from: Supabase Dashboard > Project Settings > API > anon/public key
  ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  
  // Service role key - SERVER SIDE ONLY!
  // Get this from: Supabase Dashboard > Project Settings > API > service_role key
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here'
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}

if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
