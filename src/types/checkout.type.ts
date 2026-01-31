import { is } from "date-fns/locale";

// Input gửi lên để tính toán
export interface CheckoutPreviewRequest {
  addressId: string;
  items: {
    productId: string;
    variantId?: string | null;
    quantity: number;
  }[];
}

// Item hiển thị
export interface CheckoutItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  price: number;      // Giá đơn vị
  totalPrice: number; // Giá x số lượng
  isPreOrder: boolean;
}

// Nhóm đơn hàng theo Shop
export interface ShopOrderGroup {
  sellerId: string;
  farmName: string;
  sellerName: string;
  distance: number;       // Khoảng cách (km)
  items: CheckoutItemResponse[];
  shippingFee: number;    // Phí ship của shop này
  shopTotal: number;      // Tổng tiền trả cho shop này
}

// Response tổng (Preview)
export interface CheckoutResponse {
  shippingAddress: {
    id: string;
    recipientName: string;
    phone: string;
    detailAddress: string;
    provinceName: string;
    districtName: string;
    wardName: string;
  };
  orders: ShopOrderGroup[];
  totalProductPrice: number;
  totalShippingFee: number;
  finalAmount: number;
}