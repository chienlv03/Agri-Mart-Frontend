"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, AlertCircle } from "lucide-react";

interface RejectProductDialogProps {
  productId: string;
  productName: string;
  onConfirm: (id: string, reason: string) => Promise<void>; // Hàm callback khi bấm xác nhận
}

export function RejectProductDialog({ productId, productName, onConfirm }: RejectProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return; // Bắt buộc nhập lý do

    setLoading(true);
    try {
      await onConfirm(productId, reason);
      setOpen(false);
      setReason(""); // Reset form
    } catch (error) {
      // Lỗi đã được handle ở trang cha hoặc service
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 px-2"
          title="Từ chối sản phẩm"
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Từ chối sản phẩm
          </DialogTitle>
          <DialogDescription>
            Bạn đang từ chối sản phẩm <b>{productName}</b>. Vui lòng nhập lý do để thông báo cho người bán.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason" className="text-right text-sm font-bold text-gray-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Hình ảnh mờ, sai danh mục, giá không hợp lý..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={!reason.trim() || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}