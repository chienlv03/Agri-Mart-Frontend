"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Lấy trang hiện tại từ URL (Mặc định là 1 nếu không có)
  const currentPage = Number(searchParams.get("page")) || 1;

  // 2. Hàm tạo URL mới giữ nguyên các params cũ
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // 3. Hàm chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(createPageURL(page));
      // Scroll lên đầu vùng kết quả (nếu cần thiết thì thêm logic scroll)
    }
  };

  // 4. Logic tạo danh sách số trang (Ví dụ: 1 ... 4 5 6 ... 10)
  const generatePagination = () => {
    // Nếu tổng trang <= 7, hiện tất cả
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Nếu đang ở gần đầu (1, 2, 3)
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages - 1, totalPages];
    }

    // Nếu đang ở gần cuối
    if (currentPage >= totalPages - 2) {
      return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    // Nếu ở giữa
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // Ẩn nếu chỉ có 0 hoặc 1 trang
  if (totalPages <= 1) return null;

  const allPages = generatePagination();

  return (
    <div className="flex items-center gap-2">
      {/* Nút Previous */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Danh sách số trang */}
      {allPages.map((page, index) => {
        if (page === "...") {
          return (
            <div key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </div>
          );
        }

        const pageNumber = Number(page);
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={page}
            variant={isActive ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-9 w-9",
              isActive ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "text-gray-600"
            )}
            onClick={() => handlePageChange(pageNumber)}
          >
            {page}
          </Button>
        );
      })}

      {/* Nút Next */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}