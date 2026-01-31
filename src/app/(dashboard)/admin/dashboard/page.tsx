"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Nhớ import Badge
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { OrderService } from "@/services/order.service";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalGMV: 0,
    totalUsers: 0,
    totalOrders: 0,
    activeProducts: 0,
    onlineUsers: 0,
    chartData: [],
    recentOrders: []
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getAdminDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Helper function để hiển thị badge trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Thành công</Badge>;
      case 'PENDING': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Chờ xử lý</Badge>;
      case 'SHIPPING': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang giao</Badge>;
      case 'CANCELLED': return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-green-600"/></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>

      {/* 1. KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* GMV (Fake) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu (GMV)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">----</div>
            <p className="text-xs text-muted-foreground">Chưa tích hợp</p>
          </CardContent>
        </Card>
        
        {/* Total Users (Real) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Tổng tài khoản đã đăng ký</p>
          </CardContent>
        </Card>

        {/* Active Products (Real) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm lên sàn</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Sản phẩm đang bán</p>
          </CardContent>
        </Card>

        {/* Online Users (Fake) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-----</div>
            <p className="text-xs text-muted-foreground">Chưa tích hợp</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Biểu đồ & Giao dịch */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Biểu đồ (Fake Data) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ dòng tiền</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="gmv" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Giao dịch gần đây (Fake Data) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Các đơn hàng vừa phát sinh trên sàn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentOrders.map((order: any, i: number) => (
                <div key={i} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {order.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.user}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <span className="font-medium text-sm">{formatCurrency(order.amount)}</span>
                    {getStatusBadge(order.status)}
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