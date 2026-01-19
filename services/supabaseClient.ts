import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvniieomnaeiibrnvidz.supabase.co';
const supabaseKey = 'sb_publishable_EyalFOiT9Y9ozrdbzfBP3Q_Rt5WBbMY';

export const supabase = createClient(supabaseUrl, supabaseKey);