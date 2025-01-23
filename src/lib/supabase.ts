import { createClient } from "@supabase/supabase-js";

// The URL of your Supabase project
const supabaseUrl = "https://veeusjmwzcjnbmrhunki.supabase.co";

// Replace with your Supabase anon/public key directly
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZXVzam13emNqbmJtcmh1bmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MDcyMDQsImV4cCI6MjA1MzE4MzIwNH0.f-QK2JsXkIIOtxV3L3NNnk1F346my69Ixh2mqca3woE";

if (!supabaseAnonKey) {
  console.error("Supabase key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
