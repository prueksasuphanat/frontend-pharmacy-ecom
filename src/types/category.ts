/**
 * Category type definitions
 */

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  _count: {
    products: number;
  };
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string | null;
  is_active?: boolean;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
