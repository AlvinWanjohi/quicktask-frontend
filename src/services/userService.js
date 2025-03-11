export const updateUserProfile = async (userId, profileData) => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"; 
    const token = localStorage.getItem("authToken"); 

    console.log("API BASE URL:", API_BASE_URL);
    console.log("Updating user profile for ID:", userId, "with data:", profileData);

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Profile update failed:", errorData);
      throw new Error(errorData.message || "Failed to update user profile");
    }

    const updatedUser = await response.json();
    console.log("User profile updated successfully:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};