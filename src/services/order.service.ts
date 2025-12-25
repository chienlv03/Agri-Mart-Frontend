import apiClient from "@/lib/axios"; // Import axios instance bạn vừa cấu hình
import { CreateOrderPayload, OrderResponse, OrderStatus } from "@/types/order.types";

export const OrderService = {
  // Hàm gọi API tạo đơn
  createOrder: async (payload: CreateOrderPayload) => {
    // API trả về List<String> (Danh sách mã đơn hàng)
    const response = await apiClient.post<string[]>("/orders", payload);
    return response.data; 
  },

  getOrderBySeller: async () => {
    const response = await apiClient.get<OrderResponse[]>("/orders/seller");
    return response.data;
  },

  // Cập nhật trạng thái
  updateStatus: async (orderId: string, status: OrderStatus) => {
    await apiClient.patch(`/orders/${orderId}/status?status=${status}`);
  },

  getOrderByBuyer: async () => {
    const response = await apiClient.get<OrderResponse[]>("/orders/buyer");
    return response.data;
  },

  // 2. Người mua tự hủy đơn (Chỉ áp dụng cho đơn PENDING)
  cancelOrder: async (orderId: string) => {
    await apiClient.patch(`/orders/${orderId}/cancel`);
  }
};