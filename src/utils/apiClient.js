import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
console.log("API BASE URL:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


const getAuthToken = () => sessionStorage.getItem("authToken") || localStorage.getItem("authToken");


export const setAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem("authToken", token);
    localStorage.setItem("authToken", token);

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("authToken");

    delete apiClient.defaults.headers.common["Authorization"];
  }
};


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


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);

    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Unauthorized: Token may have expired. Logging out...");
        setAuthToken(null);
        window.location.href = "/login";
      } else if (status === 403) {
        console.warn("Forbidden: You don't have permission for this action.");
      } else if (status >= 500) {
        console.error("Server Error: Please try again later.");
      }
    }

    return Promise.reject(error);
  }
);


const initialAuthToken = getAuthToken();
if (initialAuthToken) {
  setAuthToken(initialAuthToken);
}

export default apiClient;
