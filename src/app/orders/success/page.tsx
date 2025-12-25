import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
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
        <Link href="/seller/orders">
          <Button variant="outline">Xem đơn hàng của tôi</Button>
        </Link>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}