import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
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
