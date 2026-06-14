import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.status, err.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

api.interceptors.request.use((config) => {
  console.log('🔑 Sending token:', config.headers?.Authorization?.toString().substring(0, 40) ?? 'NONE');
  return config;
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export const apiBase = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
