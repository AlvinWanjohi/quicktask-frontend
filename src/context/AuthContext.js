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

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Check if user is logged in
  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);

        // Redirect after login
        navigate("/");
        
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: "Login failed. Try again." };
    }
  };

  // Logout function (Fixed)
  const logout = async () => {
    try {
      await logoutUser(); // Call backend logout function if necessary
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null); // ✅ Update state instead of reloading
      navigate("/login"); // ✅ Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      if (response.success) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);

        // Redirect after registration
        navigate("/");
        
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
