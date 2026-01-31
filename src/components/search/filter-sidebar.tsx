"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/product.type"; // Import Type

// 1. Định nghĩa Props nhận vào
interface FilterSidebarProps {
  categories: Category[]; // Dữ liệu thật từ DB
}

// Danh sách xuất xứ (Thường ít thay đổi nên có thể hardcode hoặc fetch nếu muốn)
const ORIGINS = [
  { id: "Hà Nội", name: "Hà Nội" },
  { id: "Đà Lạt", name: "Đà Lạt" },
  { id: "Mộc Châu", name: "Mộc Châu" },
  { id: "Miền Tây", name: "Miền Tây" },
];

// 2. Nhận props vào component
export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  const updateQuery = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value) current.delete(key);
    else current.set(key, value);
    current.delete("page");
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/search${query}`, { scroll: false });
  };

  const handlePriceApply = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (priceRange.min) current.set("minPrice", priceRange.min);
    else current.delete("minPrice");
    if (priceRange.max) current.set("maxPrice", priceRange.max);
    else current.delete("maxPrice");
    current.delete("page");
    router.push(`/search?${current.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    const keyword = searchParams.get("keyword");
    if (keyword) router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
    else router.push("/search");
    setPriceRange({ min: "", max: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header: Bộ lọc + Nút Xóa */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" /> Bộ lọc
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs"
        >
          Xóa tất cả
        </Button>
      </div>

      {/* 1. Filter theo Danh mục */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-900">Danh mục</h4>
        <div className="space-y-2">
          {categories.map((cat) => {
            const isActive = searchParams.get("categoryId") === cat.id;
            return (
              <div
                key={cat.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-sm hover:text-green-600 transition-colors",
                  isActive ? "font-bold text-green-700" : "text-gray-600"
                )}
                onClick={() => updateQuery("categoryId", isActive ? null : cat.id)} // Click lại để bỏ chọn
              >
                <Checkbox checked={isActive} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                <span>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filter theo Loại hàng (Pre-order) */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="font-semibold text-sm text-gray-900">Loại sản phẩm</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preorder"
              checked={searchParams.get("isPreOrder") === "true"}
              onCheckedChange={(checked) => updateQuery("isPreOrder", checked ? "true" : null)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <label
              htmlFor="preorder"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Hàng đặt trước (Pre-order)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              disabled
              id="featured"
              checked={searchParams.get("isFeatured") === "true"}
              onCheckedChange={(checked) => updateQuery("isFeatured", checked ? "true" : null)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Sản phẩm nổi bật
            </label>
          </div>
        </div>
      </div>

      {/* 3. Filter theo Khoảng giá */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="font-semibold text-sm text-gray-900">Khoảng giá (VNĐ)</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            className="h-8 text-sm"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Đến"
            className="h-8 text-sm"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />
        </div>
        <Button
          className="w-full h-8 bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider"
          onClick={handlePriceApply}
        >
          Áp dụng
        </Button>
      </div>

      {/* 4. Filter theo Xuất xứ */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="font-semibold text-sm text-gray-900">Nơi bán / Xuất xứ</h4>
        <div className="space-y-2">
          {ORIGINS.map((origin) => {
            const isActive = searchParams.get("origin") === origin.id;
            return (
              <div
                key={origin.id}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => updateQuery("origin", isActive ? null : origin.id)}
              >
                <Checkbox disabled checked={isActive} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                <label className="text-sm text-gray-600 cursor-pointer">{origin.name}</label>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Đánh giá (Option thêm) */}
      <div className="space-y-3 border-t pt-6">
        <h4 className="font-semibold text-sm text-gray-900">Đánh giá</h4>
        <div className="space-y-1">
          {[5, 4, 3].map((star) => (
            <div
              key={star}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded -ml-1"
            // Logic filter rating nếu backend hỗ trợ
            // onClick={() => updateQuery("minRating", star.toString())}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn("w-4 h-4", i < star ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-xs">trở lên</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}