import { createClient, SupabaseClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey || !supabaseUrl) {
  throw new Error(
    " Missing supabase environment varibles ,Please config your Next_PUBLIC_SUPABSE_URL OR SUPABSE_SERVICE_ROLE_KEY",
  );
}
// 服务端使用 Service Role Key（绕过 RLS，用于后端任务）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
    },
  },
);
