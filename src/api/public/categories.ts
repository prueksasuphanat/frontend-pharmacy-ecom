import { apiClient } from "../client";
import type { PublicCategory } from "@/types";

export interface PublicCategoriesResponse {
  success: boolean;
  data: PublicCategory[];
}

export const publicCategoriesApi = {
  getAll: () => apiClient.get<PublicCategoriesResponse>("/categories"),
};
