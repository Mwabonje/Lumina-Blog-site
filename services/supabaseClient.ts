import { createClient } from '@supabase/supabase-js';

// Credentials are injected via vite.config.ts define
const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

if (!envUrl || !envKey) {
  console.error('Supabase URL or Key is strictly missing. Please configure your environment.');
}

// Ensure we have strings to prevent runtime crashes, though vite config ensures defaults.
const supabaseUrl = envUrl || '';
const supabaseKey = envKey || '';

export const supabase = createClient(supabaseUrl, supabaseKey);