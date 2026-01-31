"use client"; // <--- Bắt buộc để dùng useAuthStore

import { useAuthStore } from "@/store/useAuthStore";
import { ProductResponse } from "@/types/product.type";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Store, MessageCircle } from "lucide-react";
import { ProductActions } from "@/components/product/product-actions";
import Link from "next/link";
import { Role } from "@/types/auth.types";

interface ProductSellerInfoProps {
    product: ProductResponse;
    canBuy: boolean;
    isOutOfStock: boolean;
}

export function ProductSellerInfo({ product, canBuy, isOutOfStock }: ProductSellerInfoProps) {
    // Lấy user từ Store phía Client
    const user = useAuthStore((state) => state.user);

    // Logic: Nếu là người bán (Owner) thì KHÔNG hiện khung thông tin người bán
    // Nếu chưa đăng nhập (user null) -> Vẫn hiện để khách xem
    const isOwner = user?.id === product.sellerProfileResponse?.sellerId;

    if (isOwner) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm text-center">
                Đây là sản phẩm của bạn. Bạn không thể tự đặt hàng.
            </div>
        );
    }

    return (
        <>
            {/* Khung thông tin người bán */}
            <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Thông tin nhà cung cấp
                    </h3>
                    <Button variant="link" className="text-green-600 p-0 h-auto text-xs">
                        Xem Shop
                    </Button>
                </div>

                <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border border-gray-100 shrink-0">
                        <Image
                            src={product.sellerProfileResponse?.avatarUrl || "/placeholder-avatar.png"}
                            alt="Seller"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-base">
                            {product.sellerProfileResponse?.farmName || product.sellerProfileResponse?.fullName}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                                {product.sellerProfileResponse?.farmAddress || "Đang cập nhật"}
                            </span>
                        </p>

                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] py-0 h-5 border-green-200 text-green-700 bg-green-50">
                                <Store className="w-3 h-3 mr-1" /> Nông trại sạch
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full text-gray-700">
                        <MessageCircle className="h-4 w-4 mr-2" /> Chat ngay
                    </Button>
                    <Link href={`/shops/${product.sellerProfileResponse?.sellerId}`}>
                        <Button variant="outline" size="sm" className="w-full text-gray-700 cursor-pointer">
                            <Store className="h-4 w-4 mr-2" /> Xem hồ sơ
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Buttons Action (Mua hàng) */}
            {user && !user.roles.includes(Role.ADMIN) && (
            <ProductActions
                productId={product.id}
                availableQuantity={product.availableQuantity}
                isPreOrder={product.isPreOrder}
                canBuy={canBuy}
            />
            )}

            {!canBuy && !isOutOfStock && (
                <p className="text-center text-red-500 text-sm mt-1">
                    Sản phẩm hiện đang ngưng bán
                </p>
            )}
        </>
    );
}