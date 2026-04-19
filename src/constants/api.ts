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
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_TOKEN: "/auth/verify-reset-token",
    RESET_PASSWORD: "/auth/reset-password",
  },

  /**
   * Product endpoints
   */
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
    SYNC: "/sync/products",
  },

  /**
   * Cart endpoints
   */
  CART: {
    BASE: "/cart",
    ITEMS: "/cart/items",
    ITEM_BY_ID: (id: string) => `/cart/items/${id}`,
    CLEAR: "/cart/clear",
  },

  /**
   * Order endpoints
   */
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  /**
   * Notification endpoints
   */
  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },

  /**
   * User profile endpoints
   */
  PROFILE: {
    BASE: "/profile",
    UPDATE: "/profile",
    CHANGE_PASSWORD: "/profile/password",
    ADDRESSES: "/profile/addresses",
    ADDRESS_BY_ID: (id: string) => `/profile/addresses/${id}`,
  },

  /**
   * Admin endpoints
   */
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    INVENTORY: "/admin/inventory",
    LOGS: "/admin/logs",
    SETTINGS: "/admin/settings",
  },
} as const;
