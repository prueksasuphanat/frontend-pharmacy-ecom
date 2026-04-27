// Product type definitions

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

export interface Product {
  id: number;
  pmc_product_id: number;
  code: string;
  name: string;
  generic_name: string | null;
  unit_name: string | null;
  using: string | null;
  warning: string | null;
  default_price: string;
  is_special_pricing_enabled: boolean;
  quantity: number;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  categories: ProductCategory[];
  attachments?: ProductAttachment[];
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  category_id?: number; // filter สินค้าที่มี category นั้น (ยังใช้ได้เหมือนเดิม)
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

// Legacy types (keep for backward compatibility)
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
