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
  Loader2, User, Store, Camera, X, ImagePlus, ShieldCheck, CheckCircle2, FileText 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

interface SellerFormValues {
  fullName: string;
  phone: string;
  email: string;
  taxCode: string;
  farmName: string;
  farmAddress: string;
  farmDescription: string;
  latitude: number;
  longitude: number;
}

export function SellerProfileForm() {
  const router = useRouter();
  const { user, saveSellerProfile } = useAuthStore(); 

  console.log("Current User in Store:", user?.avatarUrl);
  
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

  // --- STATE GIẤY PHÉP KINH DOANH (MỚI) ---
  const [existingLicenses, setExistingLicenses] = useState<string[]>([]);
  const [newLicenseFiles, setNewLicenseFiles] = useState<File[]>([]);
  const [newLicensePreviews, setNewLicensePreviews] = useState<string[]>([]);

  const { register, handleSubmit, setValue, reset, control } = useForm<SellerFormValues>({
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

  // --- 1. USE EFFECT: CHECK PROFILE ---
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
            // Load giấy phép cũ
            if (data.businessLicensesUrls) setExistingLicenses(data.businessLicensesUrls);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
            setIsEditMode(false); // Chưa có hồ sơ -> Mode Đăng ký
            reset({
                fullName: user?.fullName || "",
                phone: user?.phone || "",
                email: user?.email || "",
            });
        } else {
            console.error("Lỗi tải hồ sơ:", error);
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
    setValue("farmAddress", address, { shouldValidate: true });
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

  // Xử lý ảnh Vườn
  const handleFarmImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewFarmFiles((prev) => [...prev, ...newFiles]);
      setNewFarmPreviews((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  // Xử lý ảnh Giấy phép (MỚI)
  const handleLicenseImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewLicenseFiles((prev) => [...prev, ...newFiles]);
      setNewLicensePreviews((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  // Xóa ảnh Preview
  const removeNewImage = (index: number, setFiles: any, setPreviews: any) => {
    setPreviews((prev: string[]) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
    });
    setFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = async (data: SellerFormValues) => {
    
    // VALIDATION CLIENT: Chỉ bắt buộc khi Đăng ký mới
    if (!isEditMode) {
        if (!idFrontFile || !idBackFile) {
            toast.error("Vui lòng tải lên ảnh CCCD mặt trước và mặt sau.");
            return;
        }
        if (!data.farmName || !data.farmAddress) {
            toast.error("Vui lòng nhập thông tin nông trại.");
            return;
        }
    }

    setLoading(true);
    try {
      // Gọi API UPSERT (Vừa thêm vừa sửa)
      const response = await UserService.saveSellerProfile(
        {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          taxCode: data.taxCode,
          farmName: data.farmName,
          farmAddress: data.farmAddress,
          farmDescription: data.farmDescription,
          latitude: Number(data.latitude), 
          longitude: Number(data.longitude), 
        },
        avatarFile,
        idFrontFile,
        idBackFile,
        newFarmFiles,    // Ảnh vườn mới
        newLicenseFiles  // Giấy phép mới
      );
      
      // Update Global Store
      saveSellerProfile(response.data);

      toast.success(isEditMode ? "Cập nhật hồ sơ thành công!" : "Đăng ký đối tác thành công!");
      
      // Nếu đăng ký mới -> Redirect
      if (!isEditMode) {
          router.push("/seller/dashboard");
      } else {
         // Nếu update -> Reset file mới
         setNewFarmFiles([]); setNewFarmPreviews([]);
         setNewLicenseFiles([]); setNewLicensePreviews([]);
         // Có thể reload lại profile nếu cần
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600"/></div>
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
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
                <Label>Họ và tên</Label>
                <Input {...register("fullName")} placeholder="Nhập họ tên đầy đủ" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input {...register("phone")} disabled className="bg-gray-50 text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register("email")} placeholder="example@gmail.com" />
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
              <div className="grid md:grid-cols-2 gap-6">
                 {/* CCCD Trước */}
                 <div className="space-y-2">
                    <Label>CCCD Mặt trước {!isEditMode && <span className="text-red-500">*</span>}</Label>
                    <label htmlFor="id-front" className={`border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative transition-colors ${!idFrontPreview && !isEditMode ? 'border-red-300 bg-red-50/50' : 'border-gray-300'}`}>
                        {idFrontPreview ? (
                            <Image src={idFrontPreview} alt="Front ID" fill className="object-contain p-2" unoptimized/>
                        ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto"/> Tải ảnh</div>}
                        <Input id="id-front" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdFrontFile, setIdFrontPreview)} />
                    </label>
                 </div>
                 {/* CCCD Sau */}
                 <div className="space-y-2">
                    <Label>CCCD Mặt sau {!isEditMode && <span className="text-red-500">*</span>}</Label>
                    <label htmlFor="id-back" className={`border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative transition-colors ${!idBackPreview && !isEditMode ? 'border-red-300 bg-red-50/50' : 'border-gray-300'}`}>
                        {idBackPreview ? (
                            <Image src={idBackPreview} alt="Back ID" fill className="object-contain p-2" unoptimized/>
                        ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto"/> Tải ảnh</div>}
                         <Input id="id-back" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdBackFile, setIdBackPreview)} />
                    </label>
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
               <Label>Tên hiển thị {!isEditMode && <span className="text-red-500">*</span>}</Label>
               <Input {...register("farmName")} placeholder="VD: Vườn rau sạch Ba Vì" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label>Địa chỉ chi tiết {!isEditMode && <span className="text-red-500">*</span>}</Label>
                 <AddressAutocomplete 
                     value={farmAddress}
                     onChange={handleAddressSelect}
                     placeholder="Nhập địa chỉ..."
                 />
               </div>
               {/* Hidden Lat/Lon fields */}
               <input type="hidden" {...register("latitude")} />
               <input type="hidden" {...register("longitude")} />
            </div>

            <div className="space-y-2">
              <Label>Giới thiệu</Label>
              <Textarea {...register("farmDescription")} className="h-24 resize-none" placeholder="Mô tả về quy mô, sản phẩm..." />
            </div>

            {/* A. ẢNH VƯỜN */}
            <div className="space-y-3">
              <Label>Ảnh thực tế tại vườn</Label>
              <div className="flex flex-wrap gap-4">
                 {/* Ảnh Cũ */}
                 {existingFarmPhotos.map((src, idx) => (
                    <div key={`old-farm-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <Image src={src} alt="Old Farm" fill className="object-cover" unoptimized/>
                    </div>
                 ))}
                 {/* Ảnh Mới */}
                 {newFarmPreviews.map((src, idx) => (
                    <div key={`new-farm-${idx}`} className="relative w-24 h-24 border-2 border-green-500 rounded-lg overflow-hidden group">
                      <Image src={src} alt="New Farm" fill className="object-cover" unoptimized/>
                      <button type="button" onClick={() => removeNewImage(idx, setNewFarmFiles, setNewFarmPreviews)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                 ))}
                 <label htmlFor="farm-upload" className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 text-gray-400">
                    <ImagePlus className="h-6 w-6 mb-1" />
                    <span className="text-[10px]">Thêm ảnh</span>
                 </label>
                 <Input id="farm-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFarmImagesChange} />
              </div>
            </div>

            {/* B. GIẤY PHÉP KINH DOANH (MỚI) */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="flex items-center gap-2"><FileText className="h-4 w-4"/> Giấy phép kinh doanh / Chứng chỉ</Label>
              <div className="flex flex-wrap gap-4">
                 {/* Giấy phép Cũ */}
                 {existingLicenses.map((src, idx) => (
                    <div key={`old-license-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <Image src={src} alt="License" fill className="object-cover" unoptimized/>
                    </div>
                 ))}
                 {/* Giấy phép Mới */}
                 {newLicensePreviews.map((src, idx) => (
                    <div key={`new-license-${idx}`} className="relative w-24 h-24 border-2 border-blue-500 rounded-lg overflow-hidden group">
                      <Image src={src} alt="New License" fill className="object-cover" unoptimized/>
                      <button type="button" onClick={() => removeNewImage(idx, setNewLicenseFiles, setNewLicensePreviews)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                 ))}
                 <label htmlFor="license-upload" className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 text-gray-400 hover:text-blue-600">
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-[10px]">Thêm giấy tờ</span>
                 </label>
                 <Input id="license-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleLicenseImagesChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white/90 backdrop-blur p-4 rounded-xl border shadow-lg z-10">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
          <Button type="submit" disabled={loading} className="w-48 bg-green-600 hover:bg-green-700 shadow-md">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4"/>} 
            {isEditMode ? "Lưu thay đổi" : "Hoàn tất Đăng ký"}
          </Button>
        </div>

      </form>
    </div>
  );
}