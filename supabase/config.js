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
  ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucW5zc2ZxZmltb2Jxa2Z3eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTcyMzQsImV4cCI6MjA5ODgzMzIzNH0.cdoC6bPSTq_-VshuPxkMhLOr2F6Dh8q9MWbVhim8MwQ',
  
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
