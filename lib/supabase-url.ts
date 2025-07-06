import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getPublicImageUrl(path: string) {
  const { data } = supabase.storage.from('mtt-images').getPublicUrl(path);
  return data.publicUrl;
}
