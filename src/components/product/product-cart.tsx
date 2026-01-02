"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Star, Plus, Package, TrendingUp,
  Calendar, ChevronLeft, ChevronRight,
  UserCheck,
  Shield
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddToCartModal } from "@/components/product/add-to-cart-modal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth.types";

// Định nghĩa Interface rõ ràng cho Props
interface ProductCardProps {
  product: {
    productId: string;
    sellerId: string;
    name: string;
    images: string[];
    thumbnail: string;
    price: number;
    unit: string;
    location: string;
    rating: number;
    soldCount: number;
    isFlashSale?: boolean;
    availableQuantity: number;
    // Thông tin Harvest
    isPreOrder?: boolean;
    expectedHarvestDate?: string | null;
  };
}

interface ActionButtonProps {
  isAdmin: boolean;
  isOwner: boolean;
  isOutOfStock: boolean;
}

function ActionButton({ isOwner, isAdmin, isOutOfStock }: ActionButtonProps) {
  
  // A. Nếu là ADMIN -> Chặn
  if (isAdmin) {
    return (
      <Button 
        className="w-full h-9 text-sm bg-gray-100 text-gray-500 border-gray-200 cursor-default hover:bg-gray-100"
        variant="outline"
      >
        <Shield className="mr-2 h-4 w-4" /> Quản trị viên
      </Button>
    );
  }

  // B. Nếu là chủ sở hữu -> Chặn
  if (isOwner) {
    return (
      <Button 
        className="w-full h-9 text-sm bg-gray-100 text-gray-500 border-gray-200 cursor-default hover:bg-gray-100"
        variant="outline"
      >
        <UserCheck className="mr-2 h-4 w-4" /> Sản phẩm của bạn
      </Button>
    );
  }

  // C. Nếu hết hàng -> Chặn
  if (isOutOfStock) {
    return (
      <Button 
        className="w-full h-9 text-sm bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        disabled
      >
         <Plus className="mr-1 h-4 w-4" /> Hết hàng
      </Button>
    );
  }

  // D. Bình thường -> Cho mua
  return (
    <Button 
      className="w-full h-9 text-sm bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 transition-all duration-300"
    >
       <Plus className="mr-1 h-4 w-4" /> Thêm vào giỏ
    </Button>
  );
}

export function ProductCard({ product }: ProductCardProps) {

  const user = useAuthStore((state) => state.user);
  const isOwner = (user && user.id === product.sellerId) ?? false;
  const isAdmin = useAuthStore((state) => state.user?.roles?.includes(Role.ADMIN)) ?? false;

  // State quản lý slide ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Tổng hợp danh sách ảnh: Ưu tiên mảng images, nếu rỗng thì dùng thumbnail
  const imageList = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail || "/placeholder.jpg"];

  // Logic hàng hóa
  const isOutOfStock = product.availableQuantity <= 0;
  const isLowStock = product.availableQuantity > 0 && product.availableQuantity < 10;

  const shouldDisableBuy = isOwner || isAdmin || isOutOfStock;

  // --- HANDLERS SLIDE ẢNH ---
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn Link click
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn Link click
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <Card className="group overflow-hidden rounded-lg border hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white relative">

      {/* 1. KHU VỰC HÌNH ẢNH (SLIDER) */}
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
        <Link href={`/products/${product.productId}`} className="block w-full h-full">
          <Image
            src={imageList[currentImageIndex]}
            alt={`${product.name} - ảnh ${currentImageIndex + 1}`}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-80" : ""}`}
            unoptimized
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isFlashSale && !isOutOfStock && (
            <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 shadow-sm">
              FLASH SALE
            </Badge>
          )}
          {product.isPreOrder && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] font-bold px-2 py-0.5 shadow-sm border-none text-white">
              ĐẶT TRƯỚC
            </Badge>
          )}
        </div>

        {/* --- UI SLIDER CONTROL (Chỉ hiện khi hover và có > 1 ảnh) --- */}
        {imageList.length > 1 && !isOutOfStock && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Dots indicator nhỏ bên dưới */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {imageList.map((_, idx) => (
                <div key={idx} className={`h-1.5 w-1.5 rounded-full shadow-sm ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-white font-bold border-2 border-white px-3 py-1 rounded-md transform -rotate-12 whitespace-nowrap">
              HẾT HÀNG
            </span>
          </div>
        )}
      </div>

      {/* 2. NỘI DUNG THÔNG TIN */}
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Ngày thu hoạch (Nếu có) */}
        {product.isPreOrder && product.expectedHarvestDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-orange-700 bg-orange-50 p-1.5 rounded mb-2 border border-orange-100">
            <Calendar className="h-3 w-3" />
            <span>Thu hoạch: <b>{format(new Date(product.expectedHarvestDate), "dd/MM/yyyy HH:mm", { locale: vi })}</b></span>
          </div>
        )}

        <Link href={`/products/${product.productId}`} className="group-hover:text-green-700 transition-colors">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 min-h-10 mb-1" title={product.name}>
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

        {/* Thông tin bổ sung */}
        <div className="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1.5">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-500">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>Đã bán {product.soldCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 shrink-0" />
              {isOutOfStock ? (
                <span className="text-gray-400">0</span>
              ) : (
                <span className={isLowStock ? "text-red-500 font-bold" : "text-green-700 font-medium"}>
                  Có sẵn: {product.availableQuantity}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* 3. NÚT THÊM VÀO GIỎ */}
      <CardFooter className="p-3 pt-0">
        {/* Nếu bị disable (Admin, Owner, Hết hàng) -> Render thẳng nút, KHÔNG bọc Modal */}
        {shouldDisableBuy ? (
          <ActionButton 
              isOwner={isOwner} 
              isAdmin={isAdmin} 
              isOutOfStock={isOutOfStock} 
          />
        ) : (
          <AddToCartModal product={{
            id: product.productId,
            name: product.name,
            price: product.price,
            image: product.thumbnail, // Lưu ý check lại prop name của modal (thumbnail hay image)
            unit: product.unit,
            availableQuantity: product.availableQuantity
          }}>
            {/* Vẫn truyền props vào để render đúng style nút "Thêm vào giỏ" */}
            <ActionButton 
                isOwner={isOwner} 
                isAdmin={isAdmin} 
                isOutOfStock={isOutOfStock} 
            />
          </AddToCartModal>
        )}
      </CardFooter>
    </Card>
  );
}