"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product/product-cart";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProductResponse } from "@/types/product.type";
import { ProductService } from "@/services/product.service";

// Hàm map dữ liệu (Đưa ra ngoài hoặc import từ utils để dùng chung)
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
  sellerName: p.sellerProfileResponse?.fullName,
});

interface ProductListClientProps {
  initialProducts: ProductResponse[];
  initialIsLast: boolean; // Kiểm tra xem trang đầu tiên đã là trang cuối chưa
}

export function ProductListClient({ initialProducts, initialIsLast }: ProductListClientProps) {
  const [products, setProducts] = useState<ProductResponse[]>(initialProducts);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0 (API hiện tại đã trả về trang 0)
  const [isLast, setIsLast] = useState(initialIsLast);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    
    // Gọi Server Action
    const res = await ProductService.getActiveProducts({ page: nextPage, size: 10 });

    if (res) {
      setProducts((prev) => [...prev, ...res.content]);
      setPage(nextPage);
      setIsLast(res.last); // Cập nhật trạng thái trang cuối từ API
    } else {
      setIsLast(true); // Nếu lỗi coi như hết dữ liệu
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {/* Grid sản phẩm */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={`feed-${product.id}`}
              product={mapProductToCardProps(product)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Hệ thống đang cập nhật sản phẩm mới.
        </div>
      )}

      {/* Nút Xem thêm */}
      {!isLast && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="min-w-[200px] hover:text-green-600 hover:border-green-600"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      )}
    </>
  );
}