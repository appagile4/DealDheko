import axios from "axios";

// Resolve API base URL: Use Next.js server rewrite proxy on localhost to avoid CORS restrictions
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "/api/proxy";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.dealdoko.com/api";
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("dealdoko_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dealdoko_token");
        localStorage.removeItem("deal_dheko_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
