import { createClient } from "@supabase/supabase-js";

// Ensure that the environment variables are correctly loaded
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate the environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Supabase URL and Anon Key are required but missing.");
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

// Initialize the Supabase client with configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Ensures the session is persisted across page reloads
    autoRefreshToken: true, // Automatically refreshes the session token before it expires
    detectSessionInUrl: true, // Detects session state from the URL (used for social login)
  },
});

console.log("Supabase client initialized successfully!");

export default supabase;
