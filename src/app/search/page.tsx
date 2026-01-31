import { Header } from "@/components/shared/header";
import { ProductService } from "@/services/product.service";
import { ProductCard } from "@/components/product/product-cart";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { SearchBar } from "@/components/shared/search-bar"; // Tái sử dụng component này
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CategoryService } from "@/services/category.service";
import { Pagination } from "@/components/shared/pagination";
import { ProductResponse } from "@/types/product.type";

interface SearchPageProps {
    searchParams: {
        keyword?: string;
        categoryId?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        page?: string;
        isPreOrder?: string;
        origin?: string;
    };
}

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

export default async function SearchPage(props: SearchPageProps) {

    const searchParams = await props.searchParams;
    // 1. Gọi API Backend
    const [productData, categoriesData] = await Promise.all([
        ProductService.searchProducts({
            keyword: searchParams.keyword,
            categoryId: searchParams.categoryId,
            minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
            maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
            isPreOrder: searchParams.isPreOrder === "true" ? true : searchParams.isPreOrder === "false" ? false : undefined,
            origin: searchParams.origin,
            sortBy: searchParams.sort,
            page: searchParams.page ? Number(searchParams.page) - 1 : 0,
            size: 20
        }),
        CategoryService.getAllCategories()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="sticky top-0 z-40 bg-white border-b shadow-sm py-3">
                <div className="container mx-auto max-w-7xl px-4 flex gap-8 items-center">


                    <div className="hidden lg:block w-64 shrink-0">
                        <span className="text-sm font-semibold text-gray-500">Bộ lọc tìm kiếm</span>
                    </div>

                    {/* 2. Thanh Search Bar: Bây giờ sẽ nằm thẳng hàng với phần nội dung chính */}
                    <div className="flex-1 max-w-3xl">
                        <SearchBar />
                    </div>

                    {/* Nút Filter cho Mobile */}
                    <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {/* ------------------------------------------------------------------ */}

            <main className="container mx-auto max-w-7xl px-4 py-8 flex gap-8">

                {/* Sidebar Bộ lọc (Desktop Only) */}
                <aside className="hidden lg:block w-64 shrink-0 space-y-6">
                    <FilterSidebar categories={categoriesData} />
                </aside>

                {/* Khu vực chính */}
                <div className="flex-1">
                    {/* Header kết quả & Sắp xếp */}
                    {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {searchParams.keyword
                                    ? `Kết quả cho "${searchParams.keyword}"`
                                    : "Tất cả sản phẩm"}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Tìm thấy <b>{productData.totalElements}</b> sản phẩm phù hợp
                            </p>
                        </div>

                        Dropdown Sắp xếp (Client Logic đơn giản dùng Link hoặc Router)
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 hidden sm:inline">Sắp xếp:</span>
                            Đây là ví dụ UI, bạn cần bọc cái này vào Client Component để handle onChange URL
                            <Select defaultValue={searchParams.sort || "newest"}>
                                <SelectTrigger className="w-[180px] bg-white">
                                    <SelectValue placeholder="Mới nhất" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Mới nhất</SelectItem>
                                    <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                                    <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                                    <SelectItem value="best_selling">Bán chạy nhất</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div> */}

                    {/* Grid Sản phẩm */}
                    {productData.content.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ArrowUpDown className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500 mt-2 max-w-md text-center">
                                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn. Hãy thử từ khóa khác xem sao.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {productData.content.map((product) => (
                                <ProductCard
                                    key={`near-${product.id}`}
                                    product={mapProductToCardProps(product)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-10 flex justify-center py-4">
                        <Pagination totalPages={productData.totalPages} />
                    </div>
                </div>
            </main>
        </div>
    );
}