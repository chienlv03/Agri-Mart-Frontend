"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { OrderService } from "@/services/order.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, PackageX, ShoppingBag } from "lucide-react";
import { OrderResponse, OrderStatus } from "@/types/order.types";
import { CancelOrderDialog } from "@/components/shared/cancel-order-dialog";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    // 1. Fetch dữ liệu (Dùng useCallback để tránh tạo lại hàm không cần thiết)
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await OrderService.getOrderByBuyer();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // 3. Lọc đơn hàng theo Tab
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "ALL") return true;
        return order.status === activeTab;
    });

    // Helper: Màu sắc trạng thái
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case OrderStatus.CONFIRMED: return "text-blue-600 bg-blue-50 border-blue-200";
            case OrderStatus.SHIPPING: return "text-purple-600 bg-purple-50 border-purple-200";
            case OrderStatus.COMPLETED: return "text-green-600 bg-green-50 border-green-200";
            case OrderStatus.CANCELLED: return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50";
        }
    };

    // Helper: Tên trạng thái tiếng Việt
    const getStatusLabel = (status: OrderStatus) => {
        const map: Record<OrderStatus, string> = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đang chuẩn bị hàng",
            SHIPPING: "Đang giao",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
            DELIVERED: "Đã giao"
        };
        return map[status] || status;
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-green-700" />
                Đơn mua của tôi
            </h1>

            <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="ALL">Tất cả</TabsTrigger>
                    <TabsTrigger value={OrderStatus.PENDING}>Chờ xác nhận</TabsTrigger>
                    <TabsTrigger value={OrderStatus.SHIPPING}>Đang giao</TabsTrigger>
                    <TabsTrigger value={OrderStatus.COMPLETED}>Hoàn thành</TabsTrigger>
                    <TabsTrigger value={OrderStatus.CANCELLED}>Đã hủy</TabsTrigger>
                </TabsList>

                {/* Nội dung danh sách */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" /></div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                            <PackageX className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">Chưa có đơn hàng nào</p>
                            <Link href="/products">
                                <Button variant="link" className="text-green-600">Đi mua sắm ngay</Button>
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card key={order.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">

                                {/* Header: Shop/Ngày/Trạng thái */}
                                <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 p-4 border-b">
                                    <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-900">Mã đơn: #{order.id.slice(-6)}</span>
                                        <span className="mx-2">|</span>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status).toUpperCase()}
                                    </div>
                                </CardHeader>

                                {/* Body: Danh sách sản phẩm */}
                                <CardContent className="p-0">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <div className="relative w-20 h-20 border rounded bg-white shrink-0">
                                                <Image
                                                    src={item.productImage || "/placeholder.jpg"}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.productName}</h4>
                                                <div className="text-xs text-gray-500 flex justify-between">
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>

                                {/* Footer: Tổng tiền & Hành động */}
                                <CardFooter className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 p-4 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Thành tiền:</span>
                                        <span className="text-lg font-bold text-red-600">{formatCurrency(order.finalAmount)}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* THAY THẾ NÚT HỦY CŨ BẰNG COMPONENT DIALOG */}
                                        {order.status === OrderStatus.PENDING && (
                                            <CancelOrderDialog
                                                orderId={order.id}
                                                onSuccess={fetchOrders} // Gọi lại API để reload list sau khi hủy
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        Hủy đơn hàng
                                                    </Button>
                                                }
                                            />
                                        )}

                                        {/* Nút Mua lại */}
                                        {(order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) && (
                                            <Link href={`/products/${order.items[0]?.productId}`}>
                                                <Button size="sm" variant="outline">Mua lại</Button>
                                            </Link>
                                        )}

                                        <Link href={`/orders/${order.id}`}>
                                            <Button size="sm">Xem chi tiết</Button>
                                        </Link>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </Tabs>
        </div>
    );
}