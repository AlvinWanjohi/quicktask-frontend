import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css"; 


console.log(" ENV Variables:", process.env);
console.log(" API BASE URL:", process.env.REACT_APP_API_BASE_URL || "Not Defined");


if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn(" Warning: REACT_APP_API_BASE_URL is missing. Make sure you have a .env file in the root directory.");
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
