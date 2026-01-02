"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product/product-cart";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/product.service";
import { ProductResponse } from "@/types/product.type";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Helper map dữ liệu (Copy từ page cũ sang đây)
const mapProductToCard = (p: ProductResponse) => ({
  productId: p.id,
  sellerId: p.sellerProfileResponse?.sellerId || "",
  name: p.name,
  images: p.images,
  thumbnail: p.thumbnail || "",
  price: p.price,
  unit: p.unit,
  location: p.sellerProfileResponse?.farmAddress || "Toàn quốc",
  rating: p.ratingAverage,
  soldCount: p.soldCount,
  availableQuantity: p.availableQuantity,
  isPreOrder: p.isPreOrder,
  expectedHarvestDate: p.expectedHarvestDate
});

interface ShopProductListProps {
  initialProducts: ProductResponse[];
  sellerId: string;
  totalElements: number;
}

export function ShopProductList({ initialProducts, sellerId, totalElements }: ShopProductListProps) {
  const [products, setProducts] = useState<ProductResponse[]>(initialProducts);
  const [page, setPage] = useState(1); // Trang tiếp theo sẽ load là trang 1 (vì trang 0 đã load rồi)
  const [loading, setLoading] = useState(false);
  
  // Kiểm tra xem còn sản phẩm để load không
  const hasMore = products.length < totalElements;

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Gọi API tải trang tiếp theo
      // Lưu ý: Đảm bảo service của bạn đã nhận tham số page (như đã sửa ở câu trước)
      const res = await ProductService.getProductsBySeller(sellerId, page, 12);
      
      if (res.content && res.content.length > 0) {
        // Nối sản phẩm mới vào danh sách cũ
        setProducts((prev) => [...prev, ...res.content]);
        setPage((prev) => prev + 1);
      } else {
        // Nếu API trả về rỗng dù totalElements báo vẫn còn (trường hợp edge case)
        toast.info("Đã hiển thị hết sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi tải thêm sản phẩm:", error);
      toast.error("Không thể tải thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed">
        <p className="text-gray-500">Shop chưa có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid sản phẩm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={mapProductToCard(product)} />
          </div>
        ))}
      </div>

      {/* Nút Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="min-w-[150px]"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
              </>
            ) : (
              "Xem thêm sản phẩm"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}