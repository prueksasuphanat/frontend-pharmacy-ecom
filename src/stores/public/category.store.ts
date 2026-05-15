import { defineStore } from "pinia";
import { publicCategoriesApi } from "@/api/public/categories";
import type { PublicCategory } from "@/api/public/categories";

interface PublicCategoryState {
  categories: PublicCategory[];
  isLoading: boolean;
}

export const usePublicCategoryStore = defineStore("publicCategory", {
  state: (): PublicCategoryState => ({
    categories: [],
    isLoading: false,
  }),

  actions: {
    async fetchCategories(): Promise<void> {
      if (this.categories.length > 0) return; // cache — ไม่ fetch ซ้ำ
      this.isLoading = true;
      try {
        const res = await publicCategoriesApi.getAll();
        this.categories = res.data.data;
      } catch (err) {
        console.error("[publicCategoryStore] fetchCategories error:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
