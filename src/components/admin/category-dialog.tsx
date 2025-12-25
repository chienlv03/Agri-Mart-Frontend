"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, X, ImagePlus, Type, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/types/product.type";
import { CategoryService } from "@/services/category.service";
import Image from "next/image";

interface CategoryDialogProps {
  category?: Category;
  onSuccess: () => void;
  children?: React.ReactNode;
}

interface CategoryFormData {
  name: string;
  description: string;
}

export function CategoryDialog({ category, onSuccess, children }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State quản lý file ảnh
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form khi mở dialog hoặc thay đổi category (Edit mode)
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || "",
        });
        setImagePreview(category.image || null);
      } else {
        reset({ name: "", description: "" });
        setImagePreview(null);
      }
      setSelectedFile(null);
    }
  }, [open, category, reset]);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
      formData.append("data", jsonBlob);

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (category) {
        await CategoryService.updateCategory(category.id, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await CategoryService.createCategory(formData);
        toast.success("Tạo danh mục mới thành công!");
      }
      
      setOpen(false);
      onSuccess(); 
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button>Thêm mới</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-800">
            {category ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho danh mục sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          
          {/* KHU VỰC UPLOAD ẢNH (ĐẸP HƠN) */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Label className="w-full text-left">Icon / Hình ảnh</Label>
            
            {imagePreview ? (
              <div className="relative w-32 h-32 border-2 border-green-500 rounded-xl overflow-hidden group shadow-sm">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="text-white w-8 h-8" />
                </button>
              </div>
            ) : (
              <label 
                htmlFor="category-image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-500 transition-all group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2" />
                  <p className="text-sm text-gray-500 group-hover:text-green-700 font-medium">Bấm để chọn ảnh</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG (Max 2MB)</p>
                </div>
                <Input 
                  id="category-image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="space-y-4">
            {/* Tên danh mục */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-500" /> Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input 
                {...register("name", { required: true })} 
                placeholder="Ví dụ: Rau củ, Trái cây..." 
                className="focus-visible:ring-0"
              />
              {errors.name && <span className="text-xs text-red-500">Tên danh mục là bắt buộc</span>}
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" /> Mô tả
              </Label>
              <Textarea 
                {...register("description")} 
                placeholder="Mô tả ngắn về loại danh mục này..." 
                className="resize-none focus-visible:ring-0"
                rows={3}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy bỏ</Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 min-w-[120px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (category ? "Lưu thay đổi" : "Tạo mới")}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}