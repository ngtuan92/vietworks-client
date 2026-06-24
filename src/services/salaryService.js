import api from './api';

export const getSalaryLookupOptions = async () => {
  const response = await api.get('/tools/salary-lookup/options');
  return response.data;
};

export const getSalaryLookup = async (params = {}) => {
  const response = await api.get('/tools/salary-lookup', { params });
  return response.data;
};
