"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";

export function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Lỗi logout server", error);
    } finally {
      // 2. Xóa state ở Client (Quan trọng nhất)
      logout();
      toast.success("Đã đăng xuất");
      router.push("/");
    }
  };

  // Lấy chữ cái đầu của tên để hiển thị nếu không có ảnh
  const initials = user?.avatarUrl ? user.fullName.charAt(0) : "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-green-200">
            {/* Nếu có avatarUrl thì hiện, không thì hiện fallback */}
            <AvatarImage src={user?.avatarUrl} alt={"avatar"} />
            <AvatarFallback className="bg-green-100 text-green-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.phone}
            </p>
            <span className="text-xs text-green-600 font-semibold mt-1">
              {user?.userRole === 'SELLER' ? 'Người bán' : user?.userRole === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            // Điều hướng thông minh dựa trên Role
            if (user?.userRole === 'SELLER') router.push("/seller/dashboard");
            else if (user?.userRole === 'ADMIN') router.push("/admin/dashboard");
            else router.push("/buyer/dashboard"); // Khách thì vào Buyer Dashboard
          }}>
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </DropdownMenuItem>

          {/* Chỉ hiện Dashboard nếu là SELLER hoặc ADMIN */}
          {(user?.userRole === 'SELLER' || user?.userRole === 'ADMIN') && (
            <DropdownMenuItem onClick={() => router.push(user.userRole === 'SELLER' ? "/seller/dashboard" : "/admin/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Trang quản lý</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}