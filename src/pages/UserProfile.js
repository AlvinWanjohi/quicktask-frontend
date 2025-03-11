import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../utils/supabaseClient";

const UserProfile = () => {
  const { id } = useParams(); 
  console.log("UserProfile Component Rendered"); // Debugging log
  console.log("User ID from URL:", id); // Check if id is received

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: "",
    experience: "",
    education: "",
    linkedin: "",
    github: "",
    portfolio: "",
    profile_picture: "",
  });

  useEffect(() => {
    if (!id) {
      console.error("No user ID found in URL");
      return;
    }

    const fetchUser = async () => {
      console.log("Fetching user data for ID:", id); // Debugging log
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

      if (error) {
        console.error("Error fetching user:", error);
        alert("Failed to fetch user data.");
      } else {
        console.log("User data fetched:", data); // Debugging log
        setUser(data);
        setFormData(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [id]);

  if (loading) {
    console.log("UserProfile is still loading...");
    return <p className="text-center text-gray-500">Loading user profile...</p>;
  }

  if (!user) {
    console.error("User not found or invalid ID.");
    return <p className="text-center text-red-500">User not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <p>ID: {id}</p> {/* Show the user ID for debugging */}
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserProfile;
