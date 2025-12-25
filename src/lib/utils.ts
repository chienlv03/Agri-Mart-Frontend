import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Hàm cn (có sẵn nếu bạn cài shadcn, giữ nguyên)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- HÀM FORMAT TIỀN TỆ ---
export function formatCurrency(amount: number | string | null | undefined): string {
  // 1. Xử lý trường hợp null, undefined hoặc số 0
  if (!amount) return "0 ₫";

  // 2. Chuyển đổi sang số (phòng trường hợp truyền vào là string "100000")
  const value = Number(amount);

  // 3. Nếu không phải là số hợp lệ thì trả về 0
  if (isNaN(value)) return "0 ₫";

  // 4. Sử dụng Intl.NumberFormat để format chuẩn vi-VN
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0, // Tiền Việt không có số lẻ thập phân
  }).format(value);
}