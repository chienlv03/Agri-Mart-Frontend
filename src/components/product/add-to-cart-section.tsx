"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface AddToCartProps {
  productId: string;
  stock: number; // Số lượng tồn kho hiển thị (nếu có)
}

export function AddToCartSection({ productId, stock }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart(productId, quantity);
  };

  return (
    <div className="flex flex-col gap-4 mt-6 border-t pt-6">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">Số lượng:</span>
        <div className="flex items-center border rounded-md">
          <button 
            onClick={handleDecrease}
            className="p-2 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button 
            onClick={handleIncrease}
            className="p-2 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm text-gray-500">({stock} sản phẩm có sẵn)</span>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleAddToCart}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 py-6 text-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          Thêm vào giỏ hàng
        </Button>
      </div>
    </div>
  );
}