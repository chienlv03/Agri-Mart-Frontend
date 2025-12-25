import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-cart";
import { ChevronRight, MapPin } from "lucide-react";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.type";

export async function ProductFeed() {
  let products: Product[] = [];
  try {
    const res = await ProductService.getActiveProducts({ page: 0, size: 20 });
    products = res.content;
  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
  }

  return (
    <div className="space-y-10">
      
      {/* Section 1: Gần bạn nhất (Tạm thời lấy 5 sản phẩm đầu) */}
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
        
        {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.slice(0, 5).map((product) => (
                <ProductCard 
                    key={product.id} 
                    product={{
                        ...product,
                        // Map lại dữ liệu nếu API trả về khác UI mong đợi
                        image: product.thumbnail || "/placeholder.jpg",
                        location: product.seller?.provinceName || "Toàn quốc",
                        rating: product.ratingAverage || 5.0,
                        sold: product.soldCount || 0,
                        availableQuantity: product.availableQuantity || 0
                    }} 
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">Chưa có sản phẩm nào gần bạn.</div>
        )}
      </section>

      {/* Section 2: Gợi ý hôm nay (Full list) */}
      <section>
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-xl font-bold text-green-800 uppercase tracking-wide border-b-2 border-green-500 pb-1">
            Gợi ý hôm nay
          </h2>
        </div>
        
        {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard 
                    key={`feed-${product.id}`} 
                    product={{
                        ...product,
                        image: product.thumbnail || "/placeholder.jpg",
                        location: product.seller?.provinceName || "Toàn quốc",
                        rating: product.ratingAverage || 5.0,
                        sold: product.soldCount || 0,
                        availableQuantity: product.availableQuantity || 0
                    }} 
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-10 text-gray-500">Hệ thống đang cập nhật sản phẩm mới.</div>
        )}
        
        <div className="mt-8 text-center">
          <Button variant="outline" className="min-w-[200px] hover:text-green-600 hover:border-green-600">
            Xem thêm
          </Button>
        </div>
      </section>
    </div>
  );
}