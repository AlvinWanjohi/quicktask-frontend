import apiClient from "../utils/apiClient";

export const makePayment = async (taskId, amount) => {
  const response = await apiClient.post(`/tasks/${taskId}/pay`, { amount });
  return response.data;
};
