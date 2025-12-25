"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, Package2, Home, ShoppingCart, Tractor, 
  ShoppingBag, Heart, MapPin, User, Users, BarChart3, ListTree,
  ShieldAlert, ClipboardCheck, 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore"; // Import Store

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Lấy role từ Store
  const { user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const isSeller = user?.userRole === "SELLER";

  // --- MENU CỦA ADMIN ---
  const adminLinks = [
    { href: "/admin/dashboard", icon: <BarChart3 className="h-4 w-4" />, label: "Thống kê" },
    { href: "/admin/users", icon: <Users className="h-4 w-4" />, label: "Quản lý Người dùng" },
    { href: "/admin/categories", icon: <ListTree className="h-4 w-4" />, label: "Quản lý Danh mục" },
    { 
      href: "/admin/products/approvals",
      icon: <ClipboardCheck className="h-4 w-4" />, 
      label: "Duyệt sản phẩm" 
    },
    // { href: "/admin/reports", icon: <ShieldAlert className="h-4 w-4" />, label: "Báo cáo vi phạm" },
  ];

  // Menu cho Nông dân (Seller)
  const sellerLinks = [
    { href: "/seller/dashboard", icon: <Home className="h-4 w-4" />, label: "Tổng quan" },
    { href: "/seller/products", icon: <Package2 className="h-4 w-4" />, label: "Sản phẩm của tôi" },
    { href: "/seller/orders", icon: <ShoppingCart className="h-4 w-4" />, label: "Đơn hàng bán" },
    { href: "/seller/profile", icon: <User className="h-4 w-4" />, label: "Hồ sơ nhà bán hàng" },
  ];

  // Menu cho Người mua (Buyer) - MỚI THÊM
  const buyerLinks = [
    { href: "/buyer/dashboard", icon: <User className="h-4 w-4" />, label: "Hồ sơ của tôi" },
    { href: "/buyer/orders", icon: <ShoppingBag className="h-4 w-4" />, label: "Đơn mua" },
    { href: "/buyer/wishlist", icon: <Heart className="h-4 w-4" />, label: "Yêu thích" },
    { href: "/buyer/address", icon: <MapPin className="h-4 w-4" />, label: "Sổ địa chỉ" },
  ];

  // Logic chọn menu
  let links = buyerLinks; // Mặc định là Buyer
  let title = "Tài Khoản Của Tôi";
  let iconTitle = <User className="h-6 w-6 text-blue-600" />;

  if (isAdmin) {
    links = adminLinks;
    title = "Trang Quản Trị";
    iconTitle = <ShieldAlert className="h-6 w-6 text-red-600" />;
  } else if (isSeller) {
    links = sellerLinks;
    title = "Kênh Người Bán";
    iconTitle = <Tractor className="h-6 w-6 text-green-600" />;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* --- SIDEBAR (Desktop) --- */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {iconTitle}
              <span>{title}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {links.map((link) => (
                <SidebarLink key={link.href} href={link.href} icon={link.icon}>
                  {link.label}
                </SidebarLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  {iconTitle} {title}
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1"></div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive ? "bg-muted text-primary font-bold bg-green-100 text-green-700" : "text-muted-foreground"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}