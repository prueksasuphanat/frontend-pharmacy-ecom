export const API_ENDPOINTS = {
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

  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
    SYNC: "/sync/products",
  },

  CART: {
    BASE: "/cart",
    ITEMS: "/cart/items",
    ITEM_BY_ID: (id: string) => `/cart/items/${id}`,
    CLEAR: "/cart/clear",
  },

  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },

  PROFILE: {
    BASE: "/profile",
    UPDATE: "/profile",
    CHANGE_PASSWORD: "/profile/password",
    ADDRESSES: "/profile/addresses",
    ADDRESS_BY_ID: (id: string) => `/profile/addresses/${id}`,
  },

  ADMIN: {
    SETTINGS: {
      USERS: {
        BASE: "/admin/users",
      },
    },
  },
} as const;
