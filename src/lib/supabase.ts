import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';

if (supabaseUrl === 'https://dummy.supabase.co') {
  console.warn('Supabase URL or Service Role Key is missing. Check your environment variables.');
}

// We use the service role key for the backend to bypass RLS and perform operations securely
// IMPORTANT: Never expose this client to the browser/frontend. Use only in Server Components, API routes, or Server Actions.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
