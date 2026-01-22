import { createClient } from '@supabase/supabase-js';

// Strictly use environment variables. 
// If these are missing, the app will log a warning and use placeholders to prevent startup crashes.
const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

if (!envUrl || !envKey) {
  console.warn('Supabase URL or Key is missing. Please configure your .env file.');
}

// Fallback to a valid URL format to prevent "supabaseUrl is required" error.
// Data fetching will fail gracefully with network errors instead of crashing the app.
const supabaseUrl = envUrl && envUrl.length > 0 ? envUrl : 'https://placeholder.supabase.co';
const supabaseKey = envKey && envKey.length > 0 ? envKey : 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);