import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api"; 


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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


export const getTasks = async () => {
  try {
    const response = await apiClient.get("/tasks");
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch tasks");
  }
};


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
