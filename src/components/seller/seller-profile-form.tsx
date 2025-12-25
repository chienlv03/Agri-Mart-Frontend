"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserService } from "@/services/user.service"; 
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { 
  Loader2, User, Store, MapPin, Camera, X, ImagePlus, ShieldCheck 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // Lưu ý: Đảm bảo store của bạn có hàm updateSellerProfile (để cập nhật state user client-side)
  const { user, updateSellerProfile } = useAuthStore(); 
  const [loading, setLoading] = useState(false);
  // --- FIX 1: Thêm state fetching ---
  const [fetching, setFetching] = useState(true); 

  // --- STATE QUẢN LÝ FILE & PREVIEW ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);

  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // --- FIX 2: Tách biệt ảnh cũ và ảnh mới ---
  const [existingFarmPhotos, setExistingFarmPhotos] = useState<string[]>([]); // Ảnh từ Server
  const [newFarmFiles, setNewFarmFiles] = useState<File[]>([]); // File thực tế để upload
  const [newFarmPreviews, setNewFarmPreviews] = useState<string[]>([]); // Preview của file mới

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

  // --- 1. USE EFFECT: GỌI API ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await UserService.getSellerProfile();
        const data = res.data; 

        reset({
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          taxCode: data.taxCode || "",
          farmName: data.farmName || "",
          farmAddress: data.farmAddress || "",
          farmDescription: data.farmDescription || "",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        });

        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
        if (data.idCardFront) setIdFrontPreview(data.idCardFront);
        if (data.idCardBack) setIdBackPreview(data.idCardBack);
        
        // Load ảnh cũ vào state riêng
        if (data.farmPhotos && data.farmPhotos.length > 0) {
            setExistingFarmPhotos(data.farmPhotos);
        }

      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [reset]);

  // Watch để sync với AddressAutocomplete
  const farmAddress = useWatch({
    control,
    name: "farmAddress",
  });

  const handleAddressSelect = (address: string, lat: number, lon: number) => {
    setValue("farmAddress", address, { shouldValidate: true });
    setValue("latitude", lat);
    setValue("longitude", lon);
  };

  // --- HANDLERS ẢNH ĐƠN ---
  const handleSingleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: (f: File) => void, 
    setPreview: (s: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- HANDLERS ẢNH VƯỜN (FIXED) ---
  const handleFarmImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Cộng dồn vào mảng MỚI
      setNewFarmFiles((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewFarmPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Xóa ảnh MỚI upload (Chưa lưu server)
  const removeNewFarmImage = (index: number) => {
    setNewFarmPreviews((prev) => {
        URL.revokeObjectURL(prev[index]); // Cleanup memory
        return prev.filter((_, i) => i !== index);
    });
    setNewFarmFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa ảnh CŨ (Đã có trên server)
  const removeExistingFarmImage = (index: number) => {
      // Chỉ xóa khỏi UI, thực tế backend chưa hỗ trợ xóa từng ảnh cũ trừ khi upload đè
      // Hoặc bạn cần API riêng delete-photo
      setExistingFarmPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellerFormValues) => {
    setLoading(true);
    try {
      // Logic hiện tại: Backend sẽ GHI ĐÈ farmPhotos bằng danh sách file gửi lên
      // Nếu muốn giữ ảnh cũ + ảnh mới, Backend cần sửa logic.
      // Với code Frontend này, ta gửi `newFarmFiles`.
      
      const response = await UserService.updateSellerProfile(
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
        newFarmFiles // Chỉ gửi file mới (Lưu ý: Backend hiện tại sẽ replace ảnh cũ bằng đống này)
      );
      
      updateSellerProfile(response.data); // Cập nhật thông tin user trong store

      toast.success("Cập nhật hồ sơ thành công!");
      
      // Reset lại state ảnh mới sau khi save thành công
      setNewFarmFiles([]);
      setNewFarmPreviews([]);
      // Cần load lại trang hoặc fetch lại profile để thấy ảnh mới update
      
    } catch (error: any) {
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600"/></div>
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* --- 1. THÔNG TIN CÁ NHÂN --- */}
        <Card className="shadow-sm border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-green-600" /> Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg cursor-pointer">
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
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

        {/* --- 2. THÔNG TIN ĐỊNH DANH --- */}
        <Card className="shadow-sm">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-xl">
               <ShieldCheck className="h-5 w-5 text-blue-600" /> Thông tin định danh
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="space-y-2 max-w-md">
                 <Label>Mã số thuế</Label>
                 <Input {...register("taxCode")} placeholder="Nhập MST" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label>CCCD Mặt trước</Label>
                    <label htmlFor="id-front" className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative">
                        {idFrontPreview ? (
                            <Image src={idFrontPreview} alt="Front ID" fill className="object-contain p-2" unoptimized/>
                        ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto"/> Tải ảnh lên</div>}
                        <Input id="id-front" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdFrontFile, setIdFrontPreview)} />
                    </label>
                 </div>
                 <div className="space-y-2">
                    <Label>CCCD Mặt sau</Label>
                    <label htmlFor="id-back" className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative">
                        {idBackPreview ? (
                            <Image src={idBackPreview} alt="Back ID" fill className="object-contain p-2" unoptimized/>
                        ) : <div className="text-center text-gray-400"><Camera className="w-8 h-8 mx-auto"/> Tải ảnh lên</div>}
                         <Input id="id-back" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setIdBackFile, setIdBackPreview)} />
                    </label>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* --- 3. THÔNG TIN NÔNG TRẠI --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Store className="h-5 w-5 text-green-600" /> Thông tin Nông trại
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
               <Label>Tên nông trại / Cửa hàng</Label>
               <Input {...register("farmName")} placeholder="VD: Vườn rau sạch Ba Vì" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Địa chỉ chi tiết</Label>
                 <AddressAutocomplete 
                     value={farmAddress}
                     onChange={handleAddressSelect}
                     placeholder="Nhập địa chỉ..."
                 />
                 <input type="hidden" {...register("latitude")} />
                 <input type="hidden" {...register("longitude")} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label className="text-xs">Latitude</Label>
                     <Input {...register("latitude")} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs">Longitude</Label>
                     <Input {...register("longitude")} readOnly className="bg-gray-50" />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label>Giới thiệu ngắn</Label>
              <Textarea {...register("farmDescription")} className="h-24 resize-none" />
            </div>

            <div className="space-y-3">
              <Label>Ảnh thực tế tại vườn</Label>
              <div className="flex flex-wrap gap-4">
                 
                 {/* 1. Hiển thị ảnh CŨ từ Server */}
                 {existingFarmPhotos.map((src, idx) => (
                    <div key={`old-${idx}`} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <Image src={src} alt="Old Farm" fill className="object-cover" unoptimized/>
                      {/* Nút xóa ảnh cũ (Chỉ xóa UI) */}
                      <button type="button" onClick={() => removeExistingFarmImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                 ))}

                 {/* 2. Hiển thị ảnh MỚI chuẩn bị upload */}
                 {newFarmPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative w-24 h-24 border border-green-500 rounded-lg overflow-hidden group">
                      <Image src={src} alt="New Farm" fill className="object-cover" unoptimized/>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center">Mới</div>
                      {/* Nút xóa ảnh mới */}
                      <button type="button" onClick={() => removeNewFarmImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                 ))}

                 <label htmlFor="farm-upload" className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all text-gray-400">
                    <ImagePlus className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-medium">Thêm ảnh</span>
                 </label>
                 <Input id="farm-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFarmImagesChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" className="w-32">Hủy bỏ</Button>
          <Button type="submit" disabled={loading} className="w-40 bg-green-600 hover:bg-green-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu thay đổi
          </Button>
        </div>

      </form>
    </div>
  );
}