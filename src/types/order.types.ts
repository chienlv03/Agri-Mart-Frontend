export interface CartItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  totalPrice: number;
  isPreOrder: boolean;
}

export interface CreateOrderPayload {
  orderType: "BUY_NOW" | "FROM_CART";
  addressId: string;
  note?: string;
  paymentMethod: "COD" | "VNPAY";
  items: OrderItem[];
}

// DTO cho Cart (Request)
export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface OrderItem{
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  productImage: string;
}

export interface OrderResponse {
  userId: string
  id: string
  sellerId: string
  sellerName: string
  totalAmount: number
  shippingFee: number
  finalAmount: number
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  status: OrderStatus
  paymentMethod: string
  isPreOrder: boolean
  expectedDeliveryDate?: string
  cancelReason?: string
  paymentStatus: string
  items: OrderItem[]
  createdAt: string
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}