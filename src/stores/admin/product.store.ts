import { productsApi } from "@/api";
import type { UpdateProductPayload } from "@/api/admin/products";
import { useToast } from "@/composables";
import type { Product, ProductListParams } from "@/types";
import { defineStore } from "pinia";

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

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
      const toast = getToast();

      try {
        const response = await productsApi.getProducts(params);

        this.products = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getProductById(id: number): Promise<Product | null> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const product = await productsApi.getProductById(id);

        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = product;
        }

        return product;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProduct(
      id: number,
      data: UpdateProductPayload,
      imageFile?: File | null,
      removeAttachments?: boolean,
    ): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const updated = await productsApi.updateProduct(
          id,
          data,
          imageFile,
          removeAttachments,
        );

        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = {
            ...this.products[idx],
            ...updated,
          };
        }

        toast.success("อัปเดตสินค้าสำเร็จ");
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการอัปเดตสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleProductActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const currentProduct = this.products.find((p) => p.id === id);
        if (!currentProduct) {
          throw new Error("Product not found");
        }

        const updated = await productsApi.toggleProductActive(
          id,
          !currentProduct.is_active,
        );

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
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า");
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
