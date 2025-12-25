import { Header } from "@/components/shared/header";
import { ProductGallery } from "@/components/product/product-gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, ShieldCheck, Truck, MessageCircle, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { BackButton } from "@/components/shared/back-button";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";

// Trang này là Server Component (Tốt cho SEO)
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. Await params để lấy ID thực sự
  const { id } = await params;
  let product = null;

  try {
    // Gọi API lấy chi tiết sản phẩm
    product = await ProductService.getProductById(id);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    // Nếu API lỗi (404 Not Found), chuyển hướng sang trang 404
    return notFound();
  }

  console.log(product.images)

  // Nếu không có sản phẩm (null)
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        
        {/* --- KHU VỰC ĐIỀU HƯỚNG --- */}
        <div className="flex flex-col gap-2 mb-6">
          {/* Nút Quay lại */}
          <div>
            <BackButton /> 
          </div>

          {/* Breadcrumb (Sửa lại chút cho đẹp hơn) */}
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="hover:text-green-600 cursor-pointer">Trang chủ</span> 
            <span>/</span>
            <span className="hover:text-green-600 cursor-pointer">Rau củ</span> 
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Cột Trái: Ảnh sản phẩm */}
          <div>
            <ProductGallery 
                images={product.images && product.images.length > 0 
                    ? product.images 
                    : [product.thumbnail || "/placeholder.jpg"]} 
            />
          </div>

          {/* Cột Phải: Thông tin chi tiết */}
          <div className="flex flex-col gap-6">
            
            {/* Tên & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 font-medium text-sm pt-0.5">{product.ratingAverage}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">Đã bán {product.soldCount}</span>
                <span className="text-gray-300">|</span>
                {product.attributes?.certifications?.length > 0 && (
                  <Badge variant="secondary" className="text-green-700 bg-green-100 hover:bg-green-200">
                    {product.attributes.certifications.map(cert => cert.type).join(", ")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Giá tiền */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">
                  {product.price.toLocaleString("vi-VN")}₫
                </span>
                <span className="text-gray-600 font-medium">/ {product.unit}</span>
              </div>
            </div>

            {/* Thông tin vận chuyển & Nguồn gốc */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Nguồn gốc:</span>{" "}
                  <span className="text-gray-600">{product.attributes.origin}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Vận chuyển:</span>{" "}
                  <span className="text-gray-600">Nhanh trong 2h (Nội thành)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-green-700">Cam kết hoàn tiền nếu sản phẩm hư hỏng</span>
              </div>
            </div>

            <Separator />

            {/* Thông tin người bán (Seller) */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border">
                <Image 
                    src={product.seller?.avatar || "https://github.com/shadcn.png"} 
                    alt={product.seller?.name || "Người bán"} 
                    fill 
                    sizes="20"
                    className="object-cover"
                    unoptimized
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{product.seller.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {product.seller?.provinceName || "Toàn quốc"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-green-700 border-green-200 hover:bg-green-50">
                <MessageCircle className="h-4 w-4" /> Chat ngay
              </Button>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4 mt-auto">
              <Button variant="outline" size="lg" className="flex-1 border-green-600 text-green-700 hover:bg-green-50 h-12 text-base">
                <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ
              </Button>
              <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-base shadow-lg shadow-green-200">
                Mua ngay
              </Button>
            </div>

          </div>
        </div>

        {/* Tab Mô tả & Đánh giá */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá ({product.reviewCount || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6 space-y-4">
              <h3 className="font-bold text-lg">Chi tiết sản phẩm</h3>
              <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm bg-gray-50 p-4 rounded-lg max-w-xl">
                <div><span className="font-medium">Loại sản phẩm:</span> Rau củ quả</div>
                <div><span className="font-medium">Hạn sử dụng:</span> {product.attributes.expiryDays} ngày</div>
                <div><span className="font-medium">Bảo quản:</span> {product.attributes?.preservation}</div>
                <div>
                   <span className="font-medium">Chứng nhận:</span>{" "}
                   {product.attributes.certifications?.length > 0 
                     ? product.attributes.certifications.map(cert => cert.type).join(", ") 
                     : "Chưa có"}
                </div>
                <div><span className="font-medium">Quy cách:</span> {product.unit}</div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <p className="text-gray-500 italic">Chức năng đánh giá đang được phát triển...</p>
            </TabsContent>
          </Tabs>
        </div>

      </main>
    </div>
  );
}