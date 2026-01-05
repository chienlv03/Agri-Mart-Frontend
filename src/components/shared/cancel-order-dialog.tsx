"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { OrderService } from "@/services/order.service";

// Danh sách lý do hủy định sẵn
const CANCELLATION_REASONS = [
  { id: "change_mind", label: "Tôi muốn thay đổi chi tiết đơn hàng (màu sắc, kích thước...)" },
  { id: "found_cheaper", label: "Tôi tìm thấy nơi khác giá rẻ hơn" },
  { id: "wait_too_long", label: "Thời gian giao hàng quá lâu" },
  { id: "change_address", label: "Tôi muốn đổi địa chỉ giao hàng" },
  { id: "other", label: "Lý do khác" },
];

interface CancelOrderDialogProps {
  orderId: string;
  trigger: React.ReactNode; // Nút bấm kích hoạt popup (Button hoặc Icon)
  onSuccess?: () => void;   // Callback chạy sau khi hủy thành công (để reload lại list)
}

export function CancelOrderDialog({ orderId, trigger, onSuccess }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReasonText, setOtherReasonText] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    // 1. Validate
    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do hủy đơn");
      return;
    }

    let finalReason = "";
    if (selectedReason === "other") {
      if (!otherReasonText.trim()) {
        toast.error("Vui lòng nhập chi tiết lý do khác");
        return;
      }
      finalReason = otherReasonText;
    } else {
      // Lấy label tiếng Việt của lý do đã chọn để gửi về Backend
      const reasonObj = CANCELLATION_REASONS.find(r => r.id === selectedReason);
      finalReason = reasonObj ? reasonObj.label : selectedReason;
    }

    // 2. Call API
    setIsLoading(true);
    try {
      await OrderService.cancelOrder(orderId, finalReason);
      
      toast.success("Đã hủy đơn hàng thành công");
      setOpen(false); // Đóng popup
      
      // Reset form
      setSelectedReason("");
      setOtherReasonText("");

      // Gọi callback để cha reload dữ liệu
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh(); // Fallback reload trang
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Hủy đơn thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Hủy đơn hàng
          </DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="gap-3">
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id} className="cursor-pointer font-normal">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Hiển thị ô nhập text nếu chọn "Lý do khác" */}
          {selectedReason === "other" && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="other-text" className="mb-2 block text-sm font-medium">
                Chi tiết lý do:
              </Label>
              <Textarea
                id="other-text"
                placeholder="Nhập lý do của bạn..."
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
                className="resize-none focus-visible:ring-red-500"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Đóng
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={isLoading || !selectedReason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              "Xác nhận Hủy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}