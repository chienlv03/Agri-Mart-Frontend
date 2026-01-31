import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { ProductService } from "@/services/product.service";
import { ProductResponse } from "@/types/product.type";
import { ProductCard } from "@/components/product/product-cart";
import { ProductListClient } from "@/components/product/product-list-client"; // Import Client Component

export async function ProductFeed() {
  let initialProducts: ProductResponse[] = [];
  let isLastPage = true;

  try {
    // Fetch trang 0 ban đầu
    const res = await ProductService.getActiveProducts({ page: 0, size: 10 });
    initialProducts = res.content;
    isLastPage = res.last;
  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
  }

  // Helper map cho phần Server Side (Phần "Gần bạn nhất")
  const mapProductToCardProps = (p: ProductResponse) => ({
    productId: p.id,
    sellerId: p.sellerProfileResponse?.sellerId || "",
    name: p.name,
    thumbnail: p.thumbnail || "/placeholder.jpg",
    images: p.images || [],
    price: p.price,
    unit: p.unit,
    location: p.sellerProfileResponse?.farmAddress || "Toàn quốc",
    rating: p.ratingAverage || 5.0,
    soldCount: p.soldCount || 0,
    availableQuantity: p.availableQuantity || 0,
    isFlashSale: false,
    isPreOrder: p.isPreOrder || false,
    expectedHarvestDate: p.expectedHarvestDate,
    sellerName: p.sellerProfileResponse?.fullName
  });

  return (
    <div className="space-y-10">
      
      {/* Section 1: Gần bạn nhất (Giữ nguyên Server Side Rendering cho SEO và tốc độ) */}
      {/* Logic: Lấy 5 sản phẩm đầu tiên của trang 0 để hiển thị demo */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-800">Gần bạn nhất</h2>
          </div>
          <Link href="/products" className="text-sm text-green-600 hover:underline flex items-center font-medium">
            Xem tất cả <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {initialProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {initialProducts.slice(0, 5).map((product) => (
                <ProductCard 
                    key={`near-${product.id}`} 
                    product={mapProductToCardProps(product)} 
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">Chưa có sản phẩm nào gần bạn.</div>
        )}
      </section>

      {/* Section 2: Gợi ý hôm nay (Chuyển sang Client Component để có Load More) */}
      <section>
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-xl font-bold text-green-800 uppercase tracking-wide border-b-2 border-green-500 pb-1">
            Gợi ý hôm nay
          </h2>
        </div>
        
        {/* Truyền dữ liệu khởi tạo vào Client Component */}
        <ProductListClient 
            initialProducts={initialProducts} 
            initialIsLast={isLastPage} 
        />
      </section>
    </div>
  );
}