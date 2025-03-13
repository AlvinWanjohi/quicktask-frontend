import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, logoutUser } from "../services/authService";

// Create auth context
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for redirection

  // Function to get token from localStorage
  const getAuthToken = () => localStorage.getItem("token");

  // On mount, check if the user is already logged in (using localStorage)
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = getAuthToken();
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        console.log("User restored from localStorage:", JSON.parse(storedUser));
      } else {
        setUser(null); // Ensure no user is set if no valid token
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Login function (checks email & password, returns JWT)
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.user && response.access_token) {
        localStorage.setItem("token", response.access_token); // Store JWT token
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        console.log("User logged in:", response.user);
        navigate("/"); // Redirect after login
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: "Login failed. Try again." };
    }
  };

  // Logout function: clears stored credentials and updates state
  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      console.log("User logged out");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Register function: registers a new user and updates user state
  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      if (response.user) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        console.log("User registered:", response.user);
        navigate("/"); // Redirect after registration
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: "Registration failed. Try again." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
