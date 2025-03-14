import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, logoutUser } from "../services/authService";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const createProfile = async (userId, email) => {
    try {
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData || !userData.user) {
        console.error("Error fetching user data:", userError);
        return;
      }
  
      const userName = userData.user.user_metadata?.full_name || "New User";
  

      const { data, error } = await supabase
        .from("profiles")
        .insert([{ 
          id: userId, 
          email: email, 
          name: userName 
        }]);
  
      if (error) {
        console.error("Error creating profile:", error);
      } else {
        console.log("Profile created:", data);
      }
  
    } catch (err) {
      console.error("Unexpected error creating profile:", err);
    }
  };
  
  
  
  useEffect(() => {
    const fetchUserProfileAndTasks = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error fetching user:", userError);
        return;
      }
  
      const userId = userData.user.id;
      const userEmail = userData.user.email;
  
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); 
  
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }
  
      if (!profileData) {
        console.warn("No profile found, creating one...");
        await createProfile(userId, userEmail);
      } else {
        console.log("Profile found:", profileData);
        setProfile(profileData);
      }
    };
  
    fetchUserProfileAndTasks();
  }, []);
  
  
  const getAuthToken = () => localStorage.getItem("token");

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
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.user && response.access_token) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        console.log("User logged in:", response.user);
        navigate("/");
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: "Login failed. Try again." };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setProfile(null);
      setTasks([]); 
      console.log("User logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const register = async (userData) => {
    try {
      const { user, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
  
      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }
  
      if (user) {
        await supabase.from("profiles").insert([{ id: user.id, email: user.email }]);
        console.log("Profile created for new user:", user.id);
      }
  
      return { success: true };
    } catch (error) {
      return { success: false, error: "Registration failed. Try again." };
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, profile, tasks, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
