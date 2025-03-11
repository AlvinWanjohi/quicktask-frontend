import apiClient from "../utils/apiClient";

export const placeBid = async (taskId, amount) => {
  const response = await apiClient.post(`/tasks/${taskId}/bids`, { amount });
  return response.data;
};

export const getBidsByUser = async () => {
  const response = await apiClient.get("/bids/my");
  return response.data;
};
