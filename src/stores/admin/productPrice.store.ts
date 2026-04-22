import { defineStore } from "pinia";
import type {
  ProductPriceData,
  UpdateProductPricePayload,
  BulkUpdateProductPricesPayload,
} from "@/types";
import { productPricesApi } from "@/api";
import { useToast } from "@/composables";

interface ProductPriceState {
  productPrices: ProductPriceData[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const useProductPriceStore = defineStore("productPrice", {
  state: (): ProductPriceState => ({
    productPrices: [],
    isLoading: false,
    isSaving: false,
    error: null,
  }),

  getters: {
    priceMatrix: (state) => {
      const matrix: Record<string, Record<number, number>> = {};

      state.productPrices.forEach((productPrice) => {
        productPrice.data.forEach((userPrice) => {
          const userKey = String(userPrice.user_id);
          if (!matrix[userKey]) {
            matrix[userKey] = {};
          }
          matrix[userKey][productPrice.product_id] = userPrice.price;
        });
      });

      return matrix;
    },

    getPriceByUserAndProduct:
      (state) => (userId: number, productId: number) => {
        const productPrice = state.productPrices.find(
          (pp) => pp.product_id === productId,
        );
        if (!productPrice) return null;

        const userPrice = productPrice.data.find((up) => up.user_id === userId);
        return userPrice?.price ?? null;
      },
  },

  actions: {
    async fetchProductPrices(productIds: number[]): Promise<boolean> {
      if (productIds.length === 0) {
        this.productPrices = [];
        return true;
      }

      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await productPricesApi.getProductPrices({
          product_ids: productIds,
        });

        this.productPrices = response.data.data;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลราคาสินค้า";
        toast.error(this.error);
        console.error("Error fetching product prices:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProductPrices(
      prices: UpdateProductPricePayload[],
    ): Promise<boolean> {
      this.isSaving = true;
      this.error = null;
      const toast = useToast();

      try {
        const response = await productPricesApi.updateProductPrices({ prices });

        // Update local state based on response
        response.data.data.forEach(({ product_id, user_id, new_price }) => {
          const productPrice = this.productPrices.find(
            (pp) => pp.product_id === product_id,
          );
          if (productPrice) {
            const userPrice = productPrice.data.find(
              (up) => up.user_id === user_id,
            );
            if (userPrice) {
              userPrice.price = new_price;
            } else {
              productPrice.data.push({ user_id, price: new_price });
            }
          }
        });

        // Show detailed success message
        const updatedCount = response.data.data.filter(
          (r) => r.action === "updated",
        ).length;
        const createdCount = response.data.data.filter(
          (r) => r.action === "created",
        ).length;

        let message = response.data.message;
        if (updatedCount > 0 || createdCount > 0) {
          const details = [];
          if (updatedCount > 0) details.push(`อัปเดต ${updatedCount} รายการ`);
          if (createdCount > 0)
            details.push(`สร้างใหม่ ${createdCount} รายการ`);
          message = `${message} (${details.join(", ")})`;
        }

        toast.success(message);
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกราคาสินค้า";
        toast.error(this.error);
        console.error("Error updating product prices:", err);
        return false;
      } finally {
        this.isSaving = false;
      }
    },

    updatePriceLocally(userId: number, productId: number, price: number) {
      const productPrice = this.productPrices.find(
        (pp) => pp.product_id === productId,
      );
      if (!productPrice) return;

      const userPrice = productPrice.data.find((up) => up.user_id === userId);
      if (userPrice) {
        userPrice.price = price;
      } else {
        productPrice.data.push({ user_id: userId, price });
      }
    },

    /**
     * Clear all product prices
     */
    clearProductPrices() {
      this.productPrices = [];
      this.error = null;
    },
  },
});
