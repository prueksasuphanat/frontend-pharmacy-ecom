import { apiClient } from "@/api/client";

export interface WishlistItem {
  id: number;
  product_id: number;
  added_at: string;
  product: {
    id: number;
    name: string;
    code: string;
    quantity: number;
    image_url: string | null;
    units: Array<{
      id: number;
      unit: { id: number; name: string };
      price: number;
      is_special_price: boolean;
    }>;
  };
}

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
