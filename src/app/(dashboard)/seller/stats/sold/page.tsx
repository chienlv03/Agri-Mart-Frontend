"use client";

import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, TrendingUp, AlertCircle, Loader2 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderService } from "@/services/order.service";
import { useAuthStore } from "@/store/useAuthStore";


interface SellerStatsData {
  totalSpent: number;      // Tổng tiền đã chi (chỉ tính đơn thành công)
  totalOrders: number;     // Tổng số đơn đã đặt
  completedOrders: number; // Số đơn thành công
  cancelledOrders: number; // Số đơn hủy
  totalProducts: number;   // Tổng số sản phẩm đã bán
  avgOrderValue: number;   // Giá trị trung bình đơn
}

interface MonthlySpending {
  name: string; // Tháng (T1, T2...)
  total: number;
}

const STATUS_COLORS = {
  COMPLETED: "#16a34a", // Green
  CANCELLED: "#dc2626", // Red
  PENDING: "#eab308",   // Yellow
  SHIPPING: "#2563eb",  // Blue
  CONFIRMED: "#3b82f6", // Blue
};

export default function SellerStats() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // State dữ liệu
  const [stats, setStats] = useState<SellerStatsData>({
    totalSpent: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0
  });

  const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // GỌI API MỚI - 1 Request duy nhất
        const data = await OrderService.getSellerStats();

        // 1. Monthly Chart
        const chartData = data.monthlySpending.map(m => ({
            name: `T${m.month}`,
            total: m.total
        }));

        // 2. Pie Chart
        const pieData = Object.entries(data.statusDistribution).map(([key, value]) => ({
            name: key,
            value: value
        }));

        setStats({
            totalSpent: data.totalSpent,
            totalOrders: data.totalOrders,
            completedOrders: data.completedOrders,
            cancelledOrders: data.cancelledOrders,
            totalProducts: data.totalProducts,
            avgOrderValue: data.completedOrders > 0 
                ? data.totalSpent / data.completedOrders 
                : 0
        });

        setMonthlyData(chartData);
        setStatusDistribution(pieData);

      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Thống kê bán</h1>
        <p className="text-sm text-muted-foreground hidden md:block">
           Dữ liệu được phân tích dựa trên 100 đơn hàng gần nhất
        </p>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tính trên {stats.completedOrders} đơn thành công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sản phẩm đã bán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đơn hàng đã bán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung bình đơn</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Giá trị trung bình mỗi đơn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hủy</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
                {stats.totalOrders > 0 
                    ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) 
                    : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cancelledOrders} đơn đã hủy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        
        {/* 2. BIỂU ĐỒ CỘT: CHI TIÊU THEO THÁNG */}
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Chi tiêu năm nay ({new Date().getFullYear()})</CardTitle>
                <CardDescription>Số tiền bạn đã mua sắm thành công qua từng tháng</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyData}>
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
                            formatter={(value: number) => [formatCurrency(value), "Đã chi"]}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* 3. BIỂU ĐỒ TRÒN: TRẠNG THÁI ĐƠN HÀNG */}
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Tình trạng đơn hàng</CardTitle>
                <CardDescription>Phân bổ trạng thái các đơn hàng của bạn</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full relative">
                    {statusDistribution.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#8884d8"} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                         </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Chưa có dữ liệu đơn hàng
                        </div>
                    )}
                   
                   {/* Custom Legend */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-2xl font-bold">{stats.totalOrders}</span>
                        <p className="text-xs text-muted-foreground">Tổng đơn</p>
                   </div>
                </div>
                
                {/* Chú thích màu */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                    {Object.keys(STATUS_COLORS).map(status => (
                        <div key={status} className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}></div>
                            <span>
                                {status === 'COMPLETED' ? 'Hoàn thành' : 
                                 status === 'CANCELLED' ? 'Đã hủy' : 
                                 status === 'PENDING' ? 'Chờ xác nhận' :
                                 status === 'SHIPPING' ? 'Đang giao' : status}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}