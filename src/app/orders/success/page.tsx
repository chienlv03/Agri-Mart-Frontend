"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth.types";

export default function OrderSuccessPage() {
  const { user } = useAuthStore();

  // Logic xác định đường dẫn:
  // Nếu user có role SELLER -> Về giao diện mua hàng trong Seller Dashboard
  // Ngược lại (Buyer) -> Về giao diện mua hàng của Buyer
  const orderHistoryLink = user?.roles.includes(Role.SELLER)
    ? "/seller/orders/bought"
    : "/buyer/orders/bought"; 
    // Lưu ý: Nếu bạn chưa xây dựng route /buyer/..., hãy đổi dòng trên thành "/orders" hoặc "/profile/orders" tùy router của bạn.

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-green-100 p-6 rounded-full mb-6 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Cảm ơn bạn đã ủng hộ nông sản sạch. Đơn hàng của bạn đang được Người bán chuẩn bị và sẽ sớm được giao đi.
      </p>

      <div className="flex gap-4">
        <Link href={orderHistoryLink}>
          <Button variant="outline">Xem đơn hàng của tôi</Button>
        </Link>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}