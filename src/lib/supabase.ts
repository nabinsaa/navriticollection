import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhndinvvhzburnktdgmn.supabase.co';
const supabaseAnonKey = 'sb_publishable_CfBf5dQ7xcXwtiEPN2C_ZQ_1SLLvHrl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConnected = true;
