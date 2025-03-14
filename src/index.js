import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// ✅ Load Environment Variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://vafwurwclfsusyymptsa.supabase.co/rest/v1";
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "Missing SUPABASE_URL";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "Missing SUPABASE_ANON_KEY";

console.log(" ENV Variables Loaded:");
console.log("- API BASE URL:", API_BASE_URL);
console.log("- Supabase URL:", SUPABASE_URL);
console.log("- Supabase Anon Key:", SUPABASE_ANON_KEY ? "Loaded " : "Missing ");


if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn("Warning: REACT_APP_API_BASE_URL is missing. Using default Supabase REST URL.");
}
if (!process.env.REACT_APP_SUPABASE_URL) {
  console.warn(" Warning: REACT_APP_SUPABASE_URL is missing!");
}
if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn(" Warning: REACT_APP_SUPABASE_ANON_KEY is missing!");
}


const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error(" Root element not found! Ensure your index.html contains <div id='root'></div>");
}
