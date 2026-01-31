import apiClient from "@/lib/axios";
import { AdminDashboardResponse, BuyerStatsResponse, CreateOrderPayload, OrderResponse, OrderStatus, PageResponse, SellerDashboardStatsResponse, SellerStatsResponse } from "@/types/order.types";

export const OrderService = {
  // Hàm gọi API tạo đơn
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post<string[]>("/orders", payload);
    return response.data;
  },

  getOrderBySeller: async (page = 0, size = 10): Promise<PageResponse<OrderResponse>> => {
    // Truyền params page và size vào URL
    const response = await apiClient.get<PageResponse<OrderResponse>>("/orders/seller", {
      params: { page, size },
    });
    return response.data;
  },

  getOrderByBuyer: async (page = 0, size = 10): Promise<PageResponse<OrderResponse>> => {
    const response = await apiClient.get<PageResponse<OrderResponse>>("/orders/buyer", {
      params: { page, size },
    });
    return response.data;
  },

  // Cập nhật trạng thái
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await apiClient.patch(`/orders/${orderId}/status?status=${status}`);
  },


  // 2. Người mua tự hủy đơn (Chỉ áp dụng cho đơn PENDING)
  cancelOrder: async (orderId: string, cancelReason: string) => {
    await apiClient.put(`/orders/${orderId}/cancel`, { cancelReason });
  },

  getOrderById: async (orderId: string) => {
    const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  getBuyerStats: async () => {
    const response = await apiClient.get<BuyerStatsResponse>("/orders/buyer/stats");
    return response.data;
  },

  getSellerStats: async () => {
    const response = await apiClient.get<SellerStatsResponse>("/orders/seller/stats");
    return response.data;
  },


  getSellerDashboardStats: async (range: string = "7d") => {
    const response = await apiClient.get<SellerDashboardStatsResponse>(`/orders/seller-dashboard`, {
      params: { range }
    });
    return response.data;
  },

  getAdminDashboardStats: async () => {
    const response = await apiClient.get<AdminDashboardResponse>(`/orders/admin-dashboard`);
    return response.data;
  }
}