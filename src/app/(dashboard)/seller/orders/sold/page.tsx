"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderService } from "@/services/order.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Thêm CardFooter
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, Truck, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"; // Thêm Icon điều hướng
import { OrderResponse, OrderStatus } from "@/types/order.types";
import { CancelOrderDialog } from "@/components/shared/cancel-order-dialog";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. STATE CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10; // Số lượng đơn mỗi trang

  // 2. Cập nhật hàm fetch để nhận tham số page
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi service với tham số phân trang
      // Lưu ý: Đảm bảo OrderService.getOrderBySeller đã được sửa để nhận (page, size)
      const data = await OrderService.getOrderBySeller(currentPage, pageSize);
      
      // Xử lý dữ liệu trả về từ PageResponse
      setOrders(data.content || []); 
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);

    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]); // Re-fetch khi currentPage thay đổi

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ xác nhận</Badge>;
      case OrderStatus.CONFIRMED: return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đang chuẩn bị</Badge>;
      case OrderStatus.SHIPPING: return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Đang giao</Badge>;
      case OrderStatus.COMPLETED: return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Thành công</Badge>;
      case OrderStatus.CANCELLED: return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading && orders.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-8 h-8 text-green-600"/></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đơn hàng</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
            {/* Hiển thị tổng số bản ghi thực tế từ Server */}
            Tổng cộng: <b>{totalElements}</b> đơn hàng
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white border-b">
          <CardTitle>Danh sách đơn hàng mới</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[100px]">Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {orders.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                          {loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto"/> : "Chưa có đơn hàng nào"}
                      </TableCell>
                  </TableRow>
              ) : (
                orders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>
                        <div className="font-medium text-sm text-gray-900">{order.recipientName}</div>
                        <div className="text-xs text-gray-500">{order.recipientPhone}</div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm truncate text-gray-700" title={item.productName}>
                            {item.quantity}x {item.productName}
                            </div>
                        ))}
                    </TableCell>
                    <TableCell className="font-bold text-green-700">
                        {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right pr-6">
                        
                        {/* 1. TRẠNG THÁI PENDING */}
                        {order.status === OrderStatus.PENDING && (
                        <div className="flex justify-end gap-2">
                            <CancelOrderDialog 
                                orderId={order.id}
                                onSuccess={fetchOrders}
                                trigger={
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8">
                                        <X className="w-3.5 h-3.5 mr-1" /> Hủy
                                    </Button>
                                }
                            />
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleUpdateStatus(order.id, OrderStatus.CONFIRMED)}>
                                <Check className="w-3.5 h-3.5 mr-1" /> Duyệt
                            </Button>
                        </div>
                        )}

                        {/* 2. TRẠNG THÁI CONFIRMED */}
                        {order.status === OrderStatus.CONFIRMED && (
                        <div className="flex justify-end gap-2">
                             <CancelOrderDialog 
                                orderId={order.id}
                                onSuccess={fetchOrders}
                                trigger={
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2">Hủy</Button>
                                }
                            />
                            <Button size="sm" variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 h-8" onClick={() => handleUpdateStatus(order.id, OrderStatus.SHIPPING)}>
                                <Truck className="w-3.5 h-3.5 mr-1" /> Giao hàng
                            </Button>
                        </div>
                        )}

                        {/* 3. CÁC TRẠNG THÁI KHÁC */}
                        {order.status === OrderStatus.SHIPPING && <span className="text-xs text-purple-600 font-medium italic">Đang vận chuyển...</span>}
                        {order.status === OrderStatus.COMPLETED && <span className="text-xs text-green-600 font-medium">Hoàn tất</span>}
                        {order.status === OrderStatus.CANCELLED && <span className="text-xs text-gray-400">Đã hủy</span>}
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* 3. THANH PHÂN TRANG */}
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t py-4">
                <div className="text-xs text-gray-500">
                    Hiển thị <strong>{orders.length}</strong> trên tổng <strong>{totalElements}</strong> đơn hàng
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                    </Button>
                    <span className="text-sm font-medium px-2">
                        Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1 || loading}
                    >
                        Tiếp <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}