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
  sellerAvatarUrl: string
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

// types/common.types.ts hoặc types/order.types.ts

export interface PageResponse<T> {
  content: T[];          // Danh sách dữ liệu chính (Orders)
  totalPages: number;    // Tổng số trang
  totalElements: number; // Tổng số bản ghi
  size: number;          // Kích thước trang
  number: number;        // Trang hiện tại (bắt đầu từ 0)
  last: boolean;         // Có phải trang cuối không?
  first: boolean;        // Có phải trang đầu không?
  empty: boolean;
}

export interface MonthlyStat {
  month: number;   // 1 -> 12
  total: number;   // Tổng tiền trong tháng
}


export interface BuyerStatsResponse {
  totalSpent: number;

  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  // Biểu đồ chi tiêu theo tháng
  monthlySpending: MonthlyStat[];

  // Phân bổ trạng thái đơn hàng
  statusDistribution: Record<string, number>;
}

export interface SellerStatsResponse {
  totalSpent: number;

  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalProducts: number;

  // Biểu đồ chi tiêu theo tháng
  monthlySpending: MonthlyStat[];

  // Phân bổ trạng thái đơn hàng
  statusDistribution: Record<string, number>;
}

export interface DailyRevenue {
  date: string; 
  total: number;
}

export interface SellerDashboardStatsResponse {
  revenue: number;
  pendingOrders: number;
  products: number;
  soldOrders: number;
  boughtOrders: number;
  chartData: DailyRevenue[];
}


export interface AdminDashboardResponse {
  // --- DỮ LIỆU THẬT ---
  totalUsers: number;        // Long -> number
  activeProducts: number;

  // --- DỮ LIỆU FAKE ---
  totalGMV: number;          // BigDecimal -> number
  onlineUsers: number;
  totalOrders: number;

  // Biểu đồ & List
  chartData: DailyStat[];
  recentOrders: RecentOrder[];
}

export interface DailyStat {
  date: string;
  gmv: number;
}

export interface RecentOrder {
  id: string;
  user: string;
  amount: number;
  status: string;
  time: string;
}
