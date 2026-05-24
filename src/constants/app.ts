export const APP_NAME = "Pharma E-Commerce";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 1000,
  STANDARD_FEE: 50,
  EXPRESS_FEE: 100,
} as const;

export const DRUG_TYPES = {
  OTC: "otc",
  PRESCRIPTION: "prescription",
  SUPPLEMENT: "supplement",
} as const;

export const DRUG_TYPE_LABELS: Record<string, string> = {
  [DRUG_TYPES.OTC]: "OTC",
  [DRUG_TYPES.PRESCRIPTION]: "Prescription",
  [DRUG_TYPES.SUPPLEMENT]: "Supplement",
};

export const USER_ROLES = {
  ADMIN: "admin",
  WHOLESALE: "wholesale",
  CLINIC: "clinic",
  RETAIL: "retail",
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.WHOLESALE]: "Wholesale",
  [USER_ROLES.CLINIC]: "Clinic",
  [USER_ROLES.RETAIL]: "Retail",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export const NOTIFICATION_TYPES = {
  ORDER: "order",
  SYSTEM: "system",
  PROMOTION: "promotion",
} as const;
