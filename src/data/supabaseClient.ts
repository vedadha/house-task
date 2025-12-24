import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

let client: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!client) {
    client = createClient(`https://${projectId}.supabase.co`, publicAnonKey);
  }
  return client;
};
