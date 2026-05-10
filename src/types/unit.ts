/**
 * Unit type definitions
 */

export interface Unit {
  id: number;
  pmc_unit_id: number | null;
  name: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  _count: {
    base_products: number;
    product_units: number;
  };
}

export interface UnitListParams {
  page?: number;
  limit?: number;
  search?: string | null;
  is_active?: boolean;
}

export interface UnitListResponse {
  success: boolean;
  data: Unit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductUnit {
  id: number;
  product_id: number;
  unit_id: number;
  base_unit_id: number | null;
  base_unit_qty: number | null;
  multiplier_to_base: number;
  default_price: string;
  created_at: string;
  updated_at: string;
  unit: { id: number; name: string };
  base_unit: { id: number; name: string } | null;
}

export interface ProductUnitListResponse {
  success: boolean;
  data: {
    product: { id: number; code: string; name: string; base_unit_id: number };
    units: ProductUnit[];
  };
}

export interface CreateProductUnitPayload {
  unit_id: number;
  base_unit_id?: number;
  base_unit_qty?: number;
  default_price?: number;
}

export interface UpdateProductUnitPayload {
  base_unit_id?: number | null;
  base_unit_qty?: number | null;
  default_price?: number;
}
