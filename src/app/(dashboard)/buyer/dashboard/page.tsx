"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Truck, CheckCircle, Wallet, 
  Store, ArrowRight, Sprout, LayoutDashboard 
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore"; // Import store
import { Role } from "@/types/auth.types";

export default function BuyerDashboard() {
  const { user } = useAuthStore();

  // Kiểm tra role (Giả sử backend trả về mảng roles: ["USER", "SELLER"])
  const isSeller = user?.roles?.includes(Role.SELLER);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Hồ sơ của tôi</h1>
      </div>

      {/* --- BANNER ĐIỀU HƯỚNG KÊNH NGƯỜI BÁN --- */}
      <div className="grid gap-4">
        <Card className={`border shadow-sm ${isSeller ? 'bg-blue-50 border-blue-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isSeller ? 'text-blue-800' : 'text-green-800'}`}>
                  {isSeller ? "Kênh Người Bán" : "Bạn có nông sản muốn bán?"}
                </h3>
                <p className={`text-sm mt-1 ${isSeller ? 'text-blue-700' : 'text-green-700'}`}>
                  {isSeller 
                    ? "Quản lý sản phẩm, đơn hàng và doanh thu tại Dashboard riêng." 
                    : "Đăng ký trở thành Đối tác ngay hôm nay để tiếp cận hàng triệu khách hàng."}
                </p>
              </div>
            </div>
            
            <Link href={isSeller ? "/seller/dashboard" : "/seller/profile"}>
              <Button className={`shadow-md whitespace-nowrap ${isSeller ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isSeller ? (
                    <>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Vào Dashboard
                    </>
                ) : (
                    <>
                        <Sprout className="mr-2 h-4 w-4" /> Đăng ký bán hàng <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* --- CÁC THỐNG KÊ NGƯỜI MUA (GIỮ NGUYÊN) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Đơn hàng mới đặt</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Sắp đến nơi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã mua</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Tổng đơn thành công</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Mã giảm giá khả dụng</p>
          </CardContent>
        </Card>
      </div>

      {/* Đơn hàng gần đây */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mb-2 opacity-20" />
              <p>Bạn chưa có đơn hàng nào.</p>
              <Link href="/" className="text-green-600 hover:underline mt-2">
                Dạo chợ ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}