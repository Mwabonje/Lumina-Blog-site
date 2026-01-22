import { createClient } from '@supabase/supabase-js';

// Fallback values to ensure the app works even if environment variable injection fails
const FALLBACK_URL = 'https://jvniieomnaeiibrnvidz.supabase.co';
const FALLBACK_KEY = 'sb_publishable_EyalFOiT9Y9ozrdbzfBP3Q_Rt5WBbMY';

// Vite replaces process.env.VAR with the string value defined in vite.config.ts.
// We use the fallback constants to guarantee a valid string is always present.
const supabaseUrl = process.env.SUPABASE_URL || FALLBACK_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is strictly missing. Please configure your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);