"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Loader2, Package } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ProductData {
  id: string;
  name: string;
  image: string;
  price: number;
  availableQuantity: number;
  unit: string;
}

interface AddToCartModalProps {
  product: ProductData;
  children: React.ReactNode; // Nút bấm kích hoạt (Trigger)
}

export function AddToCartModal({ product, children }: AddToCartModalProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Reset số lượng về 1 mỗi khi mở modal
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) setQuantity(1);
  };

  const handleIncrease = () => {
    if (quantity < product.availableQuantity) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.warning(`Chỉ còn ${product.availableQuantity} sản phẩm trong kho`);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    // Gọi store để thêm số lượng đã chọn
    await addToCart(product.id, quantity);
    setLoading(false);
    setOpen(false); // Đóng modal sau khi thêm
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Phần tử kích hoạt Modal (Nút Thêm vào giỏ ở ProductCard) */}
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Thêm vào giỏ hàng</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          {/* Ảnh sản phẩm nhỏ */}
          <div className="relative w-24 h-24 border rounded-md overflow-hidden shrink-0">
            <Image 
                src={product.image || "/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className="object-cover" 
                unoptimized
            />
          </div>

          {/* Thông tin */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
            <div className="text-red-600 font-bold text-lg">
                {formatCurrency(product.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
                <Package className="w-3 h-3" />
                <span>Kho: {product.availableQuantity} {product.unit}</span>
            </div>
          </div>
        </div>

        {/* Bộ chọn số lượng */}
        <div className="flex items-center justify-between border-t border-b py-4 my-2">
            <span className="font-medium text-gray-700">Số lượng:</span>
            
            <div className="flex items-center border rounded-md">
                <button 
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 text-center font-semibold border-l border-r py-1">
                    {quantity}
                </div>
                <button 
                    onClick={handleIncrease}
                    disabled={quantity >= product.availableQuantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Tổng tiền tạm tính */}
        <div className="flex justify-between items-center py-2 text-sm font-medium">
            <span>Tạm tính:</span>
            <span className="text-red-600">{formatCurrency(product.price * quantity)}</span>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleConfirm} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
            Thêm vào giỏ hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}