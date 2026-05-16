/**
 * Customer Cart API
 * All endpoints require auth (authMiddleware on backend)
 *
 * GET    /api/v1/customer/cart              → getCart()
 * POST   /api/v1/customer/cart/items        → addItem()
 * PATCH  /api/v1/customer/cart/items/:id    → updateItem()
 * DELETE /api/v1/customer/cart/items/:id    → removeItem()
 * DELETE /api/v1/customer/cart              → clearCart()
 */

import { apiClient } from "./client";
import type { CartData } from "@/types/cart";

interface AddItemRequest {
  product_unit_id: number;
  quantity: number;
}

interface UpdateItemRequest {
  quantity: number;
}

interface CartApiResponse {
  success: boolean;
  message?: string;
  data: CartData;
}

export const cartApi = {
  getCart: () =>
    apiClient.get<CartApiResponse>("/customer/cart"),

  addItem: (data: AddItemRequest) =>
    apiClient.post<CartApiResponse>("/customer/cart/items", data),

  updateItem: (cartItemId: number, data: UpdateItemRequest) =>
    apiClient.patch<CartApiResponse>(`/customer/cart/items/${cartItemId}`, data),

  removeItem: (cartItemId: number) =>
    apiClient.delete<CartApiResponse>(`/customer/cart/items/${cartItemId}`),

  clearCart: () =>
    apiClient.delete<CartApiResponse>("/customer/cart"),
};
