/**
 * Axios client configuration
 *
 * Provides a configured Axios instance with interceptors for:
 * - Authentication token injection
 * - Error handling
 * - Request/response logging (development only)
 *
 * **Validates: Requirements 2.2**
 */

import axios from "axios";

/**
 * Base API client instance
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Injects authentication token from localStorage into request headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 * Handles common HTTP errors and provides consistent error messages
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("auth_token");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error(
            "Access forbidden:",
            data.message || "Insufficient permissions",
          );
          break;

        case 404:
          // Not found
          console.error(
            "Resource not found:",
            data.message || "The requested resource was not found",
          );
          break;

        case 500:
          // Server error
          console.error(
            "Server error:",
            data.message || "An internal server error occurred",
          );
          break;

        default:
          console.error(`HTTP ${status}:`, data.message || "An error occurred");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        "Network error:",
        "No response from server. Please check your connection.",
      );
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);
