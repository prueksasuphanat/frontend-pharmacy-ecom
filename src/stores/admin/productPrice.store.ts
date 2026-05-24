import { productPricesApi } from "@/api";
import { useToast } from "@/composables";
import type { ProductPriceData, UpdateProductPricePayload } from "@/types";
import { defineStore } from "pinia";

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

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
      const matrix: Record<number, Record<number, number>> = {};

      state.productPrices.forEach((productPrice) => {
        productPrice.units.forEach((unitPrice) => {
          if (!matrix[unitPrice.product_unit_id]) {
            matrix[unitPrice.product_unit_id] = {};
          }
          unitPrice.users.forEach((userPrice) => {
            matrix[unitPrice.product_unit_id][userPrice.user_id] =
              userPrice.price;
          });
        });
      });

      return matrix;
    },

    getPriceByUserAndUnit:
      (state) => (userId: number, productUnitId: number) => {
        for (const productPrice of state.productPrices) {
          const unitPrice = productPrice.units.find(
            (u) => u.product_unit_id === productUnitId,
          );
          if (unitPrice) {
            const userPrice = unitPrice.users.find((u) => u.user_id === userId);
            return userPrice?.price ?? null;
          }
        }
        return null;
      },

    getUnitsByProduct: (state) => (productId: number) => {
      const productPrice = state.productPrices.find(
        (pp) => pp.product_id === productId,
      );
      return productPrice?.units ?? [];
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
      const toast = getToast();

      try {
        const response = await productPricesApi.getProductPrices({
          product_ids: productIds,
        });

        this.productPrices = response.data.data;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลราคาสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลราคาสินค้า");
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
      const toast = getToast();

      try {
        const response = await productPricesApi.updateProductPrices({ prices });

        response.data.data.forEach((result) => {
          if (result.action === "unchanged") return;

          for (const productPrice of this.productPrices) {
            const unitPrice = productPrice.units.find(
              (u) => u.product_unit_id === result.product_unit_id,
            );
            if (unitPrice) {
              const userPrice = unitPrice.users.find(
                (u) => u.user_id === result.user_id,
              );
              const newPrice = result.new_price ?? result.price ?? 0;
              if (userPrice) {
                userPrice.price = newPrice;
                userPrice.is_special = true;
              }
            }
          }
        });

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
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกราคาสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการบันทึกราคาสินค้า");
        return false;
      } finally {
        this.isSaving = false;
      }
    },

    clearProductPrices() {
      this.productPrices = [];
      this.error = null;
    },
  },
});
