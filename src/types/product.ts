// Product type definitions
// Extracted from src/mocks/products.ts

export type DrugType =
  | "otc"
  | "prescription"
  | "controlled"
  | "supplement"
  | "cosmetic";

export interface Product {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  description: string;
  image_url: string;
  sku: string;
  stock: number;
  base_price: number;
  unit: string;
  dosage_form: string;
  strength: string;
  registration_no: string;
  manufacturer: string;
  reorder_level: number;
  drug_type: DrugType;
  drug_type_label: string;
  is_deleted: boolean;
  created_at: string;
}

export interface ProductFilters {
  drug_type?: DrugType;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export type ProductFormData = Omit<Product, "id" | "created_at">;

export interface PriceByRole {
  retail: number;
  wholesale: number;
  clinic: number;
}
