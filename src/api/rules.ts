import axiosInstance from './axios';
import { Rule } from '../types';

export const fetchRules = () => {
  return axiosInstance.get('/api/v1/tenant/rules');
};

export const fetchRule = (id: string) => {
  return axiosInstance.get(`/api/v1/tenant/rules/${id}`);
};

export const createRule = (rule: Omit<Rule, 'id'>) => {
  return axiosInstance.post('/api/v1/tenant/rules', rule);
};

export const updateRule = (id: string, rule: Partial<Rule>) => {
  return axiosInstance.put(`/api/v1/tenant/rules/${id}`, rule);
};

export const deleteRule = (id: string) => {
  return axiosInstance.delete(`/api/v1/tenant/rules/${id}`);
};

export const toggleRuleStatus = (id: string, enabled: boolean) => {
  return axiosInstance.patch(`/api/v1/tenant/rules/${id}/status`, { enabled });
};
