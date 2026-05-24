import { defineStore } from "pinia";
import type { Category, CategoryListParams } from "@/types";
import { categoriesApi } from "@/api";
import { useToast } from "@/composables";

interface CategoryState {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

export const useCategoryStore = defineStore("category", {
  state: (): CategoryState => ({
    categories: [],
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
    totalCategories: (state) => state.pagination.total,
    activeCategories: (state) =>
      state.categories.filter((cat) => cat.is_active),
    inactiveCategories: (state) =>
      state.categories.filter((cat) => !cat.is_active),
  },

  actions: {
    async getCategories(params?: CategoryListParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const response = await categoriesApi.getCategories(params);

        this.categories = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getCategoryById(id: number): Promise<Category | null> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const category = await categoriesApi.getCategoryById(id);

        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = category;
        }

        return category;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า");
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createCategory(name: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        await categoriesApi.createCategory({ name });

        toast.success("สร้างประเภทสำเร็จ");

        await this.getCategories({
          page: 1,
          limit: this.pagination.limit,
        });

        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการสร้างประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการสร้างประเภทสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCategory(
      id: number,
      data: { name: string; is_active: boolean },
    ): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const updated = await categoriesApi.updateCategory(id, data);

        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = {
            ...this.categories[idx],
            ...updated,
          };
        }

        toast.success("อัปเดตประเภทสำเร็จ");
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการอัปเดตประเภทสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleCategoryActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const updated = await categoriesApi.toggleCategoryActive(id);

        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = {
            ...updated,
            _count: this.categories[idx]._count,
          };
        }

        toast.success(
          updated.is_active
            ? "เปิดใช้งานประเภทสำเร็จ"
            : "ปิดใช้งานประเภทสำเร็จ",
        );
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะประเภทสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCategory(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        await categoriesApi.deleteCategory(id);

        toast.success("ลบประเภทสำเร็จ");

        this.categories = this.categories.filter((c) => c.id !== id);
        this.pagination.total -= 1;

        if (this.categories.length === 0 && this.pagination.page > 1) {
          await this.getCategories({
            page: this.pagination.page - 1,
            limit: this.pagination.limit,
          });
        }

        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการลบประเภทสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการลบประเภทสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    clearCategories() {
      this.categories = [];
      this.error = null;
    },
  },
});
