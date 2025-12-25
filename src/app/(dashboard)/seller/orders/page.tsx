"use client";

import { useEffect, useState } from "react";
import { OrderService } from "@/services/order.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Truck } from "lucide-react";
import { OrderResponse, OrderStatus } from "@/types/order.types";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getMyOrders();
      console.log("Dữ liệu API trả về:", data);
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý đổi trạng thái
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders(); // Reload lại bảng
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
    }
  };

  // Helper chọn màu Badge
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>;
      case OrderStatus.CONFIRMED: return <Badge className="bg-blue-100 text-blue-800">Đang chuẩn bị</Badge>;
      case OrderStatus.SHIPPING: return <Badge className="bg-purple-100 text-purple-800">Đang giao</Badge>;
      case OrderStatus.COMPLETED: return <Badge className="bg-green-100 text-green-800">Thành công</Badge>;
      case OrderStatus.CANCELLED: return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>
        <div className="text-sm text-gray-500">Tổng cộng: {orders.length} đơn hàng</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs text-gray-500">#{order.id.slice(-6)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.recipientName}</div>
                    <div className="text-xs text-gray-500">{order.recipientPhone}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {order.items.map((item, idx) => (
                       <div key={idx} className="text-sm truncate">
                          {item.quantity}x {item.productName}
                       </div>
                    ))}
                  </TableCell>
                  <TableCell className="font-bold text-green-700">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    
                    {/* LOGIC NÚT BẤM DỰA TRÊN TRẠNG THÁI */}
                    
                    {/* 1. Nếu đang PENDING -> Hiện nút Duyệt & Hủy */}
                    {order.status === OrderStatus.PENDING && (
                      <div className="flex justify-end gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.CANCELLED)}
                        >
                          <X className="w-4 h-4 mr-1" /> Hủy
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.CONFIRMED)}
                        >
                          <Check className="w-4 h-4 mr-1" /> Duyệt
                        </Button>
                      </div>
                    )}

                    {/* 2. Nếu đang CONFIRMED (Đã duyệt) -> Hiện nút Giao hàng */}
                    {order.status === OrderStatus.CONFIRMED && (
                      <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleUpdateStatus(order.id, OrderStatus.SHIPPING)}
                      >
                         <Truck className="w-4 h-4 mr-1" /> Giao hàng
                      </Button>
                    )}

                    {/* 3. Các trạng thái khác -> Ẩn nút hoặc hiện text */}
                    {order.status === OrderStatus.SHIPPING && (
                        <span className="text-xs text-gray-500">Đang vận chuyển...</span>
                    )}

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}