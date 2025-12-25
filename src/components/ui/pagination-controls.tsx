import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;       // Trang hiện tại (bắt đầu từ 0)
  totalPages: number;        // Tổng số trang (Backend trả về)
  onPageChange: (page: number) => void; // Hàm xử lý khi bấm nút
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="text-sm text-muted-foreground mr-4">
        Trang {currentPage + 1} / {totalPages}
      </div>
      
      {/* Nút Previous */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0} // Vô hiệu hóa nếu đang ở trang đầu
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Trước
      </Button>

      {/* Nút Next */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1} // Vô hiệu hóa nếu đang ở trang cuối
      >
        Sau <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}