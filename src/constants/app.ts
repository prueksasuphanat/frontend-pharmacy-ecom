/**
 * Application-level constants
 *
 * Centralizes application configuration values, enums, and magic numbers.
 * **Validates: Requirements 6.4**
 */

/**
 * Application name
 */
export const APP_NAME = "Pharma E-Commerce";

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Shipping constants
 */
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 1000, // THB
  STANDARD_FEE: 50, // THB
  EXPRESS_FEE: 100, // THB
} as const;

/**
 * Drug type constants
 */
export const DRUG_TYPES = {
  OTC: "otc",
  PRESCRIPTION: "prescription",
  SUPPLEMENT: "supplement",
} as const;

/**
 * Drug type labels for display
 */
export const DRUG_TYPE_LABELS: Record<string, string> = {
  [DRUG_TYPES.OTC]: "OTC",
  [DRUG_TYPES.PRESCRIPTION]: "Prescription",
  [DRUG_TYPES.SUPPLEMENT]: "Supplement",
};

/**
 * User role constants
 */
export const USER_ROLES = {
  ADMIN: "admin",
  WHOLESALE: "wholesale",
  CLINIC: "clinic",
  RETAIL: "retail",
} as const;

/**
 * User role labels for display
 */
export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.WHOLESALE]: "Wholesale",
  [USER_ROLES.CLINIC]: "Clinic",
  [USER_ROLES.RETAIL]: "Retail",
};

/**
 * Order status constants
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

/**
 * Order status labels for display
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

/**
 * Notification type constants
 */
export const NOTIFICATION_TYPES = {
  ORDER: "order",
  SYSTEM: "system",
  PROMOTION: "promotion",
} as const;
