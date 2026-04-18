/**
 * Cart API service
 *
 * Provides methods for cart-related API operations.
 * **Validates: Requirements 2.5**
 */

import { apiClient } from "./client";
import type { CartItem } from "@/types";
import { API_ENDPOINTS } from "@/constants";

/**
 * Cart response interface
 */
export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  total: number;
}

/**
 * Add to cart request interface
 */
export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

/**
 * Update cart item request interface
 */
export interface UpdateCartItemRequest {
  quantity: number;
}

/**
 * Cart API service object
 */
export const cartApi = {
  /**
   * Get current user's cart
   * @returns Promise with cart data
   */
  getCart: () => apiClient.get<CartResponse>(API_ENDPOINTS.CART.BASE),

  /**
   * Add item to cart
   * @param data - Product ID and quantity
   * @returns Promise with updated cart
   */
  addItem: (data: AddToCartRequest) =>
    apiClient.post<CartResponse>(API_ENDPOINTS.CART.ITEMS, data),

  /**
   * Update cart item quantity
   * @param itemId - Cart item ID
   * @param data - New quantity
   * @returns Promise with updated cart
   */
  updateItem: (itemId: string, data: UpdateCartItemRequest) =>
    apiClient.patch<CartResponse>(API_ENDPOINTS.CART.ITEM_BY_ID(itemId), data),

  /**
   * Remove item from cart
   * @param itemId - Cart item ID
   * @returns Promise with updated cart
   */
  removeItem: (itemId: string) =>
    apiClient.delete<CartResponse>(API_ENDPOINTS.CART.ITEM_BY_ID(itemId)),

  /**
   * Clear all items from cart
   * @returns Promise with empty cart
   */
  clearCart: () => apiClient.delete<CartResponse>(API_ENDPOINTS.CART.CLEAR),
};
