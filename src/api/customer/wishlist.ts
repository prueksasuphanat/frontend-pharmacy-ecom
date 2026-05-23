import { apiClient } from "@/api/client";
import type { WishlistItem } from "@/types";

export const wishlistApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; data: WishlistItem[] }>(
      "/customer/wishlist",
    ),

  check: (productId: number) =>
    apiClient.get<{ success: boolean; data: { in_wishlist: boolean } }>(
      `/customer/wishlist/check/${productId}`,
    ),

  add: (productId: number) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/customer/wishlist/${productId}`,
    ),

  remove: (productId: number) =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/customer/wishlist/${productId}`,
    ),
};
