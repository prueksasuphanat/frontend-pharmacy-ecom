/**
 * API endpoint constants
 *
 * Centralizes all API endpoint paths used in the application.
 * Use these constants instead of hardcoded strings for consistency and maintainability.
 */

export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },

  /**
   * Product endpoints
   */
  PRODUCTS: {
    BASE: "/api/v1/products",
    BY_ID: (id: string) => `/api/v1/products/${id}`,
    SYNC: "/api/v1/sync/products",
  },

  /**
   * Cart endpoints
   */
  CART: {
    BASE: "/api/v1/cart",
    ITEMS: "/api/v1/cart/items",
    ITEM_BY_ID: (id: string) => `/api/v1/cart/items/${id}`,
    CLEAR: "/api/v1/cart/clear",
  },

  /**
   * Order endpoints
   */
  ORDERS: {
    BASE: "/api/v1/orders",
    BY_ID: (id: string) => `/api/v1/orders/${id}`,
    CANCEL: (id: string) => `/api/v1/orders/${id}/cancel`,
  },

  /**
   * Notification endpoints
   */
  NOTIFICATIONS: {
    BASE: "/api/v1/notifications",
    BY_ID: (id: string) => `/api/v1/notifications/${id}`,
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: "/api/v1/notifications/read-all",
  },

  /**
   * User profile endpoints
   */
  PROFILE: {
    BASE: "/api/v1/profile",
    UPDATE: "/api/v1/profile",
    CHANGE_PASSWORD: "/api/v1/profile/password",
    ADDRESSES: "/api/v1/profile/addresses",
    ADDRESS_BY_ID: (id: string) => `/api/v1/profile/addresses/${id}`,
  },

  /**
   * Admin endpoints
   */
  ADMIN: {
    DASHBOARD: "/api/v1/admin/dashboard",
    USERS: "/api/v1/admin/users",
    USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    INVENTORY: "/api/v1/admin/inventory",
    LOGS: "/api/v1/admin/logs",
    SETTINGS: "/api/v1/admin/settings",
  },
} as const;
