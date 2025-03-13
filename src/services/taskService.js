import axios from "axios";

// ✅ Define API Base URL - Ensure this matches your backend URL
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api"; 

// ✅ Create an Axios instance for reuse
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper function for API errors
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    console.error(`${defaultMessage}:`, error.response.data);
    throw new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    console.error(`${defaultMessage}: No response from server`, error.request);
    throw new Error("No response from server. Please check your network.");
  } else {
    console.error(`${defaultMessage}:`, error.message);
    throw new Error(error.message);
  }
};

// ✅ Fetch all tasks (Updated to use Fetch API)
export const getTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// ✅ Fetch a single task by ID
export const getTaskById = async (taskId, token) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to fetch task with ID: ${taskId}`);
  }
};

// ✅ Create a new task
export const createTask = async (taskData, token) => {
  try {
    const response = await apiClient.post("/tasks", taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to create task");
  }
};

// ✅ Delete a task
export const deleteTask = async (taskId, token) => {
  try {
    const response = await apiClient.delete(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to delete task with ID: ${taskId}`);
  }
};

// ✅ Get bids for a task
export const getBidsByTaskId = async (taskId, token) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}/bids`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to fetch bids for task ID: ${taskId}`);
  }
};

// ✅ Submit a bid
export const submitBid = async (taskId, bidAmount, token) => {
  try {
    const response = await apiClient.post(
      `/tasks/${taskId}/bids`,
      { bidAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to place bid on task ID: ${taskId}`);
  }
};

// ✅ Accept a bid
export const acceptBid = async (bidId, token) => {
  try {
    const response = await apiClient.patch(
      `/bids/${bidId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `Failed to accept bid ID: ${bidId}`);
  }
};
