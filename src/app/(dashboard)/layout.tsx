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
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth.types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes(Role.ADMIN);
  const isSeller = user?.roles.includes(Role.SELLER);

  // --- MENU CỦA ADMIN ---
  const adminLinks = [
    { href: "/admin/dashboard", icon: <BarChart3 className="h-4 w-4" />, label: "Thống kê" },
    { href: "/admin/users", icon: <Users className="h-4 w-4" />, label: "Quản lý Người dùng" },
    { href: "/admin/categories", icon: <ListTree className="h-4 w-4" />, label: "Quản lý Danh mục" },
    { href: "/admin/products/approvals", icon: <ClipboardCheck className="h-4 w-4" />, label: "Duyệt sản phẩm" },
  ];

  // Menu cho Nông dân (Seller)
  const sellerLinks = [
    { href: "/seller/dashboard", icon: <Home className="h-4 w-4" />, label: "Tổng quan" },
    { href: "/seller/products", icon: <Package2 className="h-4 w-4" />, label: "Sản phẩm của tôi" },
    { href: "/seller/orders/sold", icon: <ShoppingCart className="h-4 w-4" />, label: "Đơn hàng bán" },
    { href: "/seller/orders/bought", icon: <ShoppingBag className="h-4 w-4" />, label: "Đơn hàng mua" },
    { href: "/seller/profile", icon: <User className="h-4 w-4" />, label: "Hồ sơ nhà bán hàng" },
    // { href: "/address", icon: <MapPin className="h-4 w-4" />, label: "Sổ địa chỉ" },
  ];

  // Menu cho Người mua (Buyer)
  const buyerLinks = [
    { href: "/buyer/dashboard", icon: <User className="h-4 w-4" />, label: "Hồ sơ của tôi" },
    { href: "/buyer/orders/bought", icon: <ShoppingBag className="h-4 w-4" />, label: "Đơn mua" },
    // { href: "/buyer/wishlist", icon: <Heart className="h-4 w-4" />, label: "Yêu thích" },
    // { href: "/address", icon: <MapPin className="h-4 w-4" />, label: "Sổ địa chỉ" },
  ];

  // Logic chọn menu
  let links = buyerLinks; 
  let title = "Tài Khoản Của Tôi";
  let iconTitle = <User className="h-6 w-6 text-blue-600" />;

  // Kiểm tra đường dẫn hiện tại để render đúng Sidebar
  // Nếu đang ở path /admin/* -> Render Admin Menu
  // Nếu đang ở path /seller/* -> Render Seller Menu
  const pathname = usePathname();
  if (pathname.startsWith("/admin") && isAdmin) {
      links = adminLinks;
      title = "Trang Quản Trị";
      iconTitle = <ShieldAlert className="h-6 w-6 text-red-600" />;
  } else if ((pathname.startsWith("/seller")) && isSeller) {
      links = sellerLinks;
      title = "Kênh Người Bán";
      iconTitle = <Tractor className="h-6 w-6 text-green-600" />;
  }

  return (
    <div className="min-h-screen w-full bg-muted/40">
      
      {/* --- SIDEBAR (Desktop - Fixed) --- */}
      <div className="hidden border-r bg-background md:fixed md:inset-y-0 md:left-0 md:z-10 md:block md:w-[220px] lg:w-[280px]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {iconTitle}
              <span className="">{title}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
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

      {/* --- MAIN CONTENT (Có margin-left để tránh Sidebar) --- */}
      <div className="flex flex-col md:ml-[220px] lg:ml-[280px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[300px]">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  {iconTitle} {title}
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  // Kiểm tra active chính xác hơn (ví dụ /seller/products/create vẫn active menu Products)
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary mb-1",
        isActive ? "font-bold bg-green-50 text-green-700" : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}