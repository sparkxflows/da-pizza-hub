import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nozecxnsafnptdvwklkg.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vemVjeG5zYWZucHRkdndrbGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDA5ODAsImV4cCI6MjEwODc3Njk4MH0.2DzSDTxu-IJbnj20OwsohRAHkDV2Ky5DshHfjvVCdiw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
