import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("DEBUG: SUPABASE_URL =", SUPABASE_URL);
console.log("DEBUG: SUPABASE_ANON_KEY =", SUPABASE_ANON_KEY ? "Exists" : "Missing");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: Missing Supabase URL and/or Anon Key.");
  throw new Error("Supabase URL and Anon Key must be set in the environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, 
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== "undefined",
  },
});

console.log("Supabase client initialized successfully!");
console.log("Supabase URL:", SUPABASE_URL);
