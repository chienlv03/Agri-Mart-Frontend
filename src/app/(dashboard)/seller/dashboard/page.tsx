"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, DollarSign, Package, ShoppingCart, 
  TrendingUp, ArrowUpRight, ArrowRight, Store 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- MOCK DATA (Sau này thay bằng API) ---
const REVENUE_DATA = [
  { name: "T2", total: 1200000 },
  { name: "T3", total: 900000 },
  { name: "T4", total: 1600000 },
  { name: "T5", total: 2100000 },
  { name: "T6", total: 3200000 },
  { name: "T7", total: 4500000 },
  { name: "CN", total: 3800000 },
];

const RECENT_ORDERS = [
  { id: "DH001", customer: "Nguyễn Văn A", total: 250000, status: "PENDING", date: "Vừa xong" },
  { id: "DH002", customer: "Trần Thị B", total: 560000, status: "SHIPPING", date: "2 giờ trước" },
  { id: "DH003", customer: "Lê Văn C", total: 120000, status: "COMPLETED", date: "5 giờ trước" },
];

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const [stats] = useState({
    revenue: 15400000,
    orders: 45,
    products: 12,
    growth: 12.5
  });

  // Kiểm tra hồ sơ có đầy đủ không (Dựa vào field farmName hoặc address trong user)
  // Lưu ý: User trong store có thể chưa update kịp, thực tế nên gọi API /me để check
  const isProfileIncomplete = !user?.fullName || user.userRole !== "SELLER"; 
  // (Trong thực tế bạn nên check thêm field: user.farmName, user.farmAddress từ API)

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

      {/* 2. Cảnh báo hồ sơ (Nếu chưa hoàn thiện) */}
      {isProfileIncomplete && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Hồ sơ chưa hoàn thiện</h3>
              <p className="text-sm text-yellow-700">
                Để sản phẩm được duyệt và khách hàng tin tưởng, bác cần cập nhật đầy đủ tên vườn, địa chỉ và ảnh thực tế.
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()}đ</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +{stats.growth}% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.orders}</div>
            <p className="text-xs text-muted-foreground">Đơn hàng đang xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm đang bán</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Sản phẩm đã được duyệt</p>
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá Shop</CardTitle>
            <span className="text-yellow-500">⭐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Dựa trên 120 lượt đánh giá</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 4. Biểu đồ doanh thu (Chiếm 4 phần) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu tuần này</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={REVENUE_DATA}>
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
                    formatter={(value: number) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                    cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Đơn hàng gần đây (Chiếm 3 phần) */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Đơn hàng mới nhất</CardTitle>
                <Link href="/seller/orders" className="text-sm text-blue-600 hover:underline flex items-center">
                    Xem tất cả <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
            </div>
            <CardDescription>Bạn có 3 đơn hàng cần chuẩn bị ngay.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customer}`} />
                      <AvatarFallback>{order.customer[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-sm">{order.total.toLocaleString()}đ</span>
                      <Badge 
                        variant={order.status === 'PENDING' ? 'destructive' : order.status === 'SHIPPING' ? 'default' : 'secondary'}
                        className="text-[10px] px-1 py-0"
                      >
                        {order.status === 'PENDING' ? 'Chờ xác nhận' : order.status === 'SHIPPING' ? 'Đang giao' : 'Hoàn thành'}
                      </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}