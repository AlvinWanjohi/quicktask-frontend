import apiClient from "../utils/apiClient";

const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  throw new Error(error?.response?.data?.message || defaultMessage);
};

export const getTasks = async () => {
  try {
    const response = await apiClient.get("/tasks");
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch tasks");
  }
};


export const getTaskById = async (taskId) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
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


export const getBidsByTaskId = async (taskId) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}/bids`);
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
