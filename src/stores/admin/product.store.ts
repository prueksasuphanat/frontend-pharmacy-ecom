import { defineStore } from "pinia";
import type { Product, ProductListParams } from "@/types";
import { productsApi } from "@/api";
import { useToast } from "@/composables";

interface ProductState {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useProductStore = defineStore("product", {
  state: (): ProductState => ({
    products: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    totalProducts: (state) => state.pagination.total,
    activeProducts: (state) => state.products.filter((p) => p.is_active),
    inactiveProducts: (state) => state.products.filter((p) => !p.is_active),
    productsWithSpecialPricing: (state) =>
      state.products.filter((p) => p.is_special_pricing_enabled),
  },

  actions: {
    async getProducts(params?: ProductListParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await productsApi.getProducts(params);

        this.products = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า";
        toast.error(this.error);
        console.error("Error fetching products:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getProductById(id: number): Promise<Product | null> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const product = await productsApi.getProductById(id);

        // Sync into local list if present
        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = product;
        }

        return product;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า";
        toast.error(this.error);
        console.error("Error fetching product by id:", err);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProduct(id: number, data: Partial<Product>): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const updated = await productsApi.updateProduct(id, data);

        // Update in local state
        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = {
            ...this.products[idx],
            ...updated,
          };
        }

        toast.success("อัปเดตสินค้าสำเร็จ");
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสินค้า";
        toast.error(this.error);
        console.error("Error updating product:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleProductActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        // Find current product to get current status
        const currentProduct = this.products.find((p) => p.id === id);
        if (!currentProduct) {
          throw new Error("Product not found");
        }

        // Toggle the status
        const updated = await productsApi.toggleProductActive(
          id,
          !currentProduct.is_active,
        );

        // Update in local state
        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = {
            ...this.products[idx],
            ...updated,
          };
        }

        toast.success(
          updated.is_active
            ? "เปิดใช้งานสินค้าสำเร็จ"
            : "ปิดใช้งานสินค้าสำเร็จ",
        );
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า";
        toast.error(this.error);
        console.error("Error toggling product status:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    clearProducts() {
      this.products = [];
      this.error = null;
    },
  },
});
