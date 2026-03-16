// import axios, { AxiosInstance } from "axios";
//
// const api: AxiosInstance = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
// });
//
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//
//     return config;
// });
//
// export default api;

import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ✅ Important: Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/login")
      ) {
        // Clear any local state if needed
        console.log("Session expired - redirecting to login");
        // You might want to trigger a global state update here
      }
    }
    return Promise.reject(error);
  },
);

export default api;
