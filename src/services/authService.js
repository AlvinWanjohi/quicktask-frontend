import supabase from "../utils/supabaseClient"; // Assuming you have a Supabase client utility

// Register a new user
export const registerUser = async (userData) => {
  try {
    const { fullName, email, password } = userData; // Removed profilePhoto & location

    const { data, error: registerError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (registerError) {
      throw registerError;
    }

    const user = data?.user;
    const token = data?.session?.access_token;

    if (user?.id && token) {
      localStorage.setItem("token", token); // Store JWT token

      try {
        const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Include JWT token
          },
          body: JSON.stringify({
            fullName, // Ensure you're passing actual user details
            email,
          }),
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("User updated successfully:", data);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }

    return { user, message: "Registration successful!" };
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

// Log in a user with provided credentials
export const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
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

// Log out the user
export const logoutUser = () => {
  try {
    supabase.auth.signOut();
    localStorage.removeItem("token");
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

// Verify user's email
export const verifyEmail = async (token) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/auth/verify-email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Email verification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Email Verification Error:", error.message);
    throw error.message || { message: "Email verification failed" };
  }
};
