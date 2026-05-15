import { defineStore } from "pinia";
import { publicProductsApi } from "@/api/public/products";
import type { PublicProductListParams } from "@/api/public/products";
import type { Product } from "@/types";

interface PublicProductState {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  isLoadingDetail: boolean;
}

export const usePublicProductStore = defineStore("publicProduct", {
  state: (): PublicProductState => ({
    products: [],
    pagination: null,
    isLoading: false,
    error: null,
    selectedProduct: null,
    isLoadingDetail: false,
  }),

  actions: {
    async fetchProducts(params: PublicProductListParams = {}): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await publicProductsApi.getAll(params);
        this.products = res.data.data;
        this.pagination = res.data.pagination;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า";
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProductById(id: number): Promise<void> {
      this.isLoadingDetail = true;
      this.selectedProduct = null;
      try {
        const res = await publicProductsApi.getById(id);
        this.selectedProduct = res.data.data;
      } catch (err: any) {
        // ไม่ toast — modal จะแสดง error state เอง
        console.error("[publicProductStore] fetchProductById error:", err);
      } finally {
        this.isLoadingDetail = false;
      }
    },

    clearSelectedProduct() {
      this.selectedProduct = null;
    },
  },
});
