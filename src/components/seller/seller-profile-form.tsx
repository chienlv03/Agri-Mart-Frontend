"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserService } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import {
  Loader2, User, Store, Camera, X, ImagePlus, ShieldCheck, CheckCircle2, FileText, AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

// 1. IMPORT ZOD & RESOLVER
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility này để class conditional
import { AuthService } from "@/services/auth.service";

// 2. ĐỊNH NGHĨA SCHEMA VALIDATION
const sellerFormSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"), // Thường phone lấy từ Auth nên ít khi sai
  email: z.string().email("Email không đúng định dạng"),
  taxCode: z.string().optional(), // MST có thể tùy chọn hoặc bắt buộc tùy nghiệp vụ
  farmName: z.string().min(5, "Tên nông trại/cửa hàng phải có ít nhất 5 ký tự"),
  farmAddress: z.string().min(5, "Vui lòng chọn địa chỉ chi tiết từ gợi ý"),
  farmDescription: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

// Type suy ra từ Schema
type SellerFormValues = z.infer<typeof sellerFormSchema>;

export function SellerProfileForm() {
  const router = useRouter();
  const { user, saveSellerProfile, checkAuth } = useAuthStore();

  // --- STATE CHẾ ĐỘ ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- STATE FILE & PREVIEW ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);

  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // --- STATE ẢNH VƯỜN ---
  const [existingFarmPhotos, setExistingFarmPhotos] = useState<string[]>([]);
  const [newFarmFiles, setNewFarmFiles] = useState<File[]>([]);
  const [newFarmPreviews, setNewFarmPreviews] = useState<string[]>([]);

  // --- STATE GIẤY PHÉP ---
  const [existingLicenses, setExistingLicenses] = useState<string[]>([]);
  const [newLicenseFiles, setNewLicenseFiles] = useState<File[]>([]);
  const [newLicensePreviews, setNewLicensePreviews] = useState<string[]>([]);

  // 3. SETUP FORM VỚI ZOD RESOLVER
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors } // Lấy errors để hiển thị
  } = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      taxCode: "",
      farmName: "",
      farmAddress: "",
      farmDescription: "",
      latitude: 0,
      longitude: 0,
    },
  });

  // --- USE EFFECT: CHECK PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await UserService.getMySellerProfile();

        if (res.data) {
          setIsEditMode(true);
          const data = res.data;

          reset({
            fullName: user?.fullName || data.fullName || "",
            phone: user?.phone || data.phone || "",
            email: user?.email || data.email || "",
            taxCode: data.taxCode || "",
            farmName: data.farmName || "",
            farmAddress: data.farmAddress || "",
            farmDescription: data.farmDescription || "",
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
          });

          if (data.idCardFront) setIdFrontPreview(data.idCardFront);
          if (data.idCardBack) setIdBackPreview(data.idCardBack);
          if (data.farmPhotos) setExistingFarmPhotos(data.farmPhotos);
          if (data.businessLicensesUrls) setExistingLicenses(data.businessLicensesUrls);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setIsEditMode(false);
          reset({
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            email: user?.email || "",
          });
        } else {
          toast.error("Không thể tải thông tin hồ sơ.");
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [reset, user]);

  // Sync Address
  const farmAddress = useWatch({ control, name: "farmAddress" });
  const handleAddressSelect = (address: string, lat: number, lon: number) => {
    setValue("farmAddress", address, { shouldValidate: true }); // shouldValidate để trigger validation ngay
    setValue("latitude", lat);
    setValue("longitude", lon);
  };

  // --- HANDLERS ẢNH ---
  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any, setPreview: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFarmImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewFarmFiles((prev) => [...prev, ...newFiles]);
      setNewFarmPreviews((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleLicenseImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewLicenseFiles((prev) => [...prev, ...newFiles]);
      setNewLicensePreviews((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeNewImage = (index: number, setFiles: any, setPreviews: any) => {
    setPreviews((prev: string[]) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  // Hàm xóa ảnh cũ (ảnh đã có URL từ server)
  const removeExistingImage = (index: number, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = async (data: SellerFormValues) => {

    // 4. VALIDATE FILE (Vì file nằm ngoài React Hook Form)
    // Validate CCCD (Chỉ bắt buộc khi đăng ký mới)
    if (!isEditMode) {
      if (!idFrontFile) {
        toast.error("Thiếu ảnh mặt trước CCCD", { description: "Vui lòng tải lên để xác thực." });
        // Scroll tới phần CCCD nếu cần
        return;
      }
      if (!idBackFile) {
        toast.error("Thiếu ảnh mặt sau CCCD");
        return;
      }
    }

    // Validate Ảnh vườn (Bắt buộc phải có ít nhất 1 ảnh - cũ hoặc mới)
    const totalFarmPhotos = existingFarmPhotos.length + newFarmFiles.length;
    if (totalFarmPhotos === 0) {
      toast.error("Thiếu ảnh nông trại", { description: "Vui lòng tải lên ít nhất 1 ảnh thực tế tại vườn." });
      return;
    }

    setLoading(true);
    try {
      const response = await UserService.saveSellerProfile(
        {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          taxCode: data.taxCode || "",
          farmName: data.farmName,
          farmAddress: data.farmAddress,
          farmDescription: data.farmDescription || "",
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          farmPhotos: existingFarmPhotos,
          businessLicensesImages: existingLicenses,
        },
        avatarFile,
        idFrontFile,
        idBackFile,
        newFarmFiles,
        newLicenseFiles
      );

      saveSellerProfile(response.data);

      toast.success(isEditMode ? "Cập nhật hồ sơ thành công!" : "Đăng ký đối tác thành công!");

      
      if (!isEditMode) {
        await AuthService.refreshToken();
        window.location.href = "/seller/dashboard";
      } else {
        setNewFarmFiles([]); setNewFarmPreviews([]);
        setNewLicenseFiles([]); setNewLicensePreviews([]);
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-800">
          {isEditMode ? "Cập Nhật Hồ Sơ Người Bán" : "Đăng Ký Kinh Doanh"}
        </h1>
        <p className="text-gray-500 mt-2">
          {isEditMode
            ? "Quản lý thông tin hiển thị của cửa hàng và thông tin định danh."
            : "Hoàn tất hồ sơ để bắt đầu đăng bán nông sản trên sàn."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* 1. CÁ NHÂN */}
        <Card className="shadow-sm border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-green-600" /> Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarPreview || user?.avatarUrl || ""} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-green-100 text-green-700">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-green-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </label>
                <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setAvatarFile, setAvatarPreview)} />
              </div>
            </div>
            <div className="flex-1 w-full grid md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Họ và tên <span className="text-red-500">*</span></Label>
                <Input
                  {...register("fullName")}
                  placeholder="Nhập họ tên đầy đủ"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input {...register("phone")} disabled className="bg-gray-50 text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input
                  {...register("email")}
                  placeholder="example@gmail.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. ĐỊNH DANH */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-blue-600" /> Thông tin định danh
            </CardTitle>
            <CardDescription>Bắt buộc để xác thực danh tính (KYC).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-md">
              <Label>Mã số thuế</Label>
              <Input {...register("taxCode")} placeholder="Nhập MST cá nhân/hộ kinh doanh" />
            </div>

            {/* FILE INPUTS FOR ID CARD */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>CCCD Mặt trước {!isEditMode && <span className="text-red-500">*</span>}</Label>
                <label
                  htmlFor="id-front"
                  className={cn(
                    "border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative transition-colors",
                    !idFrontPreview && !isEditMode ? "border-red-300 bg-red-50/20" : "border-gray-300"
                  )}
                >
                  {idFrontPreview ? (
                    <Image src={idFrontPreview} alt="Front ID" fill className="object-contain p-2" unoptimized />
                  ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto" /> Tải ảnh</div>}
                  <Input id="id-front" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdFrontFile, setIdFrontPreview)} />
                </label>
                {!isEditMode && !idFrontPreview && <p className="text-xs text-red-500">Bắt buộc tải ảnh mặt trước</p>}
              </div>

              <div className="space-y-2">
                <Label>CCCD Mặt sau {!isEditMode && <span className="text-red-500">*</span>}</Label>
                <label
                  htmlFor="id-back"
                  className={cn(
                    "border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative transition-colors",
                    !idBackPreview && !isEditMode ? "border-red-300 bg-red-50/20" : "border-gray-300"
                  )}
                >
                  {idBackPreview ? (
                    <Image src={idBackPreview} alt="Back ID" fill className="object-contain p-2" unoptimized />
                  ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto" /> Tải ảnh</div>}
                  <Input id="id-back" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdBackFile, setIdBackPreview)} />
                </label>
                {!isEditMode && !idBackPreview && <p className="text-xs text-red-500">Bắt buộc tải ảnh mặt sau</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. NÔNG TRẠI */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Store className="h-5 w-5 text-green-600" /> Thông tin Nông trại
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tên hiển thị <span className="text-red-500">*</span></Label>
              <Input
                {...register("farmName")}
                placeholder="VD: Vườn rau sạch Ba Vì"
                className={errors.farmName ? "border-red-500" : ""}
              />
              {errors.farmName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.farmName.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Địa chỉ chi tiết <span className="text-red-500">*</span></Label>
                <AddressAutocomplete
                  value={farmAddress}
                  onChange={handleAddressSelect}
                  placeholder="Nhập địa chỉ..."
                // Truyền error style vào component con nếu nó hỗ trợ className
                />
                {errors.farmAddress && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.farmAddress.message}</p>}
              </div>
              <input type="hidden" {...register("latitude")} />
              <input type="hidden" {...register("longitude")} />
            </div>

            <div className="space-y-2">
              <Label>Giới thiệu</Label>
              <Textarea {...register("farmDescription")} className="h-24 resize-none" placeholder="Mô tả về quy mô, sản phẩm..." />
            </div>

            {/* ẢNH VƯỜN */}
            <div className="space-y-3">
              <Label>Ảnh thực tế tại vườn <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-4">
                {/* --- SỬA PHẦN HIỂN THỊ ẢNH CŨ --- */}
                {existingFarmPhotos.map((src, idx) => (
                  <div key={`old-farm-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                    <Image src={src} alt="Old Farm" fill className="object-cover" unoptimized />
                    {/* Thêm nút xóa ở đây */}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx, setExistingFarmPhotos)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Ảnh Mới (Giữ nguyên) */}
                {newFarmPreviews.map((src, idx) => (
                  <div key={`new-farm-${idx}`} className="relative w-24 h-24 border-2 border-green-500 rounded-lg overflow-hidden group">
                    <Image src={src} alt="New Farm" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeNewImage(idx, setNewFarmFiles, setNewFarmPreviews)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Nút upload (Giữ nguyên) */}
                <label htmlFor="farm-upload" className={`w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 text-gray-400 ${newFarmFiles.length + existingFarmPhotos.length === 0 ? "border-red-300 bg-red-50/20" : "border-gray-300"}`}>
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-[10px]">Thêm ảnh</span>
                </label>
                <Input id="farm-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFarmImagesChange} />
              </div>
              {newFarmFiles.length + existingFarmPhotos.length === 0 && (
                <p className="text-xs text-red-500">Cần ít nhất 1 ảnh chụp nông trại</p>
              )}
            </div>

            {/* GIẤY PHÉP */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Giấy phép kinh doanh / Chứng chỉ</Label>
              <div className="flex flex-wrap gap-4">

                {/* License cũ */}
                {existingLicenses.map((src, idx) => (
                  <div
                    key={`old-license-${idx}`}
                    className="relative w-24 h-24 border rounded-lg overflow-hidden group"
                  >
                    <Image src={src} alt="License" fill className="object-cover" unoptimized />

                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx, setExistingLicenses)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1
                   opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* License mới */}
                {newLicensePreviews.map((src, idx) => (
                  <div
                    key={`new-license-${idx}`}
                    className="relative w-24 h-24 border-2 border-blue-500 rounded-lg overflow-hidden group"
                  >
                    <Image src={src} alt="New License" fill className="object-cover" unoptimized />

                    <button
                      type="button"
                      onClick={() => removeNewImage(idx, setNewLicenseFiles, setNewLicensePreviews)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1
                   opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Upload */}
                <label
                  htmlFor="license-upload"
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg
               flex flex-col items-center justify-center cursor-pointer
               hover:bg-blue-50 hover:border-blue-500 text-gray-400 hover:text-blue-600"
                >
                  <FileText className="h-6 w-6 mb-1" />
                  <span className="text-[10px]">Thêm giấy tờ</span>
                </label>

                <Input
                  id="license-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleLicenseImagesChange}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white/90 backdrop-blur p-4 rounded-xl border shadow-lg z-10">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
          <Button type="submit" disabled={loading} className="w-48 bg-green-600 hover:bg-green-700 shadow-md">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {isEditMode ? "Lưu thay đổi" : "Hoàn tất Đăng ký"}
          </Button>
        </div>

      </form>
    </div>
  );
}