"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, DollarSign, Package, ShoppingCart,
  TrendingUp, ArrowRight, Store, Loader2, ShoppingBag
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"; // Import Select Component

import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/types/auth.types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Import Services & Types
import { OrderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order.types";

interface DashboardStats {
  revenue: number;
  products: number;
  pendingOrders: number;
  boughtOrders: number;
  soldOrders: number;
  chartData: { name: string; total: number }[];
}

export default function SellerDashboard() {
  const { user } = useAuthStore();
  
  // 1. State quản lý Loading
  const [initialLoading, setInitialLoading] = useState(true); // Loading lần đầu vào trang
  const [chartUpdating, setChartUpdating] = useState(false);  // Loading khi lọc biểu đồ

  // 2. State quản lý bộ lọc thời gian
  const [timeRange, setTimeRange] = useState("7d");

  // State dữ liệu
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    products: 0,
    pendingOrders: 0,
    boughtOrders: 0,
    soldOrders: 0,
    chartData: []
  });

  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const isProfileIncomplete = user && !user.roles.includes(Role.SELLER);

  // --- EFFECT 1: Chạy 1 lần khi vào trang (Lấy đơn hàng & Init Data) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      try {
        setInitialLoading(true);
        // Gọi API lấy đơn hàng mới nhất (Không phụ thuộc timeRange)
        const recentOrdersRes = await OrderService.getOrderBySeller(0, 5);
        setRecentOrders(recentOrdersRes.content || []);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        // Lưu ý: setInitialLoading(false) sẽ được xử lý sau khi Stats load xong ở Effect 2
        // hoặc ta có thể set false ở đây nếu muốn hiển thị từng phần.
        // Để mượt mà, ta để Effect 2 quyết định việc tắt loading toàn trang.
      }
    };
    fetchInitialData();
  }, [user]);

  // --- EFFECT 2: Chạy mỗi khi user đổi TimeRange (Lấy Stats & Biểu đồ) ---
  useEffect(() => {
    const fetchStatsData = async () => {
      if (!user) return;
      try {
        // Nếu là lần đầu -> dùng initialLoading, nếu là đổi filter -> dùng chartUpdating
        if (!initialLoading) setChartUpdating(true);

        // Gọi API thống kê với tham số range
        const statsRes = await OrderService.getSellerDashboardStats(timeRange);

        setStats({
            revenue: statsRes.revenue || 0,
            products: statsRes.products || 0,
            pendingOrders: statsRes.pendingOrders || 0,
            boughtOrders: statsRes.boughtOrders || 0,
            soldOrders: statsRes.soldOrders || 0,
            chartData: statsRes.chartData.map((item: any) => ({
                name: item.date,
                total: item.total
            }))
        });

      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setInitialLoading(false); // Tắt loading toàn trang (nếu là lần đầu)
        setChartUpdating(false);  // Tắt loading biểu đồ
      }
    };

    fetchStatsData();
  }, [user, timeRange]); // <--- Phụ thuộc vào timeRange

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="destructive" className="text-[10px]">Chờ xác nhận</Badge>;
      case 'CONFIRMED': return <Badge variant="default" className="text-[10px] bg-blue-500">Đã xác nhận</Badge>;
      case 'SHIPPING': return <Badge variant="default" className="text-[10px] bg-blue-700">Đang giao</Badge>;
      case 'COMPLETED': return <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'CANCELLED': return <Badge variant="outline" className="text-[10px] text-gray-500">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading toàn trang lần đầu
  if (initialLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xin chào, {user?.fullName || "Bác nông dân"}! 👋</h1>
          <p className="text-muted-foreground">Đây là tình hình kinh doanh nông trại của bác hôm nay.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/profile">
            <Button variant="outline">
              <Store className="mr-2 h-4 w-4" /> Hồ sơ Shop
            </Button>
          </Link>
          <Link href="/seller/products/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Đăng bán mới
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Cảnh báo hồ sơ */}
      {isProfileIncomplete && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Hồ sơ chưa hoàn thiện</h3>
              <p className="text-sm text-yellow-700">
                Cập nhật đầy đủ thông tin để tăng độ uy tín cho gian hàng.
              </p>
            </div>
            <Link href="/seller/profile">
              <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                Cập nhật ngay
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Thống kê nhanh (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Hiệu ứng mờ khi đang update data */}
            <div className={chartUpdating ? "opacity-50 transition-opacity" : ""}>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> Tổng đơn hoàn thành
                </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần xử lý ngay</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Đơn khách đặt đang chờ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Tổng sản phẩm trong kho</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đã bán</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldOrders}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">Đã giao thành công</p>
              <Link href="/seller/orders" className="text-[10px] text-blue-600 hover:underline">
                Chi tiết
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đã mua</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.boughtOrders}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">Cá nhân tiêu dùng</p>
              <Link href="/orders" className="text-[10px] text-blue-600 hover:underline">
                Xem lịch sử
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* 4. Biểu đồ doanh thu */}
        <Card className="col-span-4 relative">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Doanh thu</CardTitle>
                
                {/* --- BỘ CHỌN THỜI GIAN --- */}
                <Select value={timeRange} onValueChange={setTimeRange} disabled={chartUpdating}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 ngày qua</SelectItem>
                    <SelectItem value="30d">30 ngày qua</SelectItem>
                    <SelectItem value="this_month">Tháng này</SelectItem>
                    <SelectItem value="last_month">Tháng trước</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <CardDescription>
                Biểu đồ doanh thu theo thời gian thực
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pl-2 relative">
            
            {/* --- LOADING OVERLAY (Chỉ hiện đè lên biểu đồ) --- */}
            {chartUpdating && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px] transition-all duration-200">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            )}

            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${formatCurrency(value)}`, "Doanh thu"]}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                 Chưa có dữ liệu doanh thu
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Đơn hàng gần đây */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đơn khách đặt mới nhất</CardTitle>
              <Link href="/seller/orders" className="text-sm text-blue-600 hover:underline flex items-center">
                Xem tất cả <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <CardDescription>
              {stats.pendingOrders > 0
                ? `Bạn có ${stats.pendingOrders} đơn hàng cần xác nhận ngay.`
                : "Hiện tại chưa có đơn khách đặt mới nào."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.id}`} />
                      <AvatarFallback>KH</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Mã đơn: #{order.id.substring(0, 6)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt ? format(parseISO(order.createdAt as unknown as string), "HH:mm dd/MM", { locale: vi }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-sm">{formatCurrency(order.totalAmount)}</span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}

              {recentOrders.length === 0 && (
                <div className="text-center text-muted-foreground py-4">Chưa có đơn hàng nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}