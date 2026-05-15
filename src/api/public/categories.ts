/**
 * Public Categories API
 * GET /categories — ไม่ต้อง auth, ส่งเฉพาะ id + name ของ category ที่ active
 */

import { apiClient } from "../client";

export interface PublicCategory {
  id: number;
  name: string;
}

export interface PublicCategoriesResponse {
  success: boolean;
  data: PublicCategory[];
}

export const publicCategoriesApi = {
  getAll: () => apiClient.get<PublicCategoriesResponse>("/categories"),
};
