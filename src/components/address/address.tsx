"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  MapPin, Plus, Loader2, Pencil, Trash2, Star, MoreVertical 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

// Import Services & Types
import { AddressService } from "@/services/address.service";
import { AddressResponse, AddressRequest } from "@/types/address.type";
import { useLocation } from "@/store/useLocation";

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);

  // --- 1. FETCH DATA ---
  const fetchAddresses = async () => {
    try {
      const res = await AddressService.getMyAddresses();
      const data = Array.isArray(res.data) ? res.data : (res as any); 
      
      const sorted = data.sort((a: AddressResponse, b: AddressResponse) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setAddresses(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // --- 2. HANDLERS ---
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await AddressService.deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể xóa địa chỉ này.");
    }
  };

  const handleSetDefault = async (addr: AddressResponse) => {
    try {
      await AddressService.setDefaultAddress(addr.id, addr);
      toast.success("Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật địa chỉ mặc định");
    }
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const openEditModal = (addr: AddressResponse) => {
    setEditingAddress(addr);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchAddresses();
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ Địa Chỉ</h1>
          <p className="text-gray-500 text-sm">Quản lý địa chỉ nhận hàng và thông tin liên lạc.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
        </Button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 mb-4">Thêm địa chỉ để việc thanh toán nhanh chóng hơn.</p>
          <Button variant="outline" onClick={openCreateModal}>Thêm ngay</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`
                relative p-5 rounded-xl border transition-all duration-200
                ${addr.isDefault ? "border-green-500 bg-green-50/30 shadow-sm" : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"}
              `}
            >
              {/* Header Card */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{addr.recipientName}</span>
                  {addr.isDefault && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-[10px] px-2 py-0.5">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Mặc định
                    </Badge>
                  )}
                </div>
                
                {/* Dropdown Action */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditModal(addr)}>
                      <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                    {!addr.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(addr)}>
                        <Star className="w-4 h-4 mr-2" /> Đặt làm mặc định
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(addr.id)} 
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Xóa địa chỉ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Body Card */}
              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">SĐT:</span> {addr.phone}
                </p>
                <div className="flex items-start gap-2">
                   <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                   <div>
                      <p className="font-medium text-gray-900">{addr.detailAddress}</p>
                      <p className="text-gray-500 text-xs">
                        {addr.wardName}, {addr.districtName}, {addr.provinceName}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm 
            initialData={editingAddress} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- FORM COMPONENT ---
interface AddressFormProps {
  initialData: AddressResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const { provinces, districts, wards, fetchDistricts, fetchWards } = useLocation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressRequest>({
    defaultValues: {
      recipientName: "", // Đã sửa từ receiverName
      phone: "",
      detailAddress: "",
      isDefault: false,
      latitude: 0,
      longitude: 0,
    }
  });

  // --- POPULATE DATA ---
  useEffect(() => {
  if (initialData) {
    // 1. Điền các trường văn bản đơn giản
    setValue("recipientName", initialData.recipientName);
    setValue("phone", initialData.phone);
    setValue("detailAddress", initialData.detailAddress);
    setValue("isDefault", initialData.isDefault);
    setValue("latitude", initialData.latitude || 0);
    setValue("longitude", initialData.longitude || 0);

    // 2. Điền ID Tỉnh/Huyện/Xã trước để Form nhận giá trị
    // Lưu ý: Select của shadcn/ui cần value là String
    if (initialData.provinceId) {
        setValue("provinceId", initialData.provinceId);
        setValue("provinceName", initialData.provinceName);
    }
    if (initialData.districtId) {
        setValue("districtId", initialData.districtId);
        setValue("districtName", initialData.districtName);
    }
    if (initialData.wardCode) {
        setValue("wardCode", initialData.wardCode);
        setValue("wardName", initialData.wardName);
    }

    // 3. Gọi API để nạp danh sách option cho Dropdown (Chạy bất đồng bộ)
    const loadLocationData = async () => {
        if (initialData.provinceId) {
            // Load Huyện dựa trên Tỉnh
            await fetchDistricts(initialData.provinceId);
        }
        
        if (initialData.districtId) {
            // Load Xã dựa trên Huyện
            await fetchWards(initialData.districtId);
        }
    };

    loadLocationData();
  }
  
}, [initialData?.id]);

  // --- HANDLERS ---
  const handleAutocompleteSelect = (fullAddress: string, lat: number, lon: number) => {
    const streetPart = fullAddress.split(",")[0];
    setValue("detailAddress", streetPart || fullAddress);
    setValue("latitude", lat);
    setValue("longitude", lon);
    toast.info("Đã cập nhật tọa độ. Vui lòng chọn khu vực hành chính bên dưới.");
  };

  const onProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code.toString() === value);
    if (province) {
        setValue("provinceId", province.code);
        setValue("provinceName", province.name);
        fetchDistricts(province.code);
        setValue("districtId", 0); // Reset số
        setValue("wardCode", ""); 
    }
  };

  const onDistrictChange = (value: string) => {
    const district = districts.find(d => d.code.toString() === value);
    if (district) {
        setValue("districtId", district.code);
        setValue("districtName", district.name);
        fetchWards(district.code);
        setValue("wardCode", "");
    }
  };

  const onWardChange = (value: string) => {
    const ward = wards.find(w => w.code.toString() === value);
    if (ward) {
        setValue("wardCode", ward.code.toString());
        setValue("wardName", ward.name);
    }
  };

  const onSubmit = async (data: AddressRequest) => {
    // Validate custom
    if (!data.provinceId || !data.districtId || !data.wardCode) {
        toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã");
        return;
    }
    // Convert string to number nếu cần thiết (dù TypeScript đã định nghĩa number)
    data.provinceId = Number(data.provinceId);
    data.districtId = Number(data.districtId);

    setLoading(true);
    try {
      if (initialData) {
        await AddressService.updateAddress(initialData.id, data);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        // Backend của bạn: Create luôn set default = true
        // Frontend vẫn gửi isDefault theo form, backend sẽ quyết định
        await AddressService.createAddress(data);
        toast.success("Thêm địa chỉ mới thành công");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tên người nhận <span className="text-red-500">*</span></Label>
          <Input {...register("recipientName", { required: "Bắt buộc" })} placeholder="Nguyễn Văn A" />
          {errors.recipientName && <span className="text-red-500 text-[10px]">Nhập tên</span>}
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại <span className="text-red-500">*</span></Label>
          <Input {...register("phone", { required: "Bắt buộc", pattern: /^[0-9]{10}$/ })} placeholder="09xxxxxxxx" />
          {errors.phone && <span className="text-red-500 text-[10px]">SĐT không hợp lệ</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600"/> 
            Lấy tọa độ từ bản đồ <span className="text-red-500">*</span>
        </Label>
        <AddressAutocomplete 
          value={watch("detailAddress")}
          onChange={handleAutocompleteSelect}
          placeholder="Nhập tên tòa nhà, đường phố..."
        />
        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />
      </div>

      {/* 3 Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
         {/* Tỉnh */}
         <div className="space-y-2">
             <Label>Tỉnh/Thành <span className="text-red-500">*</span></Label>
             <Select 
               onValueChange={onProvinceChange} 
               value={watch("provinceId")?.toString() ?? undefined}
             >
                 <SelectTrigger><SelectValue placeholder="Chọn Tỉnh" /></SelectTrigger>
                 <SelectContent>
                     {provinces.map(p => <SelectItem key={p.code} value={p.code.toString()}>{p.name}</SelectItem>)}
                 </SelectContent>
             </Select>
         </div>
         {/* Huyện */}
         <div className="space-y-2">
             <Label>Quận/Huyện <span className="text-red-500">*</span></Label>
             <Select 
               onValueChange={onDistrictChange} 
               value={
                 (() => {
                   const districtId = watch("districtId");
                   return districtId !== undefined && districtId !== null ? districtId.toString() : undefined;
                 })()
               }
               disabled={!watch("provinceId")}
             >
                 <SelectTrigger><SelectValue placeholder="Chọn Huyện" /></SelectTrigger>
                 <SelectContent>
                     {districts.map(d => <SelectItem key={d.code} value={d.code.toString()}>{d.name}</SelectItem>)}
                 </SelectContent>
             </Select>
         </div>
         {/* Xã */}
         <div className="space-y-2">
             <Label>Phường/Xã <span className="text-red-500">*</span></Label>
             <Select 
               onValueChange={onWardChange} 
               value={watch("wardCode")}
               disabled={!watch("districtId")}
             >
                 <SelectTrigger><SelectValue placeholder="Chọn Xã" /></SelectTrigger>
                 <SelectContent>
                     {wards.map(w => <SelectItem key={w.code} value={w.code.toString()}>{w.name}</SelectItem>)}
                 </SelectContent>
             </Select>
         </div>
      </div>

      <div className="space-y-2">
          <Label>Số nhà, ngõ ngách chi tiết</Label>
          <Input {...register("detailAddress", { required: "Bắt buộc" })} placeholder="Số 10, ngõ 5..." />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="default" 
          checked={watch("isDefault")} 
          onCheckedChange={(checked) => setValue("isDefault", checked === true)} 
          disabled={initialData?.isDefault} // Nếu đang sửa và đã là default thì không cho uncheck (theo logic backend)
        />
        <Label htmlFor="default" className="text-sm font-normal cursor-pointer">Đặt làm địa chỉ mặc định</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />} {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
}