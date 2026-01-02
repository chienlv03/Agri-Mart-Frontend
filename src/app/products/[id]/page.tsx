import { Header } from "@/components/shared/header";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Truck, Star,
  Calendar, PlayCircle, Package
} from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ProductSellerInfo } from "@/components/seller/product-seller-info";

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  let product = null;

  try {
    product = await ProductService.getProductById(id);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    return notFound();
  }

  if (!product) return notFound();

  // Logic kiểm tra trạng thái mua hàng
  const isOutOfStock = product.availableQuantity <= 0;
  const isClosed = product.status === 'CLOSED' || product.status === 'SOLD_OUT';
  const canBuy = !isOutOfStock && !isClosed && product.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-8">

        {/* 1. BREADCRUMB & BACK */}
        <div className="flex flex-col gap-2 mb-6">
          <div><BackButton /></div>
          <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
            <span className="hover:text-green-600 cursor-pointer">Trang chủ</span>
            <span>/</span>
            <span className="hover:text-green-600 cursor-pointer">Sản phẩm</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* --- CỘT TRÁI: ẢNH SẢN PHẨM --- */}
          <div>
            <ProductGallery
              images={product.images && product.images.length > 0
                ? product.images
                : [product.thumbnail || "/placeholder.jpg"]}
            />
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
          <div className="flex flex-col gap-5">

            {/* Tên & Badge */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {product.isPreOrder && (
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                    Hàng đặt trước
                  </Badge>
                )}
                {product.attributes?.instantDeliveryOnly && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                    Giao hỏa tốc
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 font-medium pt-0.5">{product.ratingAverage || 0}</span>
                  <span className="text-gray-400 ml-1">({product.reviewCount || 0} đánh giá)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Đã bán {product.soldCount}</span>
              </div>
            </div>

            {/* --- QUAN TRỌNG: NGÀY THU HOẠCH (PRE-ORDER) --- */}
            {product.isPreOrder && product.expectedHarvestDate && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Dự kiến thu hoạch: {format(new Date(product.expectedHarvestDate), "dd/MM/yyyy", { locale: vi })}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Đây là hàng đặt trước. Sản phẩm sẽ được gửi đi ngay sau khi thu hoạch để đảm bảo tươi ngon nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Giá & Kho hàng */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-gray-600 font-medium mb-1">/ {product.unit}</span>
              </div>

              {/* Hiển thị số lượng tồn kho */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">Hết hàng</span>
                ) : (
                  <span>Sẵn có: <span className="font-medium text-gray-900">{product.availableQuantity}</span> {product.unit}</span>
                )}
              </div>
            </div>

            {/* Thông tin vận chuyển */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Xuất xứ:</span>{" "}
                  <span className="text-gray-600">{product.attributes?.origin || "Việt Nam"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Vận chuyển:</span>{" "}
                  <span className="text-gray-600">
                    {product.attributes?.instantDeliveryOnly
                      ? `Chỉ giao Hỏa tốc trong bán kính ${product.attributes.maxDeliveryRadius}km`
                      : "Giao hàng tiêu chuẩn toàn quốc"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* --- THÔNG TIN NGƯỜI BÁN CHI TIẾT --- */}
            <ProductSellerInfo 
                product={product} 
                canBuy={canBuy} 
                isOutOfStock={isOutOfStock} 
            />

          </div>
        </div>

        {/* --- TABS: MÔ TẢ & VIDEO --- */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 px-6 py-3"
              >
                Mô tả sản phẩm
              </TabsTrigger>
              {/* Chỉ hiện Tab Video nếu có video */}
              {product.videos && product.videos.length > 0 && (
                <TabsTrigger
                  value="video"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 px-6 py-3 flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Video thực tế
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 px-6 py-3"
              >
                Đánh giá ({product.reviewCount || 0})
              </TabsTrigger>
            </TabsList>

            {/* CONTENT: MÔ TẢ */}
            <TabsContent value="description" className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </div>

              {/* Bảng thông số kỹ thuật nhỏ */}
              <div className="mt-8 border rounded-lg overflow-hidden max-w-2xl">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y">
                    <tr className="bg-gray-50"><td className="p-3 font-medium w-1/3">Loại sản phẩm</td><td className="p-3">Nông sản sạch</td></tr>
                    <tr><td className="p-3 font-medium">Hạn sử dụng</td><td className="p-3">{product.attributes?.expiryDays} ngày</td></tr>
                    <tr className="bg-gray-50"><td className="p-3 font-medium">Bảo quản</td><td className="p-3">{product.attributes?.preservation}</td></tr>
                    <tr><td className="p-3 font-medium">Chứng nhận</td><td className="p-3">
                      {product.attributes?.certifications?.map(c => c.type).join(", ") || "Đang cập nhật"}
                    </td></tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* CONTENT: VIDEO */}
            {product.videos && product.videos.length > 0 && (
              <TabsContent value="video" className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid md:grid-cols-2 gap-6">
                  {product.videos.map((videoUrl, idx) => (
                    <div key={idx} className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        poster={product.thumbnail} // Dùng thumbnail làm ảnh bìa video
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2 italic">* Video được quay thực tế tại vườn.</p>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-6">
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Star className="w-10 h-10 mb-2 text-gray-300" />
                <p>Chức năng đánh giá đang được phát triển.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </main>
    </div>
  );
}