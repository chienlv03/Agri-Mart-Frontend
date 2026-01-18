"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { OrderResponse, OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Truck,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Store
} from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
// Import Component Dialog Hủy đơn (Hãy đảm bảo đường dẫn đúng với nơi bạn tạo file)
import { CancelOrderDialog } from "@/components/shared/cancel-order-dialog";
import { useAuthStore } from "@/store/useAuthStore";

// --- Helper Functions (Giữ nguyên) ---
const getStatusLabel = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đang chuẩn bị hàng",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    DELIVERED: "Giao thành công"
  };
  return map[status] || status;
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING: return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
    case OrderStatus.CONFIRMED: return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    case OrderStatus.SHIPPING: return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100";
    case OrderStatus.COMPLETED: return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
    case OrderStatus.CANCELLED: return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING: return <Clock className="w-4 h-4 mr-1" />;
    case OrderStatus.CONFIRMED: return <Package className="w-4 h-4 mr-1" />;
    case OrderStatus.SHIPPING: return <Truck className="w-4 h-4 mr-1" />;
    case OrderStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 mr-1" />;
    case OrderStatus.CANCELLED: return <XCircle className="w-4 h-4 mr-1" />;
    default: return null;
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const { user } = useAuthStore(); 
  const currentUserId = user?.id;

  // 1. Tách hàm fetch ra để tái sử dụng (khi hủy xong gọi lại để refresh data)
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    // Không set loading = true ở đây để tránh nháy màn hình khi reload
    try {
      const data = await OrderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Không tìm thấy đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const handleConfirmOrder = async () => {
    if (!order) return;
    try {
      setIsConfirming(true);
      await OrderService.updateOrderStatus(order.id, OrderStatus.CONFIRMED);
      toast.success("Đã xác nhận đơn hàng thành công!");
      // Refresh lại data
      await fetchOrderDetail();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xác nhận đơn hàng");
    } finally {
      setIsConfirming(false);
    }
  };

  // 2. Gọi fetch lần đầu
  useEffect(() => {
    setLoading(true);
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const isSeller = currentUserId === order?.sellerId;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-gray-700">Đơn hàng không tồn tại</h2>
        <Link href="/buyer/orders">
          <Button variant="link" className="mt-4">Quay lại danh sách đơn hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl bg-gray-50 min-h-screen">
      {/* 1. Header & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/buyer/orders">
            <BackButton />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
        </div>
        <div className="text-sm text-gray-500">
          Mã đơn: <span className="font-mono font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Order Items & Status */}
        <div className="md:col-span-2 space-y-6">

          {/* 2. Order Status Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b bg-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                  Thông tin trạng thái
                </CardTitle>
                <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status).toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Simple Timeline Visualization */}
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[21px] bg-green-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-green-100"></div>
                  <p className="text-sm font-semibold text-gray-900">Đơn hàng được tạo</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED && (
                  <div className="relative">
                    <div className="absolute -left-[21px] bg-blue-500 h-3 w-3 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                    <p className="text-sm font-semibold text-gray-900">Đã xác nhận thanh toán</p>
                    <p className="text-xs text-gray-500">Người bán đang chuẩn bị hàng</p>
                  </div>
                )}
                {order.status === OrderStatus.COMPLETED && (
                  <div className="relative">
                    <div className="absolute -left-[21px] bg-green-600 h-3 w-3 rounded-full border-2 border-white ring-2 ring-green-100"></div>
                    <p className="text-sm font-semibold text-gray-900">Giao hàng thành công</p>
                    <p className="text-xs text-gray-500">Cảm ơn bạn đã mua sắm</p>
                  </div>
                )}
                {/* HIỂN THỊ LÝ DO HỦY NẾU CÓ */}
                {order.status === OrderStatus.CANCELLED && (
                  <div className="relative">
                    <div className="absolute -left-[21px] bg-red-600 h-3 w-3 rounded-full border-2 border-white ring-2 ring-red-100"></div>
                    <p className="text-sm font-semibold text-gray-900">Đơn hàng đã hủy</p>
                    {/* Giả sử API trả về cancelReason, hiển thị ở đây */}
                    {(order as OrderResponse).cancelReason && (
                         <p className="text-xs text-red-500 mt-1 italic">Lý do: {(order as OrderResponse).cancelReason}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Product List */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Sản phẩm đã mua</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50/50">
                  <div className="relative w-20 h-20 border rounded-md overflow-hidden bg-white shrink-0">
                    <Image
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 line-clamp-2 text-sm pr-4">
                        {item.productName}
                      </h4>
                      <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="mt-1 flex justify-between items-end">
                      <p className="text-sm text-gray-500">Số lượng: x{item.quantity}</p>
                      <p className="font-bold text-sm text-green-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Info & Summary */}
        <div className="space-y-6">

          {/* 4. Shipping Address */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" /> Địa chỉ nhận hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm">
              <p className="font-bold text-gray-900 mb-1">{order.recipientName}</p>
              <p className="text-gray-600 mb-1">{order.recipientPhone}</p>
              <p className="text-gray-500 leading-relaxed">{order.shippingAddress}</p>
            </CardContent>
          </Card>

          {/* 5. Payment & Totals */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / VNPAY'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền hàng:</span>
                <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-gray-900">{formatCurrency(order.shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-red-600">{formatCurrency(order.finalAmount)}</span>
              </div>
            </CardContent>

            {/* 6. Action Buttons */}
            <div className="p-4 pt-0 space-y-3">
              
              {/* LOGIC CHO NGƯỜI BÁN (SELLER) */}
              {isSeller && order.status === OrderStatus.PENDING && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Nút Nhận Đơn */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleConfirmOrder}
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Xử lý...
                      </>
                    ) : (
                      <>
                        <Store className="mr-2 h-4 w-4" /> Nhận đơn
                      </>
                    )}
                  </Button>

                  {/* Nút Hủy (Người bán cũng có thể hủy/từ chối) */}
                  <CancelOrderDialog
                    orderId={order.id}
                    onSuccess={fetchOrderDetail}
                    trigger={
                      <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                        Từ chối
                      </Button>
                    }
                  />
                </div>
              )}

              {/* LOGIC CHO NGƯỜI MUA (BUYER) - Hoặc nếu không phải Seller */}
              {!isSeller && order.status === OrderStatus.PENDING && (
                <CancelOrderDialog
                  orderId={order.id}
                  onSuccess={fetchOrderDetail}
                  trigger={
                    <Button variant="destructive" className="w-full">
                      Hủy đơn hàng
                    </Button>
                  }
                />
              )}
              
              {/* Nút Mua Lại (Chỉ hiện cho Buyer hoặc chung) */}
              {(order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) && (
                <div className="bg-gray-50 border-t rounded-b-lg -mx-4 -mb-4 p-4">
                  <Link href={`/products/${order.items[0]?.productId}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Mua lại sản phẩm
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Support Contact */}
          <div className="text-center text-xs text-gray-400">
            <p>Cần hỗ trợ về đơn hàng này?</p>
            <p>Liên hệ hotline: <a href="tel:1900xxxx" className="text-blue-600 hover:underline">1900 xxxx</a></p>
          </div>

        </div>
      </div>
    </div>
  );
}