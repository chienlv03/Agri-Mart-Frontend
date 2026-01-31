"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { OrderService } from "@/services/order.service";
import { useAuthStore } from "@/store/useAuthStore";
// Không cần import Role nữa vì ta so sánh ID trực tiếp

// 1. Giữ nguyên danh sách lý do
const BUYER_REASONS = [
  "Muốn thay đổi địa chỉ/số điện thoại nhận hàng",
  "Muốn thay đổi sản phẩm trong đơn hàng",
  "Tìm thấy nơi khác giá tốt hơn",
  "Đổi ý, không muốn mua nữa",
  "Khác (Nhập lý do bên dưới)"
];

const SELLER_REASONS = [
  "Hết hàng / Tạm hết hàng",
  "Không thể giao đến địa chỉ này",
  "Sai thông tin giá hoặc mô tả sản phẩm",
  "Người mua yêu cầu hủy",
  "Nghi ngờ đơn hàng spam / giả mạo",
  "Khác (Nhập lý do bên dưới)"
];

interface CancelOrderDialogProps {
  orderId: string;
  sellerId: string; // <--- THÊM PROP NÀY (ID người bán của đơn hàng)
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CancelOrderDialog({ orderId, sellerId, onSuccess, trigger }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const { user } = useAuthStore();

  // 2. LOGIC QUYẾT ĐỊNH VAI TRÒ (Quan trọng)
  // Nếu ID người đang đăng nhập trùng với ID người bán của đơn hàng này => Họ đang đóng vai trò Seller
  const isActingAsSeller = user?.id === sellerId;

  const reasons = isActingAsSeller ? SELLER_REASONS : BUYER_REASONS;
  const dialogTitle = isActingAsSeller ? "Từ chối / Hủy đơn hàng" : "Hủy đơn hàng";
  const dialogDesc = isActingAsSeller 
    ? "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
    : "Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng chọn lý do bên dưới.";

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Vui lòng chọn lý do hủy đơn");
      return;
    }

    const finalReason = reason === "Khác (Nhập lý do bên dưới)" ? otherReason : reason;

    if (!finalReason.trim()) {
      toast.error("Vui lòng nhập chi tiết lý do");
      return;
    }

    try {
      setLoading(true);
      // Gọi API hủy đơn
      await OrderService.cancelOrder(orderId, finalReason);
      
      toast.success("Đã gửi yêu cầu hủy đơn thành công");
      setOpen(false);
      onSuccess?.(); 
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi hủy đơn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="destructive">Hủy đơn</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDesc}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason} className="gap-3">
            {reasons.map((r, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={`r-${index}`} />
                <Label htmlFor={`r-${index}`} className="font-normal cursor-pointer">
                  {r}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === "Khác (Nhập lý do bên dưới)" && (
            <Textarea
              placeholder="Nhập lý do cụ thể..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Đóng
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}