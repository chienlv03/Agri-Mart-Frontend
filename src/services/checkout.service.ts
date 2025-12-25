import apiClient from "@/lib/axios";
import { CheckoutPreviewRequest, CheckoutResponse } from "@/types/checkout.type";

export const CheckoutService = {
  // Gọi API tính toán phí ship và tổng tiền
  previewOrder: async (data: CheckoutPreviewRequest) => {
    return await apiClient.post<CheckoutResponse>("/checkout/preview", data);
  },
};