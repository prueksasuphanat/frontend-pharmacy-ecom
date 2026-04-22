// Pricing Log type definitions

export interface PricingLogProduct {
  id: number;
  code: string;
  name: string;
  category: {
    id: number;
    name: string;
  } | null;
}

export interface PricingLogUser {
  id: number;
  username: string;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface DefaultPriceLogEntry {
  id: number;
  product_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number;
  product: PricingLogProduct;
  user: PricingLogUser;
}

export interface DefaultPriceLogByProductEntry {
  id: number;
  product_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number;
  user: PricingLogUser;
}

export interface SpecialPriceLogEntry {
  id: number;
  product_price_id: number;
  product_id: number;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number;
  product: PricingLogProduct;
  target_user: PricingLogUser;
  changed_by_user: PricingLogUser;
}

export interface SpecialPriceLogByProductEntry {
  id: number;
  product_price_id: number;
  product_id: number;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number;
  target_user: PricingLogUser;
  changed_by_user: PricingLogUser;
}

export interface SpecialPriceLogByUserEntry {
  id: number;
  product_price_id: number;
  product_id: number;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number;
  product: PricingLogProduct;
  changed_by_user: PricingLogUser;
}

export interface DefaultPriceLogListResponse {
  success: boolean;
  data: DefaultPriceLogEntry[];
  pagination: PricingLogPagination;
}

export interface DefaultPriceLogByProductResponse {
  success: boolean;
  data: {
    product: PricingLogProduct & { default_price: string };
    logs: DefaultPriceLogByProductEntry[];
  };
  pagination: PricingLogPagination;
}

export interface SpecialPriceLogListResponse {
  success: boolean;
  data: SpecialPriceLogEntry[];
  pagination: PricingLogPagination;
}

export interface SpecialPriceLogByProductResponse {
  success: boolean;
  data: {
    product: PricingLogProduct & { default_price: string };
    logs: SpecialPriceLogByProductEntry[];
  };
  pagination: PricingLogPagination;
}

export interface SpecialPriceLogByUserResponse {
  success: boolean;
  data: {
    user: PricingLogUser;
    logs: SpecialPriceLogByUserEntry[];
  };
  pagination: PricingLogPagination;
}

export interface PricingLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PricingLogParams {
  page?: number;
  limit?: number;
  search?: string;
  product_id?: number;
  user_id?: number;
  changed_at?: string; // YYYY-MM-DD
}

export type PricingType = "default" | "user";
