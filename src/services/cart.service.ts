import apiClient from "@/lib/axios";
import { AddToCartPayload, CartItemResponse } from "@/types/order.types";

export const CartService = {
  // GET: /api/v1/cart
  getMyCart: async () => {
    const response = await apiClient.get<CartItemResponse[]>("/cart");
    return response.data;
  },

  // POST: /api/v1/cart/add
  addToCart: async (payload: AddToCartPayload) => {
    await apiClient.post("/cart/add", payload);
  },

  updateQuantity: async (payload: AddToCartPayload) => {
    await apiClient.put("/cart/update", payload);
  },

  // DELETE: /api/v1/cart/remove/{productId}
  removeFromCart: async (productId: string) => {
    await apiClient.delete(`/cart/remove/${productId}`);
  },
};