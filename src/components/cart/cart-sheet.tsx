"use client";

import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export function CartSheet() {
  const { items, fetchCart, removeFromCart, totalItems, totalPrice, updateQuantity } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative rounded-full hover:bg-green-50">
          <ShoppingCart className="w-6 h-6 text-green-700" />
          {totalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {totalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>

      {/* 1. h-full: Chiều cao full màn hình
         2. flex flex-col: Xếp các phần tử dọc
         3. overflow-hidden: Để tránh 2 thanh cuộn (chỉ cuộn phần giữa)
      */}
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden bg-linear-to-b from-white to-green-50 p-0 gap-0">
        
        {/* === HEADER (STICKY TOP) === */}
        {/* shrink-0: Đảm bảo header không bị co lại khi màn hình thấp */}
        <SheetHeader className="p-4 border-b bg-white shrink-0 z-10 shadow-sm">
          <SheetTitle className="text-xl font-bold text-green-700 flex items-center gap-2">
            🛒 Giỏ hàng <span className="text-sm font-normal text-gray-500">({totalItems()} sản phẩm)</span>
          </SheetTitle>
        </SheetHeader>

        {/* === CONTENT (SCROLLABLE MIDDLE) === */}
        {/* flex-1: Chiếm hết khoảng trống còn lại */}
        {/* overflow-y-auto: Chỉ cuộn khu vực này */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Giỏ hàng của bạn đang trống</p>
              <Button variant="link" asChild className="text-green-600">
                  <Link href="/">Mua sắm ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 rounded-2xl bg-white shadow-sm border border-gray-100"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border bg-gray-50">
                    <Image
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-medium text-sm line-clamp-2 text-gray-900 leading-snug" title={item.productName}>
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div>
                         <p className="text-[10px] text-gray-500 mb-1">
                             {item.sellerName}
                         </p>
                         <span className="font-bold text-green-700 text-sm">
                            {formatCurrency(item.price)}
                         </span>
                      </div>

                      <div className="flex items-center bg-gray-100 rounded-lg h-7 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-200 rounded-l-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === FOOTER (STICKY BOTTOM) === */}
        {/* shrink-0: Đảm bảo footer luôn hiển thị đầy đủ */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between text-base font-medium mb-4">
              <span className="text-gray-600">Tổng tạm tính</span>
              <span className="text-green-700 font-bold text-lg">{formatCurrency(totalPrice())}</span>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button
                className="w-full py-6 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold shadow-lg hover:shadow-green-200 transition-all"
              >
                Tiến hành đặt hàng
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}