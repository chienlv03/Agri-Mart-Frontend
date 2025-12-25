"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Plus, Package, TrendingUp } from "lucide-react"; // Import thêm icon Package
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { AddToCartModal } from "@/components/product/add-to-cart-modal";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    location: string;
    rating: number;
    sold: number;
    isFlashSale?: boolean;
    availableQuantity: number; // Trường dữ liệu từ Backend
  };
}

export function ProductCard({ product }: ProductCardProps) {
  useCartStore((state) => state.addToCart);

  // Logic xác định hết hàng
  const isOutOfStock = product.availableQuantity <= 0;

  // Logic xác định sắp hết hàng (Low stock) để cảnh báo màu đỏ (Ví dụ: còn dưới 10)
  const isLowStock = product.availableQuantity > 0 && product.availableQuantity < 10;

  // Nút bấm thêm vào giỏ (Tách ra để code gọn)
  const AddButton = (
    <Button 
      className={`w-full h-9 text-sm transition-all duration-300 ${
         isOutOfStock 
           ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
           : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200"
      }`}
      disabled={isOutOfStock}
    >
       <Plus className="mr-1 h-4 w-4" />
       {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
    </Button>
  );

  return (
    <Card className="group overflow-hidden rounded-lg border hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white">

      {/* 1. HÌNH ẢNH SẢN PHẨM */}
      <Link href={`/products/${product.id}`} className="block overflow-hidden relative">
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-80" : ""}`}
            unoptimized
          />

          {product.isFlashSale && !isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
              FLASH SALE
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white font-bold border-2 border-white px-3 py-1 rounded-md transform -rotate-12 whitespace-nowrap">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* 2. NỘI DUNG THÔNG TIN */}
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Tên sản phẩm */}
        <Link href={`/products/${product.id}`}>
          <h3
            className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-green-700 min-h-[40px] mb-1 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Giá bán */}
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-base font-bold text-red-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-gray-500">/{product.unit}</span>
        </div>

        {/* --- DÒNG THÔNG TIN BỔ SUNG (Đã sửa) --- */}
        <div className="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1.5">

          {/* Dòng 1: Địa chỉ & Đánh giá */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0 max-w-[60%]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Dòng 2: Đã bán & Tồn kho (MỚI) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-500">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>Đã bán {product.sold}</span>
            </div>

            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 shrink-0" />
              {isOutOfStock ? (
                <span className="text-gray-400">Hết hàng</span>
              ) : (
                <span className={isLowStock ? "text-red-500 font-bold" : "text-green-700 font-medium"}>
                  Sẵn có: {product.availableQuantity}
                </span>
              )}
            </div>
          </div>

        </div>
      </CardContent>

      {/* 3. NÚT THÊM VÀO GIỎ */}
      <CardFooter className="p-3 pt-0">
          {/* Nếu hết hàng thì hiện nút Disable, còn hàng thì bọc trong Modal */}
          {isOutOfStock ? (
             AddButton
          ) : (
             <AddToCartModal product={product}>
                {AddButton}
             </AddToCartModal>
          )}
       </CardFooter>
    </Card>
  );
}