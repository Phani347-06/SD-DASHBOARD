import { createClient } from '@supabase/supabase-js';

// Retrieve variables from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard User-Context Client (Subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Institutional Admin Client (Bypasses RLS - FOR SERVER SIDE ONLY)
// Initialized only if key is available (prevents module evaluation error on client side)
export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null as any; 
