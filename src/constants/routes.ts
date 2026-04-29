/**
 * Application route path constants
 *
 * Centralizes all route paths used in the application.
 * Use these constants instead of hardcoded strings for type safety and maintainability.
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PRODUCTS: "/products",

  // Customer routes (requires auth)
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  ORDERS: "/profile/orders",
  ORDER_DETAIL: (id: string) => `/profile/orders/${id}`,
  PROFILE: "/profile/information",
  PROFILE_ADDRESSES: "/profile/address",
  PROFILE_SECURITY: "/profile/security",
  WISHLIST: "/profile/wishlist",
  NOTIFICATIONS: "/notifications",

  // Admin routes (requires admin role)
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_LOGS: "/admin/logs",
  ADMIN_SETTINGS: "/admin/settings",

  // Error pages
  FORBIDDEN: "/403",
  NOT_FOUND: "/:pathMatch(.*)*",
} as const;
