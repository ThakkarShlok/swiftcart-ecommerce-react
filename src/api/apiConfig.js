import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export const getApiUrl = (path) => {
  if (!BASE_URL) {
    console.warn('VITE_API_BASE_URL is not defined. Please set it in your environment.');
    return path;
  }
  return `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const authHeaders = (token = API_TOKEN) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const apiPost = async (path, data, token = API_TOKEN) => {
  return axios.post(getApiUrl(path), data, {
    headers: authHeaders(token),
  });
};
