import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.error(" ERROR: Supabase URL and Anon Key are required but missing.");
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}


const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, 
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== "undefined",
  },
});


console.log(" Supabase client initialized successfully!");
console.log(" Supabase URL:", supabaseUrl);

export default supabase;
