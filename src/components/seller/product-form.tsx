"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductService } from "@/services/product.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Category } from "@/types/product.type";
import { useRouter } from "next/navigation";
import { Loader2, X, ImagePlus, Video, FileVideo, MapPin } from "lucide-react";
import { CategoryService } from "@/services/category.service";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

interface ProductFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

interface ProductFormData {
  name: string;
  price: string;
  unit: string;
  weight: string; // MỚI: Cân nặng tính ship
  quantity: string;
  description: string;
  categoryId: string;

  // Root fields cho Pre-order
  isPreOrder: boolean;
  expectedHarvestDate: string; // ISO string

  // Attributes
  origin: string;
  expiryDays: string;
  preservation: string;
  instantDeliveryOnly: boolean;
  maxDeliveryRadius: string;

  // MỚI: Địa chỉ vườn cụ thể
  gardenAddress: string;
  latitude: number;  // Để tính ship
  longitude: number; // Để tính ship
}

export function ProductForm({ initialData, isEditMode }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // --- QUẢN LÝ MEDIA ---
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [selectedVideos, setSelectedVideos] = useState<File[]>([]); // MỚI
  const [existingVideos, setExistingVideos] = useState<string[]>([]); // MỚI

  // Xác định kiểu bán hàng để hiện UI phù hợp
  const getInitialSalesType = () => {
    if (initialData?.isPreOrder) return "preorder";
    if (initialData?.attributes?.instantDeliveryOnly) return "instant";
    return "normal";
  };
  const [salesType, setSalesType] = useState<"normal" | "preorder" | "instant">(getInitialSalesType());

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || "",
      price: String(initialData?.price || ""),
      unit: initialData?.unit || "",
      weight: String(initialData?.weight || "1"), // Mặc định 0.5kg
      quantity: String(initialData?.availableQuantity || initialData?.quantity || ""),
      description: initialData?.description || "",
      categoryId: initialData?.categoryIds?.[0] || "",

      // Root fields
      isPreOrder: initialData?.isPreOrder || false,
      expectedHarvestDate: initialData?.expectedHarvestDate
        ? new Date(initialData.expectedHarvestDate).toISOString().slice(0, 16)
        : "",

      // Attributes
      origin: initialData?.attributes?.origin || "",
      expiryDays: String(initialData?.attributes?.expiryDays || ""),
      preservation: initialData?.attributes?.preservation || "",
      instantDeliveryOnly: initialData?.attributes?.instantDeliveryOnly || false,
      maxDeliveryRadius: String(initialData?.attributes?.maxDeliveryRadius || ""),

      // MỚI: Map dữ liệu địa chỉ cũ
      gardenAddress: initialData?.attributes?.origin || "", // Tạm dùng trường origin làm địa chỉ hiển thị

      // Map tọa độ (GeoJSON Point: x=long, y=lat)
      latitude: initialData?.attributes?.gardenLocation?.y || 0,
      longitude: initialData?.attributes?.gardenLocation?.x || 0,
    }
  });

  // Load Categories
  useEffect(() => {
    CategoryService.getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Load dữ liệu cũ (Edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      if (initialData.images) setExistingImages(initialData.images);
      if (initialData.videos) setExistingVideos(initialData.videos);
    }
  }, [initialData, isEditMode]);

  // --- HANDLERS ẢNH ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeNewImage = (idx: number) => setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx: number) => setExistingImages(prev => prev.filter((_, i) => i !== idx));

  // --- HANDLERS VIDEO (MỚI) ---
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedVideos(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeNewVideo = (idx: number) => setSelectedVideos(prev => prev.filter((_, i) => i !== idx));
  const removeExistingVideo = (idx: number) => setExistingVideos(prev => prev.filter((_, i) => i !== idx));


  const onSubmit = async (data: ProductFormData) => {
    // Validate Media: Ít nhất 1 ảnh (chỉ check khi tạo mới hoặc xóa hết ảnh cũ)
    if (existingImages.length === 0 && selectedImages.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh sản phẩm");
      return;
    }

    setLoading(true);
    try {
      const isPreOrder = salesType === 'preorder';
      const instantDeliveryOnly = salesType === 'instant';

      // Validate nghiệp vụ Pre-order
      if (isPreOrder && !data.expectedHarvestDate) {
        toast.error("Hàng đặt trước bắt buộc phải có ngày thu hoạch dự kiến");
        setLoading(false);
        return;
      }

      // 1. Tạo Object dữ liệu thuần (Plain Object)
      // Object này phải khớp với interface CreateProductRequest / UpdateProductRequest

      // 1. Tạo dữ liệu cơ sở (Dùng chung cho cả Create và Update)
      const basePayload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        unit: data.unit,
        weight: Number(data.weight),
        quantity: Number(data.quantity),

        categoryIds: [data.categoryId],

        isPreOrder: isPreOrder,
        expectedHarvestDate: isPreOrder ? new Date(data.expectedHarvestDate).toISOString() : null,

        attributes: {
          origin: data.gardenAddress || data.origin,
          expiryDays: Number(data.expiryDays),
          preservation: data.preservation,
          instantDeliveryOnly: instantDeliveryOnly,
          maxDeliveryRadius: data.maxDeliveryRadius ? Number(data.maxDeliveryRadius) : undefined,

          // QUAN TRỌNG: Map GeoJsonPoint
          // Jackson mặc định map GeoJsonPoint qua constructor(x, y)
          // Nên gửi object { x: ..., y: ... } là đúng.
          gardenLocation: (data.latitude && data.longitude) ? {
            x: Number(data.longitude), // Kinh độ (Longitude) là X
            y: Number(data.latitude)   // Vĩ độ (Latitude) là Y
          } : undefined
        }
      };

      // 2. Phân chia logic gọi API
      if (isEditMode && initialData?.id) {
        // --- LOGIC UPDATE ---
        // Ghép thêm keepImages/keepVideos vì UpdateProductRequest CÓ các trường này
        const updatePayload = {
          ...basePayload,
          keepImages: existingImages,
          keepVideos: existingVideos
        };

        await ProductService.updateProduct(
          initialData.id,
          updatePayload,
          selectedImages,
          selectedVideos
        );
        toast.success("Cập nhật sản phẩm thành công!");

      } else {
        // --- LOGIC CREATE ---
        // Chỉ dùng basePayload, KHÔNG gửi keepImages/keepVideos (Backend CreateProductRequest KHÔNG CÓ)
        await ProductService.createProduct(
          basePayload,
          selectedImages,
          selectedVideos
        );
        toast.success("Đăng bán thành công! Sản phẩm đang được duyệt.");
      }

      router.push("/seller/products");

    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi lưu sản phẩm");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-xl border shadow-sm">

      {/* 1. THÔNG TIN CƠ BẢN */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Thông tin cơ bản</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
            <Input {...register("name", { required: true })} placeholder="Ví dụ: Ổi lê Thanh Hà" />
            {errors.name && <span className="text-xs text-red-500">Bắt buộc nhập</span>}
          </div>
          <div className="space-y-2">
            <Label>Danh mục <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setValue("categoryId", val)} defaultValue={initialData?.categoryIds?.[0]}>
              <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Giá bán (VNĐ) <span className="text-red-500">*</span></Label>
            <Input type="number" {...register("price", { required: true })} placeholder="50000" />
          </div>
          <div className="space-y-2">
            <Label>Đơn vị tính <span className="text-red-500">*</span></Label>
            <Input {...register("unit", { required: true })} placeholder="kg, hộp, bó..." />
          </div>
          {/* TRƯỜNG MỚI QUAN TRỌNG */}
          <div className="space-y-2">
            <Label>Cân nặng (kg/đơn vị) <span className="text-red-500">*</span></Label>
            <Input step="0.1" type="number" {...register("weight", { required: true })} placeholder="VD: 0.5" />
            <p className="text-[10px] text-gray-500">Dùng để tính phí ship</p>
          </div>
          <div className="space-y-2">
            <Label>Số lượng kho <span className="text-red-500">*</span></Label>
            <Input type="number" {...register("quantity", { required: true })} placeholder="VD: 100" />
            {isEditMode && <p className="text-[10px] text-blue-600">Nhập tổng số lượng mới để hệ thống tự điều chỉnh</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mô tả chi tiết</Label>
          <Textarea {...register("description")} placeholder="Mô tả về hương vị, cách trồng..." rows={4} />
        </div>
      </div>

      {/* 2. CẤU HÌNH BÁN HÀNG (Pre-order / Instant) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Hình thức bán hàng</h3>
        <div className="grid md:grid-cols-3 gap-4">

          {/* Option 1: Bán thường */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-all ${salesType === 'normal' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="salesType" checked={salesType === 'normal'} onChange={() => setSalesType('normal')} className="h-4 w-4 text-green-600" />
              <span className="font-bold text-sm">Hàng có sẵn</span>
            </div>
            <p className="text-xs text-gray-500">Sản phẩm đã thu hoạch, sẵn sàng giao ngay toàn quốc.</p>
          </label>

          {/* Option 2: Đặt trước (Pre-order) */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-all ${salesType === 'preorder' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="salesType" checked={salesType === 'preorder'} onChange={() => setSalesType('preorder')} className="h-4 w-4 text-orange-600" />
              <span className="font-bold text-sm text-orange-700">Đặt trước (Pre-order)</span>
            </div>
            <p className="text-xs text-gray-500">Chưa thu hoạch. Khách đặt cọc trước, giao hàng sau.</p>
          </label>

          {/* Option 3: Hỏa tốc */}
          <label className={`cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-all ${salesType === 'instant' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="salesType" checked={salesType === 'instant'} onChange={() => setSalesType('instant')} className="h-4 w-4 text-blue-600" disabled/>
              <span className="font-bold text-sm text-blue-700">Giao Hỏa tốc</span>
            </div>
            <p className="text-xs text-gray-500">Chỉ giao nhanh trong phạm vi gần (Hàng tươi sống, dễ hỏng).</p>
          </label>
        </div>

        {/* Dynamic Fields */}
        {salesType === 'preorder' && (
          <div className="bg-orange-50 p-4 rounded border border-orange-200 animate-in fade-in slide-in-from-top-2">
            <Label className="text-orange-800">Ngày dự kiến thu hoạch <span className="text-red-500">*</span></Label>
            <Input type="datetime-local" {...register("expectedHarvestDate")} className="mt-2 bg-white max-w-md" />
            <p className="text-xs text-orange-600 mt-1">Hệ thống sẽ tự động chốt đơn vào ngày này.</p>
          </div>
        )}

        {salesType === 'instant' && (
          <div className="bg-blue-50 p-4 rounded border border-blue-200 animate-in fade-in slide-in-from-top-2">
            <Label className="text-blue-800">Bán kính giao hàng tối đa (km)</Label>
            <div className="relative mt-2 max-w-xs">
              <Input type="number" {...register("maxDeliveryRadius")} className="bg-white pr-10" placeholder="VD: 15" />
              <span className="absolute right-3 top-2.5 text-xs text-gray-500">km</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. ĐẶC TÍNH SẢN PHẨM */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Đặc tính khác</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nguồn gốc / Xuất xứ</Label>
            <Input {...register("origin")} placeholder="VD: Vườn nhà tại Ba Vì" />
          </div>
          <div className="space-y-2">
            <Label>Hạn sử dụng (ngày)</Label>
            <Input type="number" {...register("expiryDays")} placeholder="VD: 7" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Hướng dẫn bảo quản</Label>
            <Input {...register("preservation")} placeholder="VD: Bảo quản ngăn mát tủ lạnh" />
          </div>
        </div>
      </div>

      {/* --- KHỐI ĐỊA ĐIỂM LẤY HÀNG (MỚI) --- */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Địa điểm lấy hàng (Vườn/Kho)
        </h3>

        <div className="space-y-2">
          <Label>Địa chỉ cụ thể của vườn <span className="text-red-500">*</span></Label>

          {/* Component tìm kiếm địa chỉ & lấy tọa độ */}
          <AddressAutocomplete
            value={watch("gardenAddress")} // Hiển thị giá trị hiện tại
            onChange={(address, lat, lon) => {
              setValue("gardenAddress", address); // Lưu tên đường
              setValue("origin", address);        // Lưu vào origin luôn nếu muốn
              setValue("latitude", lat);          // Lưu vĩ độ
              setValue("longitude", lon);         // Lưu kinh độ
            }}
            placeholder="Nhập địa chỉ vườn để Shipper đến lấy..."
          />

          <p className="text-[11px] text-gray-500">
            * Hệ thống cần tọa độ chính xác để tính phí vận chuyển. Nếu bỏ trống, hệ thống sẽ dùng địa chỉ mặc định trong Hồ sơ người bán.
          </p>

          {/* Input ẩn để chứa tọa độ cho Form Data */}
          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />
        </div>

        {/* Hiển thị tọa độ (Debug hoặc cho user biết đã nhận) */}
        {watch("latitude") !== 0 && (
          <div className="flex gap-4 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
            <span>Lat: {watch("latitude")}</span>
            <span>Lon: {watch("longitude")}</span>
          </div>
        )}
      </div>

      {/* 4. MEDIA (ẢNH & VIDEO) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-gray-800">Hình ảnh & Video</h3>

        {/* Phần 1: Hình ảnh */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Hình ảnh sản phẩm</Label>
          <div className="flex flex-wrap gap-4">
            {/* Ảnh cũ */}
            {existingImages.map((src, idx) => (
              <div key={`img-old-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                <Image src={src} alt="Old" fill className="object-cover" unoptimized />
                <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {/* Ảnh mới */}
            {selectedImages.map((file, idx) => (
              <div key={`img-new-${idx}`} className="relative w-24 h-24 border-2 border-green-500 rounded-lg overflow-hidden group">
                <Image src={URL.createObjectURL(file)} alt="New" fill className="object-cover" />
                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {/* Nút thêm ảnh */}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors">
              <ImagePlus className="h-6 w-6 text-gray-400" />
              <span className="text-[10px] text-gray-500 mt-1">Thêm ảnh</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Phần 2: Video (MỚI) */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <Label className="flex items-center gap-2"><Video className="w-4 h-4" /> Video thực tế (Tùy chọn)</Label>
          <div className="flex flex-wrap gap-4">
            {/* Video cũ */}
            {existingVideos.map((src, idx) => (
              <div key={`vid-old-${idx}`} className="relative w-32 h-24 border rounded-lg bg-black group flex items-center justify-center">
                <video src={src} className="w-full h-full object-cover opacity-80" />
                <FileVideo className="absolute text-white w-8 h-8" />
                <button type="button" onClick={() => removeExistingVideo(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {/* Video mới */}
            {selectedVideos.map((file, idx) => (
              <div key={`vid-new-${idx}`} className="relative w-32 h-24 border-2 border-green-500 rounded-lg bg-black group flex items-center justify-center">
                <span className="text-[10px] text-white absolute bottom-1 left-2 truncate w-24">{file.name}</span>
                <FileVideo className="text-green-500 w-8 h-8" />
                <button type="button" onClick={() => removeNewVideo(idx)} className="absolute top-1 right-1 bg-white text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {/* Nút thêm video */}
            <label className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors">
              <Video className="h-6 w-6 text-gray-400" />
              <span className="text-[10px] text-gray-500 mt-1">Thêm Video</span>
              <input type="file" multiple accept="video/*" className="hidden" onChange={handleVideoChange} />
            </label>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={() => router.back()}>Hủy bỏ</Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 min-w-[150px] shadow-md">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? "Lưu thay đổi" : "Đăng bán ngay")}
        </Button>
      </div>
    </form>
  );
}