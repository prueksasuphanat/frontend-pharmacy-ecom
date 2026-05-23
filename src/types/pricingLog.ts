export interface PricingLogProduct {
  id: number;
  code: string;
  name: string;
  categories: {
    product_id: number;
    category_id: number;
    category: { id: number; name: string };
  }[];
}

export interface PricingLogProductUnit {
  id: number;
  unit: { id: number; name: string };
  product: PricingLogProduct;
}

export interface PricingLogProductUnitOnly {
  id: number;
  unit: { id: number; name: string };
}

export interface PricingLogUser {
  id: number;
  username: string;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  pmc_name: string | null;
  email: string | null;
  role: string;
}

export interface DefaultPriceLogEntry {
  id: number;
  product_unit_id: number | null;
  unit_name_snapshot: string | null;
  product_name_snapshot: string | null;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number | null;
  product_unit: PricingLogProductUnit | null;
  user: PricingLogUser | null;
}

export interface DefaultPriceLogByProductEntry {
  id: number;
  product_unit_id: number | null;
  unit_name_snapshot: string | null;
  product_name_snapshot: string | null;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number | null;
  product_unit: PricingLogProductUnitOnly | null;
  user: PricingLogUser | null;
}

export interface SpecialPriceLogEntry {
  id: number;
  product_price_id: number | null;
  product_unit_id: number | null;
  unit_name_snapshot: string | null;
  product_name_snapshot: string | null;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number | null;
  product_unit: PricingLogProductUnit | null;
  target_user: PricingLogUser;
  changed_by_user: PricingLogUser | null;
}

export interface SpecialPriceLogByProductEntry {
  id: number;
  product_price_id: number | null;
  product_unit_id: number | null;
  unit_name_snapshot: string | null;
  product_name_snapshot: string | null;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number | null;
  product_unit: PricingLogProductUnitOnly | null;
  target_user: PricingLogUser;
  changed_by_user: PricingLogUser | null;
}

export interface SpecialPriceLogByUserEntry {
  id: number;
  product_price_id: number | null;
  product_unit_id: number | null;
  unit_name_snapshot: string | null;
  product_name_snapshot: string | null;
  user_id: number;
  old_price: string;
  new_price: string;
  changed_at: string;
  changed_by: number | null;
  product_unit: PricingLogProductUnit | null;
  changed_by_user: PricingLogUser | null;
}

export interface DefaultPriceLogListResponse {
  success: boolean;
  data: DefaultPriceLogEntry[];
  pagination: PricingLogPagination;
}

export interface DefaultPriceLogByProductResponse {
  success: boolean;
  data: {
    product: PricingLogProduct;
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
    product: PricingLogProduct;
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
  changed_at?: string;
}

export type PricingType = "default" | "user";
