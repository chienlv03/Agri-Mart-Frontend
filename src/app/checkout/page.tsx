"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  MapPin, Truck, Store,
  Loader2, Receipt,
  User2,
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Components & Services
import { AddressListSelector } from "@/components/address/AddressListSelector";
import { useCartStore } from "@/store/useCartStore";
import { CheckoutService } from "@/services/checkout.service";
import { AddressService } from "@/services/address.service";
import { OrderService } from "@/services/order.service";
import { ProductService } from "@/services/product.service"; // Cần để lấy info SP Mua ngay
import { CheckoutResponse } from "@/types/checkout.type";
import { CartItemResponse } from "@/types/order.types"; // Import Type
import { formatCurrency, toCamelCaseName } from "@/lib/utils";
import { BackButton } from "@/components/shared/back-button";

interface Address {
  id: string;
  isDefault: boolean;
  recipientName?: string;
  phone?: string;
  detailAddress?: string;
  wardName?: string;
  districtName?: string;
  provinceName?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: storeItems, clearCart } = useCartStore();

  // --- STATE QUẢN LÝ DỮ LIỆU CHECKOUT ---
  const [itemsToCheckout, setItemsToCheckout] = useState<CartItemResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CheckoutResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  const [loading, setLoading] = useState(false); // Loading khi tính phí
  const [ordering, setOrdering] = useState(false); // Loading khi bấm đặt hàng
  const [initializing, setInitializing] = useState(true); // Loading ban đầu

  // Lấy params để check luồng Mua ngay
  const type = searchParams.get("type"); // 'buy_now'
  const productId = searchParams.get("productId");
  const quantity = Number(searchParams.get("quantity")) || 1;

  // 1. INIT DATA: Xử lý luồng dữ liệu (Cart vs Buy Now) + Lấy địa chỉ mặc định
  useEffect(() => {
    const initPage = async () => {
      setInitializing(true);
      try {
        // A. XỬ LÝ SẢN PHẨM CHECKOUT
        if (type === "buy_now" && productId) {
          // Case 1: Mua ngay -> Gọi API lấy thông tin SP
          const product = await ProductService.getProductById(productId);

          // Giả lập CartItemResponse từ ProductResponse
          const directItem: CartItemResponse = {
            productId: product.id,
            productName: product.name,
            productImage: product.thumbnail || product.images?.[0] || "/placeholder.jpg",
            price: product.price,
            quantity: quantity,
            totalPrice: product.price * quantity,
            sellerId: product.sellerProfileResponse?.sellerId || "",
            sellerName: product.sellerProfileResponse?.fullName || "Cửa hàng khác",
            isPreOrder: product.isPreOrder || false,
          };
          setItemsToCheckout([directItem]);

        } else {
          // Case 2: Mua từ giỏ hàng -> Lấy từ Store
          // Cần đảm bảo store đã load xong (có thể check length hoặc isLoading của store)
          if (storeItems.length > 0) {
            setItemsToCheckout(storeItems);
          } else {
            // Nếu store rỗng (F5 trang), có thể cần gọi fetchCart lại hoặc redirect
            // Ở đây giả sử store đã persist hoặc đã fetch ở layout
            setItemsToCheckout([]);
          }
        }

        // B. XỬ LÝ ĐỊA CHỈ MẶC ĐỊNH
        const res = await AddressService.getMyAddresses();
        const addresses: Address[] = res.data;
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: Address) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
        }

      } catch (error) {
        console.error("Lỗi khởi tạo trang checkout", error);
        toast.error("Có lỗi khi tải thông tin đơn hàng");
      } finally {
        setInitializing(false);
      }
    };

    initPage();
  }, [type, productId, quantity, storeItems]); // Dependency quan trọng

  // 2. Tự động tính toán (Preview) khi thay đổi địa chỉ hoặc items
  useEffect(() => {
    const fetchPreview = async () => {
      if (!selectedAddressId || itemsToCheckout.length === 0) return;

      setLoading(true);
      try {
        const requestData = {
          addressId: selectedAddressId,
          items: itemsToCheckout.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        };

        const res = await CheckoutService.previewOrder(requestData);
        setPreviewData(res.data);
      } catch (error) {
        console.error("Lỗi tính phí:", error);
        toast.error("Không thể tính phí vận chuyển cho địa chỉ này.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [selectedAddressId, itemsToCheckout]);

  // 3. Xử lý Đặt hàng
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warning("Vui lòng chọn địa chỉ nhận hàng.");
      return;
    }
    if (!previewData) {
      toast.error("Vui lòng chờ tính toán phí vận chuyển.");
      return;
    }

    setOrdering(true);
    try {
      // Gọi API tạo đơn
      await OrderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        // Quan trọng: Gửi orderType để Backend biết xử lý kho
        orderType: type === "buy_now" ? "BUY_NOW" : "FROM_CART",
        items: itemsToCheckout.map(item => ({
          id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
          price: item.price,
          productImage: item.productImage
        })),
      });

      toast.success("Đặt hàng thành công!");

      // Chỉ xóa giỏ hàng nếu là đơn từ giỏ hàng
      if (type !== "buy_now") {
        clearCart();
      }

      router.push("/orders/success");
    } catch (error: any) {
      toast.error("Đặt hàng thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
    } finally {
      setOrdering(false);
    }
  };

  // --- RENDER EMPTY ---
  if (!initializing && itemsToCheckout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white rounded-lg shadow-sm m-4">
        <p className="text-gray-500 text-lg">Không có sản phẩm nào để thanh toán.</p>
        <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gray-50 min-h-screen">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Receipt className="w-6 h-6 text-green-600" /> Xác nhận đơn hàng
      </h1>

      {initializing ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 relative">

          {/* --- CỘT TRÁI: DANH SÁCH SẢN PHẨM --- */}
          <div className="lg:col-span-2 space-y-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-green-600 w-8 h-8" />
                <span className="text-sm text-gray-500">Đang cập nhật phí vận chuyển...</span>
              </div>
            ) : previewData?.orders ? (
              previewData.orders.map((shopOrder, index) => (
                <Card key={shopOrder.sellerId || index} className="shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header Shop */}
                  <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-gray-700" />
                        <span className="font-bold text-gray-800 text-base">{toCamelCaseName(shopOrder.farmName)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-800 text-base">{toCamelCaseName(shopOrder.sellerName)}</span>
                      </div>
                    </div>
                    {shopOrder.distance && (
                      <Badge variant="outline" className="text-xs font-normal bg-gray-50 text-gray-600 border-gray-200">
                        Khoảng cách: {shopOrder.distance?.toFixed(1)} km
                      </Badge>
                    )}
                  </div>

                  {/* List Items */}
                  <CardContent className="p-0">
                    {shopOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                        <div className="relative w-20 h-20 border rounded-md overflow-hidden shrink-0 bg-gray-100">
                          <Image
                            src={item.productImage || "/placeholder.png"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{toCamelCaseName(item.productName)}</h3>
                          {item.isPreOrder && (
                            <Badge variant="secondary" className="mt-1 text-[10px] bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                              Hàng đặt trước
                            </Badge>
                          )}
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Số lượng: {item.quantity}</span>
                            <span className="text-sm font-bold text-green-700">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Phí ship */}
                    <div className="bg-gray-50 p-4 flex justify-between items-center text-sm border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Truck className="w-4 h-4" />
                        <span>Vận chuyển:</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(shopOrder.shippingFee)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-dashed">
                <p>Vui lòng chọn địa chỉ để hiển thị chi tiết đơn hàng.</p>
              </div>
            )}
          </div>

          {/* INFO & PAYMENT --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">

              {/* 1. ĐỊA CHỈ */}
              <Card className="shadow-sm border-t-4 border-t-green-600">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white py-3">
                  <CardTitle className="text-sm font-bold flex items-center justify-between uppercase text-gray-700">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-600" /> Địa chỉ nhận hàng</span>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 px-2">Thay đổi</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <AddressListSelector
                          selectedId={selectedAddressId}
                          onSelect={(id) => setSelectedAddressId(id)}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  {selectedAddressId && previewData?.shippingAddress ? (
                    <div className="space-y-1">
                      <p className="font-bold text-gray-800 text-sm">
                        {previewData.shippingAddress.recipientName}
                        <span className="mx-1 font-normal text-gray-400">|</span>
                        {previewData.shippingAddress.phone}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {previewData.shippingAddress.detailAddress}, {previewData.shippingAddress.wardName}, {previewData.shippingAddress.districtName}, {previewData.shippingAddress.provinceName}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 mb-2">Chưa có địa chỉ</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-xs">Chọn địa chỉ</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <AddressListSelector onSelect={(id) => setSelectedAddressId(id)} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. PAYMENT */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-3 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold uppercase text-gray-700">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "COD" | "VNPAY")} className="gap-2">
                    <div className={`flex items-start space-x-3 border p-2 rounded cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50/50' : 'hover:bg-gray-50'}`}>
                      <RadioGroupItem value="COD" id="cod" className="mt-1 text-green-600" />
                      <Label htmlFor="cod" className="cursor-pointer text-sm font-medium text-gray-700">
                        Thanh toán khi nhận hàng
                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">Thanh toán tiền mặt cho shipper</span>
                      </Label>
                    </div>

                    <div className={`flex items-start space-x-3 border p-2 rounded cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-green-500 bg-green-50/50' : 'hover:bg-gray-50'}`}>
                      <RadioGroupItem value="VNPAY" id="vnpay" className="mt-1 text-green-600" disabled />
                      <Label htmlFor="vnpay" className="cursor-pointer text-sm font-medium text-gray-700">
                        Ví VNPAY / Ngân hàng
                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">Quét mã QR qua ứng dụng ngân hàng</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* 3. TỔNG TIỀN */}
              <Card className="shadow-md border-t-4 border-t-orange-500">
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tiền hàng</span>
                    <span className="font-medium">{previewData ? formatCurrency(previewData.totalProductPrice) : "0 đ"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">{previewData ? formatCurrency(previewData.totalShippingFee) : "0 đ"}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-red-600 block">
                        {previewData ? formatCurrency(previewData.finalAmount) : "0 đ"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 text-base shadow-md mt-2"
                    disabled={!selectedAddressId || !previewData || ordering || loading}
                    onClick={handlePlaceOrder}
                  >
                    {ordering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                      </>
                    ) : "ĐẶT HÀNG"}
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}