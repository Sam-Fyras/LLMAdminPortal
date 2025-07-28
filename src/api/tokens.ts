import axiosInstance from './axios';

export const fetchTokenUsage = (timeRange: string) => {
  return axiosInstance.get(`/api/v1/tenant/token-usage?timeRange=${timeRange}`);
};

export const fetchModelUsage = (timeRange: string) => {
  return axiosInstance.get(`/api/v1/tenant/model-usage?timeRange=${timeRange}`);
};

export const fetchUserUsage = (timeRange: string) => {
  return axiosInstance.get(`/api/v1/tenant/user-usage?timeRange=${timeRange}`);
};

export const fetchTokenUsageByUser = (userId: string, timeRange: string) => {
  return axiosInstance.get(`/api/v1/tenant/users/${userId}/token-usage?timeRange=${timeRange}`);
};

export const fetchTokenUsageByModel = (model: string, timeRange: string) => {
  return axiosInstance.get(`/api/v1/tenant/models/${model}/token-usage?timeRange=${timeRange}`);
};

export const fetchAvailableModels = () => {
  return axiosInstance.get('/api/v1/models');
};

export const estimateTokens = (text: string, model: string) => {
  return axiosInstance.post('/api/v1/estimate-tokens', { text, model });
};
