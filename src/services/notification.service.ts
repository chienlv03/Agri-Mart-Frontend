import apiClient from "@/lib/axios";
import { Notification } from "@/types/notification.types";

export const NotificationService = {
  // Lấy danh sách thông báo (Lịch sử)
  getMyNotifications: async () => {
    // API này cần backend viết thêm (sẽ hướng dẫn ở cuối)
    const res = await apiClient.get<Notification[]>("/notifications/my-notifications");
    return res.data;
  },

  // Đánh dấu đã đọc
  markAsRead: async (id: string) => {
    return await apiClient.put(`/notifications/${id}/read`);
  },
  
  // Đánh dấu đọc tất cả
  markAllAsRead: async () => {
    return await apiClient.put(`/notifications/read-all`);
  }
};