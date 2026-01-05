import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { UserService } from "@/services/user.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Store } from "lucide-react";
import { ShopProductList } from "@/components/product/shop-product-list";
import { FollowService } from "@/services/follow.service";
import { ShopHeader } from "@/components/seller/shop-header";
import { Header } from "@/components/shared/header";
import { getAuthHeaders } from "@/lib/server-api-utils";


export default async function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sellerId = resolvedParams.id;

  const headers = await getAuthHeaders();


  // 1. Fetch song song dữ liệu Seller và Sản phẩm
  const [sellerData, productsData, followerCountData] = await Promise.allSettled([
    UserService.getSellerPublicProfile(sellerId),
    ProductService.getProductsBySeller(sellerId, 0, 12),
    FollowService.getFollowerCount(sellerId, headers)
  ]);

  // Kiểm tra nếu không tìm thấy Shop
  if (sellerData.status === "rejected" || !sellerData.value) {
    return notFound();
  }

  const seller = sellerData.value;
  const initialProducts = productsData.status === "fulfilled" ? productsData.value.content : [];
  const totalProducts = productsData.status === "fulfilled" ? productsData.value.totalElements : 0;
  const followerCount = followerCountData.status === "fulfilled" ? followerCountData.value : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <Header />
      <main>
        <div className="min-h-screen bg-gray-50 pb-20">

          {/* --- PHẦN 1: SHOP HEADER INFO --- */}
          <ShopHeader
            seller={seller}
            totalProducts={totalProducts}
            initialFollowerCount={followerCount}
          />

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
                            <Image src={photo} alt="Farm" fill className="object-cover" unoptimized loading="eager" />
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
      </main>
    </div>
  );
}