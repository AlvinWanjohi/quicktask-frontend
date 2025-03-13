import supabase from "../utils/supabaseClient";

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Helper function to set authorization headers
const authHeaders = () => ({
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAuthToken()}`, // Ensure Bearer is included
  },
});

// 🟢 Register User
export const registerUser = async (userData) => {
  try {
    const { fullName, email, password } = userData;

    const { data, error: registerError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (registerError) {
      console.error("Supabase Registration Error:", registerError.message);
      throw registerError;
    }

    const user = data?.user;
    const token = data?.session?.access_token;

    if (user?.id && token) {
      localStorage.setItem("token", token);

      // Update user details in backend
      const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
        method: "PUT",
        ...authHeaders(), // Use helper function
        body: JSON.stringify({ fullName, email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update user:", response.status, errorText);
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      console.log("User updated successfully:", updatedUser);
    }

    return { user, message: "Registration successful!" };
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

// 🟢 Login User
export const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Supabase Login Error:", loginError.message);
      throw loginError;
    }

    const user = data?.user;
    const session = data?.session;

    if (session?.access_token) {
      localStorage.setItem("token", session.access_token);
    }

    return { user, access_token: session?.access_token };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error.message || { message: "Login failed" };
  }
};

// 🟢 Logout User
export const logoutUser = () => {
  try {
    supabase.auth.signOut();
    localStorage.removeItem("token");
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

// 🟢 Verify Email
export const verifyEmail = async (token) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/auth/verify-email", {
      method: "POST",
      ...authHeaders(), // Use authHeaders function
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email verification failed:", response.status, errorText);
      throw new Error(`Email verification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Email Verification Error:", error.message);
    throw error.message || { message: "Email verification failed" };
  }
};

// 🟢 Fetch Tasks (Ensure Authorization)
export const getTasks = async () => {
  try {
    console.log("Fetching tasks from API:", `${process.env.REACT_APP_API_URL}/tasks`);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks`, {
      method: "GET",
      ...authHeaders(), // Use authHeaders function
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch tasks:", response.status, errorText);
      throw new Error(`Server responded with ${response.status} - ${errorText}`);
    }

    const tasks = await response.json();
    console.log("Tasks fetched successfully:", tasks);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }
};
