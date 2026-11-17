import axios from "axios";

// When running in a browser on localhost or local LAN, route requests through Next.js proxy
// to bypass browser CORS restrictions while connecting to the live production API.
const isLocalBrowser =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168."));

export const API_URL = isLocalBrowser
  ? "/api-backend"
  : (process.env.NEXT_PUBLIC_API_URL || "https://api.dealdoko.com/api");

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
