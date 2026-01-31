import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { MapPin, Filter } from "lucide-react";

// Import các component con
import { HomeBanner } from "@/components/home/home-banner";
import { CategoryList } from "@/components/home/category-list";
import { ProductFeed } from "@/components/home/product-feed";
// Import SearchBar vừa tạo
import { SearchBar } from "@/components/shared/search-bar";

// Trang chủ là Server Component (Async)
export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pb-20">
        {/* Thanh tìm kiếm & Địa điểm (Sticky) */}
        <div className="sticky top-16 z-40 bg-white border-b py-3 px-4 shadow-sm">
          <div className="container mx-auto flex gap-3 max-w-6xl">
            
            <SearchBar />

            <Button variant="outline" className="hidden md:flex gap-2 text-gray-600 hover:text-green-600 hover:border-green-600">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Giao đến: <b>Hà Nội</b></span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-6 space-y-10">
          {/* Banner */}
          <HomeBanner />

          {/* Danh mục */}
          <CategoryList />

          {/* Danh sách sản phẩm (Feed) */}
          <ProductFeed />
        </div>
      </main>
      
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <p>© 2025 AgriMart - Nền tảng nông sản Việt</p>
      </footer>
    </div>
  );
}