/**
 * Supabase Configuration
 * 
 * IMPORTANT: Replace these with your actual Supabase credentials
 * Get these from your Supabase project dashboard:
 * - Project Settings > API > Project URL
 * - Project Settings > API > anon/public key
 * - Project Settings > API > service_role key (for server-side only!)
 */

// Replace with your actual Supabase credentials
const SUPABASE_CONFIG = {
  // Your Supabase project URL
  // Example: 'https://abcdefghijklmnop.supabase.co'
  URL: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
  
  // Your Supabase anon key (safe for client-side)
  // Example: 'eyJhbGciOiJIUzI1NiIs...'
  ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  
  // Service role key - SERVER SIDE ONLY!
  // Only use this in API functions, never in client-side code
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}

if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
