import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { UserService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Star, MessageCircle, UserPlus, 
  Store, CheckCircle2, Package 
} from "lucide-react";
import { format } from "date-fns";
import { BackButton } from "@/components/shared/back-button";
import { ShopProductList } from "@/components/product/shop-product-list";


export default async function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sellerId = resolvedParams.id;

  // 1. Fetch song song dữ liệu Seller và Sản phẩm
  const [sellerData, productsData] = await Promise.allSettled([
    UserService.getSellerPublicProfile(sellerId),
    ProductService.getProductsBySeller(sellerId, 0, 12) 
  ]);

  // Kiểm tra nếu không tìm thấy Shop
  if (sellerData.status === "rejected" || !sellerData.value) {
    return notFound();
  }

  const seller = sellerData.value;
  const initialProducts = productsData.status === "fulfilled" ? productsData.value.content : [];
  const totalProducts = productsData.status === "fulfilled" ? productsData.value.totalElements : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- PHẦN 1: SHOP HEADER INFO --- */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            {/* Cột Trái: Avatar & Cover */}
            <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
              <BackButton />
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                <Image 
                  src={seller.avatarUrl || "/placeholder-avatar.png"} 
                  alt={seller.fullName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex gap-2 w-full">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 h-9 text-xs md:text-sm">
                  <UserPlus className="w-4 h-4 mr-1" /> Theo dõi
                </Button>
                <Button variant="outline" className="flex-1 h-9 text-xs md:text-sm">
                  <MessageCircle className="w-4 h-4 mr-1" /> Chat
                </Button>
              </div>
            </div>

            {/* Cột Giữa: Thông tin chính */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {seller.farmName || seller.fullName}
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Nông trại xác thực
                </Badge>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Sản phẩm: <b>{totalProducts}</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>Đánh giá: <b>4.9/5.0</b></span>
                </div>
                <div className="flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-gray-400" />
                  <span>Người theo dõi: <b>1.2k</b></span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{seller.farmAddress || "Chưa cập nhật địa chỉ"}</span>
              </div>
            </div>

            {/* Cột Phải: Thông tin phụ (Ẩn trên mobile nếu chật) */}
            <div className="hidden md:block w-64 border-l pl-6 space-y-3 text-sm text-gray-500">
              <div className="flex justify-between">
                 <span>Tham gia:</span>
                 <span className="text-gray-900 font-medium">
                    {seller.createdAt ? format(new Date(seller.createdAt), "dd/MM/yyyy") : "N/A"}
                 </span>
              </div>
              <div className="flex justify-between">
                 <span>Tỉ lệ phản hồi:</span>
                 <span className="text-gray-900 font-medium">98% (Trong vài giờ)</span>
              </div>
              <div className="flex justify-between">
                 <span>Giờ làm việc:</span>
                 <span className="text-gray-900 font-medium">08:00 - 17:00</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* --- PHẦN 2: TABS CONTENT --- */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-6">
            <TabsTrigger 
              value="products" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 px-6 py-3 text-base"
            >
              <Store className="w-4 h-4 mr-2" /> Tất cả sản phẩm
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 px-6 py-3 text-base"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Hồ sơ Nông trại
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SẢN PHẨM */}
          <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-2">
            <ShopProductList 
                initialProducts={initialProducts} 
                sellerId={sellerId} 
                totalElements={totalProducts} 
            />
          </TabsContent>

          {/* TAB 2: GIỚI THIỆU */}
          <TabsContent value="about" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border space-y-6 max-w-4xl">
               <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Giới thiệu</h3>
                  <div className="prose text-gray-600 whitespace-pre-line leading-relaxed">
                     {seller.farmDescription || "Chưa có mô tả giới thiệu về nông trại này."}
                  </div>
               </div>

               <Separator />

               <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Hình ảnh thực tế</h3>
                  {seller.farmPhotos && seller.farmPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {seller.farmPhotos.map((photo: string, idx: number) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                                <Image src={photo} alt="Farm" fill className="object-cover" unoptimized />
                            </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-gray-400 italic">Chưa cập nhật hình ảnh.</p>
                  )}
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}