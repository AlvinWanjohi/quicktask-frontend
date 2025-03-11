import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
console.log("API BASE URL:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get token from sessionStorage first, then fallback to localStorage
const getAuthToken = () => sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

// Function to set or remove auth token
export const setAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem("authToken", token);  // Prioritize sessionStorage
    localStorage.setItem("authToken", token);  

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("authToken");

    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// Automatically add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,  
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);

    if (error.response?.status === 401) {
      console.warn("Unauthorized: Token may have expired. Logging out...");
      setAuthToken(null);  
      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);

// Set initial token if available
const initialAuthToken = getAuthToken();
if (initialAuthToken) {
  setAuthToken(initialAuthToken);
}

export default apiClient;
