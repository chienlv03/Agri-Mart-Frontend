"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import Router
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Loader2, Package, ArrowRight } from "lucide-react";
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
  children: React.ReactNode;
  // Thêm prop này để xác định chế độ
  mode?: "add_to_cart" | "buy_now"; 
}

export function AddToCartModal({ product, children, mode = "add_to_cart" }: AddToCartModalProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter(); // Hook để chuyển trang

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

    if (mode === "add_to_cart") {
      // --- LOGIC 1: THÊM VÀO GIỎ (Cũ) ---
      await addToCart(product.id, quantity);
      setLoading(false);
      setOpen(false);
    } else {
      // --- LOGIC 2: MUA NGAY / ĐẶT TRƯỚC (Mới) ---
      // Chuyển hướng sang trang checkout với tham số
      // Lưu ý: Không add vào store giỏ hàng chung, mà mua thẳng item này
      const params = new URLSearchParams({
        type: "buy_now",
        productId: product.id,
        quantity: quantity.toString()
      });
      
      router.push(`/checkout?${params.toString()}`);
      // Không cần setOpen(false) hay setLoading(false) vì trang sẽ reload/chuyển đi
    }
  };

  // Tùy chỉnh giao diện dựa trên Mode
  const isBuyNow = mode === "buy_now";
  const buttonText = isBuyNow ? "Tiến hành đặt hàng" : "Thêm vào giỏ hàng";
  const ButtonIcon = isBuyNow ? ArrowRight : ShoppingCart;
  const buttonColorClass = isBuyNow 
    ? "bg-orange-600 hover:bg-orange-700" // Màu cam cho đặt trước
    : "bg-green-600 hover:bg-green-700"; // Màu xanh cho giỏ hàng

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{isBuyNow ? "Đặt hàng ngay" : "Thêm vào giỏ hàng"}</DialogTitle>
        </DialogHeader>

        {/* ... (Phần hiển thị ảnh và thông tin giữ nguyên) ... */}
        <div className="flex gap-4 py-4">
          <div className="relative w-24 h-24 border rounded-md overflow-hidden shrink-0">
            <Image 
                src={product.image || "/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className="object-cover" 
                unoptimized
            />
          </div>
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

        {/* ... (Phần chọn số lượng giữ nguyên) ... */}
        <div className="flex items-center justify-between border-t border-b py-4 my-2">
            <span className="font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center border rounded-md">
                <button onClick={handleDecrease} disabled={quantity <= 1} className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 text-center font-semibold border-l border-r py-1">
                    {quantity}
                </div>
                <button onClick={handleIncrease} disabled={quantity >= product.availableQuantity} className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex justify-between items-center py-2 text-sm font-medium">
            <span>Tạm tính:</span>
            <span className="text-red-600">{formatCurrency(product.price * quantity)}</span>
        </div>

        <DialogFooter>
          {/* Nút bấm thay đổi màu và text theo mode */}
          <Button type="submit" onClick={handleConfirm} disabled={loading} className={`w-full ${buttonColorClass}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ButtonIcon className="w-4 h-4 mr-2" />}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}