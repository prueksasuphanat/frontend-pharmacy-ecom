export interface Vendor {
  id: number;
  pmc_vendor_id: number;
  seller_code: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    products: number;
  };
}

export interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface VendorListResponse {
  success: boolean;
  data: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
