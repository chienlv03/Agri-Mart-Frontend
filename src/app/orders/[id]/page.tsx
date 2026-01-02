"use client";

import { useEffect, useState } from "react";
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
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";

// --- Helper Functions (Reused) ---
const getStatusLabel = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đang chuẩn bị hàng",
        SHIPPING: "Đang giao hàng",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy",
        DELIVERED: "Giao thành công" // Assuming you might have this status
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

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!orderId) return;
            setLoading(true);
            try {
                // Assuming you have this API method
                const data = await OrderService.getOrderById(orderId);
                setOrder(data);
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Không tìm thấy đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    // Handle Cancel Order (Reused logic)
    const handleCancelOrder = async () => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        try {
            await OrderService.cancelOrder(orderId);
            toast.success("Đã hủy đơn hàng thành công");
            // Reload data locally
            setOrder(prev => prev ? { ...prev, status: OrderStatus.CANCELLED } : null);
        } catch (error: any) {
            console.error("Error cancelling order:", error.response?.data?.message);
            toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
        }
    };

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
                                 {order.status === OrderStatus.CANCELLED && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] bg-red-600 h-3 w-3 rounded-full border-2 border-white ring-2 ring-red-100"></div>
                                        <p className="text-sm font-semibold text-gray-900">Đơn hàng đã hủy</p>
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
                            {/* Assuming discount functionality exists */}
                            {/* <div className="flex justify-between text-sm text-green-600">
                                <span>Giảm giá:</span>
                                <span>- {formatCurrency(0)}</span>
                            </div> */}
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                                <span className="text-xl font-bold text-red-600">{formatCurrency(order.finalAmount)}</span>
                            </div>
                        </CardContent>
                        
                        {/* 6. Action Buttons */}
                        {order.status === OrderStatus.PENDING && (
                            <div className="p-4 bg-gray-50 border-t rounded-b-lg">
                                <Button 
                                    variant="outline" 
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={handleCancelOrder}
                                >
                                    Hủy đơn hàng này
                                </Button>
                            </div>
                        )}
                        {(order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) && (
                            <div className="p-4 bg-gray-50 border-t rounded-b-lg">
                                <Link href={`/products/${order.items[0]?.productId}`}>
                                     <Button className="w-full bg-green-600 hover:bg-green-700">
                                        Mua lại sản phẩm
                                    </Button>
                                </Link>
                            </div>
                        )}
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