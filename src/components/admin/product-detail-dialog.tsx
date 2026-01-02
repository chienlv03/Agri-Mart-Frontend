"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductResponse } from "@/types/product.type";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Calendar, ShieldCheck, 
  Package, Tag, Store, Info 
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface ProductDetailDialogProps {
  product: ProductResponse;
  children: React.ReactNode;
}

export function ProductDetailDialog({ product, children }: ProductDetailDialogProps) {
  // State để quản lý ảnh đang hiển thị chính
  const [activeImage, setActiveImage] = useState<string>(product.thumbnail || "/placeholder.jpg");

  // Gộp thumbnail và danh sách ảnh phụ thành 1 mảng để hiển thị gallery
  // Sử dụng Set để loại bỏ ảnh trùng lặp nếu có
  const galleryImages = Array.from(new Set([
    product.thumbnail || "/placeholder.jpg",
    ...(product.images || [])
  ]));

  // Helper format tiền tệ
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* 1. Tăng kích thước Dialog */}
      <DialogContent className="w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
        
        {/* Header cố định */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 shrink-0">
          <DialogTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
            <Info className="w-5 h-5" /> Chi tiết sản phẩm
          </DialogTitle>
        </DialogHeader>
        
        {/* Phần nội dung cuộn */}
        <ScrollArea className="flex-1">
          {/* 2. Chia Layout Grid 5 cột (3 ảnh - 2 thông tin) */}
          <div className="grid lg:grid-cols-5 gap-0 h-full">
            
            {/* Cột Trái: Gallery Ảnh (Chiếm 3 phần) */}
            <div className="lg:col-span-3 bg-gray-50 p-6 flex flex-col gap-4 border-r">
              {/* Ảnh chính to */}
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden border shadow-sm bg-white">
                <Image 
                  src={activeImage} 
                  alt={product.name} 
                  fill 
                  className="object-contain" 
                  unoptimized
                />
                {/* Badge trạng thái trên ảnh */}
                {product.isPreOrder && (
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-md px-3 py-1 shadow-sm">
                            Đặt trước
                        </Badge>
                    </div>
                )}
              </div>

              {/* 3. Danh sách ảnh nhỏ (Thumbnails) */}
              {galleryImages.length > 0 && (
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <div className="flex gap-3">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === img ? "border-green-600 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={img} alt={`thumb-${idx}`} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>

            {/* Cột Phải: Thông tin chi tiết (Chiếm 2 phần) */}
            <div className="lg:col-span-2 p-6 flex flex-col gap-6 bg-white">
              
              {/* Tên và Giá */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-700">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-gray-500 font-medium">
                    /{product.unit}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Thông số kỹ thuật (Grid 2x2) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
                    <Calendar className="w-4 h-4" /> Thu hoạch
                  </div>
                  <span className="text-gray-900 font-medium">
                    {product.expectedHarvestDate 
                        ? format(new Date(product.expectedHarvestDate), "dd/MM/yyyy", { locale: vi }) 
                        : "Có sẵn"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                    <MapPin className="w-4 h-4" /> Xuất xứ
                  </div>
                  <span className="text-gray-900 font-medium truncate" title={product.attributes?.origin}>
                    {product.attributes?.origin || "Việt Nam"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Bảo quản
                  </div>
                  <span className="text-gray-900 font-medium truncate" title={product.attributes?.preservation}>
                    {product.attributes?.preservation || "Thường"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-700 text-sm font-semibold">
                    <Package className="w-4 h-4" /> Tồn kho
                  </div>
                  <span className="text-gray-900 font-medium">
                    {product.availableQuantity} {product.unit}
                  </span>
                </div>
              </div>

              {/* Thông tin người bán (Card) */}
              <div className="bg-gray-50 rounded-xl p-4 border flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 shadow-sm">
                    <Store className="w-6 h-6" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Nhà cung cấp</p>
                    <p className="font-bold text-gray-900 text-lg truncate">
                        {product.sellerProfileResponse?.farmName || product.sellerProfileResponse?.fullName}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                            {product.sellerProfileResponse?.farmAddress || "Đang cập nhật"}
                        </span>
                    </div>
                 </div>
              </div>

              {/* Mô tả */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" /> Mô tả sản phẩm
                </h3>
                <ScrollArea className="h-[150px] w-full rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description || "Chưa có mô tả cho sản phẩm này."}
                  </p>
                </ScrollArea>
              </div>

            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}