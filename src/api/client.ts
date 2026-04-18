/**
 * Axios client configuration
 *
 * Provides a configured Axios instance with interceptors for:
 * - Authentication token injection
 * - Token refresh on 401
 * - Error handling
 */

import axios from "axios";

/**
 * Base API client instance
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Injects access_token from localStorage into request headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor
 * On 401 → try refresh token once, then retry original request
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      // No refresh token → redirect to login
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 403:
          console.error(
            "Access forbidden:",
            data.message || "Insufficient permissions",
          );
          break;
        case 404:
          console.error("Resource not found:", data.message || "Not found");
          break;
        case 500:
          console.error(
            "Server error:",
            data.message || "Internal server error",
          );
          break;
        default:
          console.error(`HTTP ${status}:`, data.message || "An error occurred");
      }
    } else if (error.request) {
      console.error("Network error: No response from server.");
    }

    return Promise.reject(error);
  },
);
