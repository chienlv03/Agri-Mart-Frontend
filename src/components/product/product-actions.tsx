"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore"; // Import Store của bạn

interface ProductActionsProps {
  productId: string;
  availableQuantity: number;
  isPreOrder: boolean;
  canBuy: boolean;
}

export function ProductActions({
  productId,
  availableQuantity,
  isPreOrder,
  canBuy
}: ProductActionsProps) {
  const router = useRouter();

  // Lấy hàm addToCart từ Zustand Store
  const addToCartStore = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Xử lý tăng giảm số lượng
  const handleIncrease = () => {
    if (quantity < availableQuantity) setQuantity(prev => prev + 1);
    else toast.warning(`Chỉ còn ${availableQuantity} sản phẩm trong kho.`);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) setQuantity(1);
    else if (val > availableQuantity) setQuantity(availableQuantity);
    else setQuantity(val);
  }

  // LOGIC 1: THÊM VÀO GIỎ
  const handleAddToCart = async () => {
    if (!canBuy) return;
    setLoading(true);

    // Gọi hàm của Store. Store đã tự xử lý: Gọi API -> Toast -> Refetch
    await addToCartStore(productId, quantity);

    setLoading(false);
  };

  // LOGIC 2: MUA NGAY
  const handleBuyNow = () => {
    if (!canBuy) return;

    // Chuyển hướng ngay lập tức kèm query params
    // Không gọi API thêm vào giỏ hàng
    const params = new URLSearchParams({
      type: 'buy_now',
      productId: productId,
      quantity: quantity.toString()
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 mt-auto">
      {/* Bộ chọn số lượng */}
      {canBuy && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Số lượng:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost" size="icon" className="h-9 w-9 rounded-none"
              onClick={handleDecrease} disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3 cursor-pointer" />
            </Button>
            <Input
              className="w-14 h-9 border-0 text-center focus-visible:ring-0 p-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={quantity}
              onChange={handleInputChange}
            />
            <Button
              variant="ghost" size="icon" className="h-9 w-9 rounded-none"
              onClick={handleIncrease} disabled={quantity >= availableQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-xs text-gray-500">{availableQuantity} sản phẩm có sẵn</span>
        </div>
      )}

      {/* Các nút bấm */}
      <div className="flex gap-3">
        {!isPreOrder && (
          <Button
            variant="outline"
            size="lg"
            disabled={!canBuy || loading}
            onClick={handleAddToCart}
            className="flex-1 border-green-600 text-green-700 hover:bg-green-50 h-12 text-base font-medium cursor-pointer"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
            Thêm giỏ hàng
          </Button>
        )}

        <Button
          size="lg"
          disabled={!canBuy || loading}
          onClick={handleBuyNow}
          className={`flex-1 h-12 text-base font-medium shadow-lg ${!canBuy ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700 shadow-green-200'} text-white cursor-pointer`}
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isPreOrder ? "Đặt cọc ngay" : "Mua ngay")}
        </Button>
      </div>

      {!canBuy && (
        <p className="text-center text-red-500 text-sm mt-1">
          Sản phẩm hiện đang ngưng bán hoặc hết hàng
        </p>
      )}
    </div>
  );
}