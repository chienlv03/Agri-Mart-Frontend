"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductService } from "@/services/product.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Category } from "@/types/product.type";
import { useRouter } from "next/navigation";
import { Loader2, X, ImagePlus } from "lucide-react";
import { CategoryService } from "@/services/category.service";
import Image from "next/image";

interface ProductFormProps {
  initialData?: any; // Dữ liệu cũ (nếu sửa)
  isEditMode?: boolean;
}

// Định nghĩa form data (nếu muốn strict type)
interface ProductFormData {
  name: string;
  price: string; // Input type number trả về string
  unit: string;
  quantity: string;
  description: string;
  categoryId: string;
  origin: string;
  expiryDays: string;
  harvestDate: string; // ISO string từ datetime-local input
  preservation: string;
  isPreOrder: boolean;
  instantDeliveryOnly: boolean;
  maxDeliveryRadius: string;
}

export function ProductForm({ initialData, isEditMode }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // URL ảnh cũ từ backend

  // 1. Điền dữ liệu cũ vào Form khi init
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || "",
      price: String(initialData?.price || ""),
      unit: initialData?.unit || "",
      quantity: String(initialData?.quantity || ""),
      description: initialData?.description || "",
      categoryId: initialData?.categoryIds?.[0] || "",
      origin: initialData?.attributes?.origin || "",
      expiryDays: String(initialData?.attributes?.expiryDays || ""),
      harvestDate: initialData?.attributes?.harvestDate
        ? new Date(initialData.attributes.harvestDate).toISOString().slice(0, 16)
        : "",
      preservation: initialData?.attributes?.preservation || "",
      isPreOrder: initialData?.attributes?.isPreOrder || false,
      instantDeliveryOnly: initialData?.attributes?.instantDeliveryOnly || false,
      maxDeliveryRadius: String(initialData?.attributes?.maxDeliveryRadius || ""),
    }
  });

  const getInitialSalesType = () => {
    if (initialData?.attributes?.isPreOrder) return "preorder";
    if (initialData?.attributes?.instantDeliveryOnly) return "instant";
    return "normal";
  };

  const [salesType, setSalesType] = useState<"normal" | "preorder" | "instant">(getInitialSalesType());


  // Load danh mục khi vào trang
  useEffect(() => {
    CategoryService.getAllCategories().then(setCategories).catch(console.error);
    // return () => imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }, []);

  // Load ảnh cũ (nếu mode Edit)
  useEffect(() => {
    if (initialData?.images && isEditMode) {
      setExistingImages(initialData.images);
    }
  }, [initialData, isEditMode]);

  // --- XỬ LÝ ẢNH MỚI (UPLOAD) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- XỬ LÝ ẢNH CŨ (GIỮ LẠI HAY XÓA) ---
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    // Validate cơ bản
    if (existingImages.length === 0 && selectedFiles.length === 0) {
      toast.error("Vui lòng có ít nhất 1 ảnh sản phẩm");
      return;
    }

    setLoading(true);
    try {

      const isPreOrder = salesType === 'preorder';
      const instantDeliveryOnly = salesType === 'instant';
      const formData = new FormData();

      // 1. JSON Data
      const productData = {
        name: data.name,
        price: Number(data.price),
        unit: data.unit,
        quantity: Number(data.quantity),
        description: data.description,
        categoryIds: [data.categoryId],
        attributes: {
          origin: data.origin,
          // Chuyển đổi datetime-local sang ISO Instant (Thêm :00Z nếu cần thiết backend parse)
          harvestDate: new Date(data.harvestDate).toISOString(),
          expiryDays: Number(data.expiryDays),
          preservation: data.preservation,
          isPreOrder: isPreOrder,
          instantDeliveryOnly: instantDeliveryOnly,
          maxDeliveryRadius: data.maxDeliveryRadius ? Number(data.maxDeliveryRadius) : null,
        },
        // QUAN TRỌNG CHO EDIT: Gửi danh sách ảnh cũ muốn giữ lại
        keepImages: isEditMode ? existingImages : [],
      };

      // Đóng gói JSON thành Blob
      const jsonBlob = new Blob([JSON.stringify(productData)], { type: "application/json" });
      formData.append("data", jsonBlob);

      // 2. Gửi ảnh MỚI (File objects)
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // 3. Gọi API tương ứng
      if (isEditMode && initialData?.id) {
        await ProductService.updateProduct(initialData.id, formData);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await ProductService.createProduct(formData);
        toast.success("Đăng bán sản phẩm thành công! Chờ Admin duyệt.");
      }

      router.push("/seller/products");

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border shadow-sm">

      {/* Khối thông tin cơ bản */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Thông tin cơ bản</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
            <Input {...register("name", { required: true })} placeholder="Ví dụ: Cà chua Beef VietGAP" />
            {errors.name && <span className="text-xs text-red-500">Bắt buộc nhập</span>}
          </div>
          <div className="space-y-2">
            <Label>Danh mục <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setValue("categoryId", val)}>
              <SelectTrigger><SelectValue placeholder="Chọn loại nông sản" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Giá bán (VNĐ) <span className="text-red-500">*</span></Label>
            <Input type="number" {...register("price", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Đơn vị tính <span className="text-red-500">*</span></Label>
            <Input {...register("unit", { required: true })} placeholder="kg, hộp, bó..." />
          </div>
          <div className="space-y-2">
            <Label>Số lượng mở bán <span className="text-red-500">*</span></Label>
            <Input type="number" {...register("quantity", { required: true })} placeholder="VD: 50" />
          </div>
          <div className="space-y-2">
            <Label>Hạn sử dụng (ngày)</Label>
            <Input type="number" {...register("expiryDays")} placeholder="VD: 5" />
          </div>
        </div>
      </div>

      {/* Khối thông tin đặc thù nông sản */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Đặc tính nông sản</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nguồn gốc / Xuất xứ</Label>
            <Input {...register("origin")} placeholder="VD: Vườn nhà tại Ba Vì" />
          </div>
          <div className="space-y-2">
            <Label>Ngày thu hoạch</Label>
            <Input type="datetime-local" {...register("harvestDate")} required className="block" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Hướng dẫn bảo quản</Label>
          <Input {...register("preservation")} placeholder="VD: Ngăn mát tủ lạnh 5-10 độ C" />
        </div>
      </div>

      {/* --- KHỐI CẤU HÌNH BÁN HÀNG (RADIO VERSION) --- */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Hình thức bán hàng</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          
          {/* Option 1: Bán thường */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${salesType === 'normal' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="radio" 
                name="salesType" 
                value="normal"
                checked={salesType === 'normal'}
                onChange={() => setSalesType('normal')}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-bold text-gray-900">Bán thường</span>
            </div>
            <p className="text-xs text-muted-foreground">Hàng khô, để được lâu (Gạo, hạt...), giao hàng tiêu chuẩn toàn quốc.</p>
          </label>

          {/* Option 2: Đặt trước */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${salesType === 'preorder' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="radio" 
                name="salesType" 
                value="preorder"
                checked={salesType === 'preorder'}
                onChange={() => setSalesType('preorder')}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-bold text-gray-900">Đặt trước (Pre-order)</span>
            </div>
            <p className="text-xs text-muted-foreground">Sản phẩm chưa thu hoạch. Khách đặt cọc và chờ đến ngày.</p>
          </label>

          {/* Option 3: Hỏa tốc */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${salesType === 'instant' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="radio" 
                name="salesType" 
                value="instant"
                checked={salesType === 'instant'}
                onChange={() => setSalesType('instant')}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-bold text-gray-900">Giao Hỏa tốc</span>
            </div>
            <p className="text-xs text-muted-foreground">Hàng tươi sống, dễ hỏng. Chỉ giao ngay trong ngày ở cự ly gần.</p>
          </label>

        </div>

        {/* Input: Bán kính tối đa (Chỉ hiện khi chọn Hỏa tốc) */}
        {salesType === 'instant' && (
          <div className="animate-in fade-in slide-in-from-top-2 pt-2">
             <div className="space-y-2 max-w-md bg-yellow-50 p-4 rounded border border-yellow-200">
                <Label>Bán kính phục vụ tối đa (km)</Label>
                <div className="relative">
                    <Input 
                        type="number" 
                        {...register("maxDeliveryRadius")} 
                        placeholder="VD: 15" 
                        className="bg-white"
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-gray-500">km</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Khách hàng ở xa hơn khoảng cách này sẽ không thể đặt mua.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Khối hình ảnh & Mô tả */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Hình ảnh & Mô tả</h3>
        <div className="space-y-3">
          <Label>Hình ảnh sản phẩm</Label>

          <div className="flex flex-wrap gap-4">

            {/* 1. HIỂN THỊ ẢNH CŨ (Chỉ hiện khi Edit Mode) */}
            {existingImages.map((src, idx) => (
              <div key={`old-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                <Image src={src} alt="Old Preview" fill className="object-cover" unoptimized />
                {/* Nút xóa ảnh cũ */}
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa ảnh này"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* 2. HIỂN THỊ ẢNH MỚI CHỌN (Preview blob) */}
            {selectedFiles.map((file, idx) => (
              <div key={`new-${idx}`} className="relative w-24 h-24 border border-green-500 rounded-lg overflow-hidden group">
                <Image src={URL.createObjectURL(file)} alt="New Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Nút Upload */}
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors relative">
              <ImagePlus className="h-6 w-6 text-gray-400" />
              <span className="text-[10px] text-gray-500 mt-1">Thêm ảnh</span>
              <Input
                type="file" multiple accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Ảnh khung đỏ là ảnh cũ. Ảnh khung xanh là ảnh mới thêm.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Hủy bỏ</Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 min-w-[150px]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng bán ngay"}
        </Button>
      </div>
    </form>
  );
}