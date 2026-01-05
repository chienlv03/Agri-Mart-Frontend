// components/shop/shop-header.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin, Star, MessageCircle, UserPlus, Package, CheckCircle2
} from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { FollowButton } from "@/components/shared/FollowButton";
import { SellerInfo } from "@/types/user.type";

// Định nghĩa props nhận từ Server
interface ShopHeaderProps {
    seller: SellerInfo;
    totalProducts: number;
    initialFollowerCount: number;
}

export function ShopHeader({ seller, totalProducts, initialFollowerCount }: ShopHeaderProps) {
    // State quản lý số lượng follower hiển thị
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);

    // Hàm này sẽ được truyền vào FollowButton
    const handleFollowChange = (isFollowing: boolean) => {
        if (isFollowing) {
            setFollowerCount((prev) => prev + 1); // Đang follow -> Tăng 1
        } else {
            setFollowerCount((prev) => prev - 1); // Hủy follow -> Giảm 1
        }
    };

    return (
        <div className="bg-white border-b shadow-sm">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">

                    {/* Cột Trái: Avatar & Cover */}
                    <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
                        <BackButton />
                        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                            <Image
                                src={seller.avatarUrl || "/placeholder-avatar.png"}
                                alt={seller.fullName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex gap-2 w-full">
                            {/* Truyền callback vào đây */}
                            <FollowButton
                                shopId={seller.sellerId}
                                onFollowChange={handleFollowChange}
                            />
                            <Button variant="outline" className="flex-1 h-9 text-xs md:text-sm">
                                <MessageCircle className="w-4 h-4 mr-1" /> Chat
                            </Button>
                        </div>
                    </div>

                    {/* Cột Giữa: Thông tin chính */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {seller.farmName || seller.fullName}
                            </h1>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Nông trại xác thực
                            </Badge>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span>Sản phẩm: <b>{totalProducts}</b></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>Đánh giá: <b>4.9/5.0</b></span>
                            </div>

                            {/* Hiển thị State followerCount thay vì prop tĩnh */}
                            <div className="flex items-center gap-1">
                                <UserPlus className="w-4 h-4 text-gray-400" />
                                <span className="transition-all duration-300">
                                    Người theo dõi: <b>{followerCount}</b>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span>{seller.farmAddress || "Chưa cập nhật địa chỉ"}</span>
                        </div>
                    </div>

                    {/* Cột Phải: Giữ nguyên (Cắt bớt cho gọn code demo) */}
                    {/* <div className="hidden md:block w-64 border-l pl-6 space-y-3 text-sm text-gray-500">
                        <div className="flex justify-between">
                            <span>Tham gia:</span>
                            <span className="text-gray-900 font-medium">
                                {seller.createdAt ? format(new Date(seller.createdAt), "dd/MM/yyyy") : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tỉ lệ phản hồi:</span>
                            <span className="text-gray-900 font-medium">98% (Trong vài giờ)</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Giờ làm việc:</span>
                            <span className="text-gray-900 font-medium">08:00 - 17:00</span>
                        </div>
                    </div> */}

                </div>
            </div>
        </div>
    );
}