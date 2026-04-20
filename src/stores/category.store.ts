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
      const toast = useToast();

      try {
        const response = await categoriesApi.getCategories(params);

        this.categories = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า";
        toast.error(this.error);
        console.error("Error fetching categories:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getCategoryById(id: number): Promise<Category | null> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const category = await categoriesApi.getCategoryById(id);

        // Sync into local list if present
        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = category;
        }

        return category;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า";
        toast.error(this.error);
        console.error("Error fetching category by id:", err);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createCategory(name: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        await categoriesApi.createCategory({ name });

        toast.success("สร้างประเภทสำเร็จ");

        // Refresh list
        await this.getCategories({
          page: 1,
          limit: this.pagination.limit,
        });

        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างประเภทสินค้า";
        toast.error(this.error);
        console.error("Error creating category:", err);
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
      const toast = useToast();

      try {
        const updated = await categoriesApi.updateCategory(id, data);

        // Update in local state
        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = {
            ...this.categories[idx],
            ...updated,
          };
        }

        toast.success("อัปเดตประเภทสำเร็จ");
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตประเภทสินค้า";
        toast.error(this.error);
        console.error("Error updating category:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleCategoryActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const updated = await categoriesApi.toggleCategoryActive(id);

        // Update in local state (preserve _count)
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
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะประเภทสินค้า";
        toast.error(this.error);
        console.error("Error toggling category status:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCategory(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        await categoriesApi.deleteCategory(id);

        toast.success("ลบประเภทสำเร็จ");

        // Remove from local state
        this.categories = this.categories.filter((c) => c.id !== id);
        this.pagination.total -= 1;

        // If current page becomes empty, go to previous page
        if (this.categories.length === 0 && this.pagination.page > 1) {
          await this.getCategories({
            page: this.pagination.page - 1,
            limit: this.pagination.limit,
          });
        }

        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการลบประเภทสินค้า";
        toast.error(this.error);
        console.error("Error deleting category:", err);
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
