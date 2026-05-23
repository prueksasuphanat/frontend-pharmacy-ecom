import type { ProductUnit } from "./unit";

export type DrugType =
  | "otc"
  | "prescription"
  | "controlled"
  | "supplement"
  | "cosmetic";

export interface ProductCategory {
  product_id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
}

export interface ProductAttachment {
  id: number;
  product_id: number;
  url: string;
  name: string;
  type: string | null;
  mime_type: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVendor {
  id: number;
  name: string;
  seller_code: string | null;
}

export interface Product {
  id: number;
  pmc_product_id: number | null;
  code: string;
  name: string;
  generic_name: string | null;
  using: string | null;
  warning: string | null;
  base_unit_id: number;
  base_unit: { id: number; name: string } | null;
  vendor_id: number | null;
  vendor: ProductVendor | null;
  is_special_pricing_enabled: boolean;
  quantity: number;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  categories: ProductCategory[];
  attachments?: ProductAttachment[];

  units?: (ProductUnit & { price?: number; is_special_price?: boolean })[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  category_id?: number;
  is_special_pricing_enabled?: boolean;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  drug_type?: DrugType;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface PriceByRole {
  retail: number;
  wholesale: number;
  clinic: number;
}
