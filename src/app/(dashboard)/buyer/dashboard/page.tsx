"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Truck, CheckCircle, Wallet,
  Store, ArrowRight, Sprout, LayoutDashboard, Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth.types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { OrderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order.types";

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const isSeller = user?.roles?.includes(Role.SELLER);

  const [stats, setStats] = useState({ pending: 0, shipping: 0, completed: 0, vouchers: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Gọi API: Lấy 10 đơn hàng gần nhất
        // Lưu ý: Hàm getOrderByBuyer của bạn trả về PageResponse<OrderResponse>
        // Ta cần truy cập vào thuộc tính .content (hoặc .data tùy cấu trúc PageResponse của bạn)
        const response = await OrderService.getOrderByBuyer();

        // Giả sử response có dạng { content: OrderResponse[], ... }
        // Nếu response.data thì sửa thành response.data.content
        const orders = response.content || [];

        setRecentOrders(orders);

        // 2. Tính toán thống kê (Dựa trên 10 đơn gần nhất)
        // *Lưu ý: Để chính xác tuyệt đối, backend nên có API riêng /orders/stats
        const newStats = {
          pending: 0,
          shipping: 0,
          completed: 0,
          vouchers: 0 // API đơn hàng không trả về số voucher, nên tạm để 0 hoặc gọi API khác
        };

        orders.forEach((order: OrderResponse) => {
          if (order.status === 'PENDING' || order.status === 'CONFIRMED') newStats.pending++;
          else if (order.status === 'SHIPPING') newStats.shipping++;
          else if (order.status === 'COMPLETED') newStats.completed++;
        });

        setStats(prev => ({ ...prev, ...newStats }));

      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Helper function: Badge màu sắc theo trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Chờ xác nhận</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Đã xác nhận</Badge>;
      case "SHIPPING":
        return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100">Đang giao</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Hoàn thành</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Hồ sơ của tôi</h1>
      </div>

      {/* --- BANNER (Giữ nguyên logic cũ) --- */}
      <div className="grid gap-4">
        <Card className={`border shadow-sm ${isSeller ? 'bg-blue-50 border-blue-200' : 'bg-linear-to-r from-green-50 to-emerald-50 border-green-200'}`}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isSeller ? 'text-blue-800' : 'text-green-800'}`}>
                  {isSeller ? "Kênh Người Bán" : "Bạn có nông sản muốn bán?"}
                </h3>
                <p className={`text-sm mt-1 ${isSeller ? 'text-blue-700' : 'text-green-700'}`}>
                  {isSeller
                    ? "Quản lý sản phẩm, đơn hàng và doanh thu tại Dashboard riêng."
                    : "Đăng ký trở thành Đối tác ngay hôm nay để tiếp cận hàng triệu khách hàng."}
                </p>
              </div>
            </div>

            <Link href={isSeller ? "/seller/dashboard" : "/buyer/profile"}>
              <Button className={`shadow-md whitespace-nowrap ${isSeller ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isSeller ? (
                  <> <LayoutDashboard className="mr-2 h-4 w-4" /> Vào Dashboard </>
                ) : (
                  <> <Sprout className="mr-2 h-4 w-4" /> Đăng ký bán hàng <ArrowRight className="ml-2 h-4 w-4" /> </>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* --- THỐNG KÊ (Dữ liệu lấy từ 10 đơn gần nhất) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Đơn mới & Đã xác nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipping}</div>
            <p className="text-xs text-muted-foreground">Sắp đến nơi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã mua</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Đơn thành công (gần đây)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Chưa tích hợp</p>
          </CardContent>
        </Card>
      </div>

      {/* --- DANH SÁCH ĐƠN HÀNG (Dữ liệu thật) --- */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            {recentOrders.length > 0 && (
              <Link href="/buyer/orders/bought" className="text-sm text-green-600 hover:underline">Xem tất cả lịch sử</Link>
            )}
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mb-2 opacity-20" />
                <p>Bạn chưa có đơn hàng nào.</p>
                <Link href="/" className="text-green-600 hover:underline mt-2">
                  Dạo chợ ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: OrderResponse) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-4">
                        <Image src={order.items[0]?.productImage || "/placeholder.jpg"} alt={order.items[0]?.productName || "Sản phẩm"} width={80} height={80} unoptimized/>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            Mã đơn: #{order.id.substring(0, 8)}... {/* Cắt ngắn ID nếu là UUID */}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "N/A"}
                            {order.items ? ` • ${order.items.length} sản phẩm` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                      {getStatusBadge(order.status)}
                      <span className="font-bold text-sm">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}