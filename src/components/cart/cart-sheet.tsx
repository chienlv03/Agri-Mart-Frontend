"use client";

import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

      <SheetContent className="w-full sm:max-w-md flex flex-col bg-gradient-to-b from-white to-green-50">
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="text-xl font-bold text-green-700">
            🛒 Giỏ hàng ({totalItems()})
          </SheetTitle>
        </SheetHeader>

        {/* Cart items */}
        <ScrollArea className="flex-1 my-4 pr-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <ShoppingCart className="w-12 h-12 opacity-30" />
              <p>Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                    <Image
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Cung cấp bởi <span className="text-green-600 font-medium">{item.sellerName}</span>
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-green-700">
                        {formatCurrency(item.price)}
                      </span>

                      <div className="flex items-center bg-gray-100 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1"
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
        </ScrollArea>

        {/* Footer */}
        <div className="border-t pt-4 space-y-4 bg-white rounded-t-2xl">
          <div className="flex justify-between text-lg font-bold px-2">
            <span>Tổng cộng</span>
            <span className="text-green-700">{formatCurrency(totalPrice())}</span>
          </div>

          <Link href="/checkout" className="block">
            <Button
              className="w-full py-6 rounded-xl bg-green-600 hover:bg-green-700 text-lg shadow"
              disabled={items.length === 0}
            >
              Thanh toán ngay
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
