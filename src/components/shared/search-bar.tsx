"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { ProductService } from "@/services/product.service";
import { formatCurrency } from "@/lib/utils"; // Hàm format tiền tệ của bạn

// Định nghĩa kiểu dữ liệu gợi ý (tối giản)
interface ProductSuggestion {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  slug: string;
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref để check click outside

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Áp dụng Debounce (chờ 400ms sau khi ngừng gõ)
  const debouncedKeyword = useDebounce(keyword, 400);

  const updateUrl = (newKeyword: string) => {
    // Tạo bản sao của params hiện tại để giữ lại các filter khác (nếu cần)
    // Hoặc nếu muốn reset filter khi search mới thì new URLSearchParams()

    // Ở đây ta giả định search mới sẽ reset các filter khác để tránh conflict
    // (VD: đang filter "Rau" mà search "Thịt" thì nên reset "Rau")
    const params = new URLSearchParams();

    if (newKeyword.trim()) {
      params.set("keyword", newKeyword.trim());
    } else {
      params.delete("keyword");
    }

    // Nếu đang ở trang search thì replace URL hiện tại
    // Nếu đang ở trang Home thì push sang /search
    if (pathname === "/search") {
      // Nếu xóa trắng keyword ở trang search -> Về trang search gốc (Tất cả sản phẩm)
      router.push(`/search?${params.toString()}`);
    } else {
      // Nếu ở trang khác mà có keyword -> Sang trang search
      if (newKeyword.trim()) {
        router.push(`/search?${params.toString()}`);
      }
    }
  };

  // 2. Effect: Gọi API khi debouncedKeyword thay đổi
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedKeyword.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // Tái sử dụng hàm search cũ, chỉ lấy 5 kết quả
        const data = await ProductService.searchProducts({
          keyword: debouncedKeyword,
          page: 0,
          size: 5
        });
        setSuggestions(data.content as any); // Cast type tạm thời
        setIsOpen(true);
      } catch (error) {
        console.error("Lỗi gợi ý:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedKeyword]);

  // 3. Logic đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý khi nhấn Enter hoặc icon Search
  const handleSearch = () => {
    setIsOpen(false);

    updateUrl(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setKeyword("");
    setSuggestions([]);
    setIsOpen(false);

    if (pathname === "/search") {
      router.push("/search");
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 group">
      {/* --- INPUT --- */}
      <div className="relative">
        <Search
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-green-600 transition-colors"
          onClick={handleSearch}
        />
        <Input
          placeholder="Tìm kiếm: Cà chua, Gạo ST25..."
          className="pl-10 pr-10 bg-gray-50 border-gray-200 focus-visible:ring-green-500 focus:bg-white transition-all"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (e.target.value.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />
        {/* Nút Xóa text hoặc Loading spinner */}
        <div className="absolute right-3 top-2.5">
          {loading ? (
            <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
          ) : keyword ? (
            <X
              className="h-5 w-5 text-gray-400 cursor-pointer hover:text-red-500"
              onClick={clearSearch} // <--- Gọi hàm clearSearch mới
            />
          ) : null}
        </div>
      </div>

      {/* --- POPUP GỢI Ý (DROPDOWN) --- */}
      {isOpen && keyword.trim().length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header gợi ý */}
          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sản phẩm gợi ý
          </div>

          {suggestions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`} // Hoặc slug nếu có
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors cursor-pointer group/item"
                >
                  {/* Ảnh nhỏ */}
                  <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0 bg-white">
                    <Image
                      src={product.thumbnail || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-green-700">
                      {product.name}
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </Link>
              ))}

              {/* Nút xem tất cả */}
              <div
                onClick={handleSearch}
                className="p-3 text-center text-sm text-green-600 font-medium hover:bg-green-50 hover:underline cursor-pointer border-t"
              >
                Xem tất cả kết quả cho &quot;{keyword}&quot;
              </div>
            </div>
          ) : (
            // Trạng thái không tìm thấy
            !loading && (
              <div className="p-8 text-center text-gray-500 text-sm">
                Không tìm thấy sản phẩm nào khớp với từ khóa.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}