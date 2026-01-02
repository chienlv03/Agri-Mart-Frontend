"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react"; // (Optional) Thêm Search icon nếu cần
import { useAuthStore } from "@/store/useAuthStore";
import { UserNav } from "@/components/shared/user-nav";
import { CartSheet } from "@/components/cart/cart-sheet"; // <--- 1. IMPORT CART SHEET
import { useEffect, useState } from "react";
import { Role } from "@/types/auth.types";

export function Header() {
  const { isAuthenticated, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Skeleton / Loading state
  if (!mounted) return (
    <header className="px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 font-bold text-xl text-green-700">
        <Leaf className="h-6 w-6" />
        <span>AgriMart</span>
      </div>
    </header>
  );

  return (
    <header className="px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      {/* 1. Logo */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700 hover:opacity-90 transition-opacity">
          <Leaf className="h-6 w-6" />
          <span>AgriMart</span>
        </Link>
      </div>

      <div>
        {/* Menu chính (Desktop) */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-green-600 transition-colors">Trang chủ</Link>
          <Link href="/products" className="hover:text-green-600 transition-colors">Sản phẩm</Link>
          <Link href="/farmers" className="hover:text-green-600 transition-colors">Nông dân</Link>
        </nav>
      </div>

      {/* 3. Khu vực Hành động (Cart + Auth) */}
      <div className="flex items-center gap-3">

        {/* --- LOGIC HIỂN THỊ GIỎ HÀNG --- */}
        {/* Điều kiện: Đã đăng nhập VÀ Role không phải ADMIN */}
        {isAuthenticated && !user?.roles?.includes(Role.ADMIN) && (
           <CartSheet />
        )}

        {/* Phân cách nhỏ (Chỉ hiện khi đã đăng nhập để ngăn cách Cart và User) */}
        {isAuthenticated && (
           <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
        )}

        {isAuthenticated ? (
          // Đã đăng nhập -> Hiện Avatar User
          <UserNav />
        ) : (
          // Chưa đăng nhập -> Hiện nút Login/Register
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm hidden sm:flex">
                Đăng ký
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}