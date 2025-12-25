"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  MapPin, Plus, Check, Loader2, ArrowLeft 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { AddressService } from "@/services/address.service";
import { AddressResponse, AddressRequest } from "@/types/address.type";
import { useLocation } from "@/store/useLocation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Props
interface AddressListSelectorProps {
  onSelect: (addressId: string) => void; // Callback khi chọn xong
  selectedId?: string | null;            // ID đang được chọn (để highlight)
  onCancel?: () => void;                 // Nút hủy (nếu cần)
}

export function AddressListSelector({ onSelect, selectedId, onCancel }: AddressListSelectorProps) {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"LIST" | "CREATE">("LIST"); // Chuyển đổi giữa xem list và tạo mới

  // --- 1. FETCH DATA ---
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await AddressService.getMyAddresses();
      console.log("Fetched addresses:", res.data);
      setAddresses(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // --- 2. XỬ LÝ CHỌN ---
  const handleSelect = (address: AddressResponse) => {
    onSelect(address.id);
    // Nếu component nằm trong Dialog, DialogTrigger bên ngoài sẽ tự đóng (nếu dùng asChild) 
    // hoặc bạn cần xử lý đóng modal ở component cha.
    toast.success("Đã chọn địa chỉ giao hàng.");
  };

  // --- 3. XỬ LÝ TẠO MỚI THÀNH CÔNG ---
  const handleCreateSuccess = (newAddress: AddressResponse) => {
    fetchAddresses(); // Reload list
    setView("LIST");  // Quay về list
    onSelect(newAddress.id); // Tự động chọn cái vừa tạo
    toast.success("Thêm địa chỉ mới thành công!");
  };

  // --- RENDER ---
  
  // VIEW: TẠO MỚI
  if (view === "CREATE") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setView("LIST")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold text-lg">Thêm địa chỉ mới</h3>
        </div>
        <CreateAddressForm 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setView("LIST")} 
        />
      </div>
    );
  }

  // VIEW: DANH SÁCH
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Địa chỉ của tôi</h3>
        <Button variant="outline" size="sm" onClick={() => setView("CREATE")} className="text-green-600 border-green-200 hover:bg-green-50">
          <Plus className="w-4 h-4 mr-1" /> Thêm mới
        </Button>
      </div>

      <Separator />

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-green-600"/></div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>Bạn chưa có địa chỉ nào.</p>
          <Button className="mt-4" onClick={() => setView("CREATE")}>Tạo địa chỉ ngay</Button>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <div 
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`
                    relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isSelected ? "border-green-600 bg-green-50/50" : "border-gray-200 bg-white"}
                  `}
                >
                  {/* Icon Check khi chọn */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white p-1 rounded-bl-lg rounded-tr-lg">
                       <Check className="w-3 h-3" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                     <MapPin className={`w-5 h-5 mt-1 ${isSelected ? "text-green-600" : "text-gray-400"}`} />
                     <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800">{addr.recipientName}</span>
                           <span className="text-gray-300">|</span>
                           <span className="text-gray-600 text-sm">{addr.phone}</span>
                           {addr.isDefault && <Badge variant="secondary" className="text-[10px] bg-gray-200 text-gray-700">Mặc định</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{addr.detailAddress}</p>
                        <p className="text-xs text-gray-500">
                           {addr.wardName}, {addr.districtName}, {addr.provinceName}
                        </p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {onCancel && (
        <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onCancel}>Đóng</Button>
        </div>
      )}
    </div>
  );
}


// --- SUB COMPONENT: CREATE FORM ---
function CreateAddressForm({ onSuccess, onCancel }: { onSuccess: (data: AddressResponse) => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // Sử dụng Hook lấy địa chỉ
  const { provinces, districts, wards, fetchDistricts, fetchWards } = useLocation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressRequest>({
    defaultValues: {
      recipientName: "",
      phone: "",
      detailAddress: "", // Số nhà, tên đường
      isDefault: false,
      latitude: 0,
      longitude: 0,
      // Các trường ID sẽ được set khi chọn Select
    }
  });

  // --- XỬ LÝ 1: Autocomplete chỉ để lấy Tọa độ & Tên đường ---
  const handleAutocompleteSelect = (fullAddress: string, lat: number, lon: number) => {
    // Chỉ lấy phần đầu của địa chỉ (Số nhà, đường)
    // Ví dụ: "1, Dai Co Viet, Hai Ba Trung, Ha Noi" -> Lấy "1, Dai Co Viet"
    const streetPart = fullAddress.split(",")[0]; 
    
    setValue("detailAddress", streetPart || fullAddress); 
    setValue("latitude", lat);
    setValue("longitude", lon);
    
    toast.info("Đã cập nhật tọa độ. Vui lòng chọn Tỉnh/Huyện/Xã chính xác bên dưới.");
  };

  // --- XỬ LÝ 2: Chọn Tỉnh/Huyện/Xã ---
  const onProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code.toString() === value);
    if (province) {
        setValue("provinceId", province.code);
        setValue("provinceName", province.name);
        fetchDistricts(province.code); // Load huyện
        setValue("districtId", undefined); // Reset huyện cũ
        setValue("wardCode", ""); // Reset xã cũ
    }
  };

  const onDistrictChange = (value: string) => {
    const district = districts.find(d => d.code.toString() === value);
    if (district) {
        setValue("districtId", district.code);
        setValue("districtName", district.name);
        fetchWards(district.code); // Load xã
        setValue("wardCode", ""); // Reset xã cũ
    }
  };

  const onWardChange = (value: string) => {
    const ward = wards.find(w => w.code.toString() === value);
    if (ward) {
        setValue("wardCode", ward.code.toString()); // Lưu ý: wardCode thường là String
        setValue("wardName", ward.name);
    }
  };

  const onSubmit = async (data: AddressRequest) => {
    // Validate thủ công
    if (!data.provinceId || !data.districtId || !data.wardCode) {
        toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã");
        return;
    }
    if (!data.latitude || !data.longitude) {
       toast.error("Vui lòng tìm kiếm địa chỉ trên bản đồ để lấy tọa độ.");
       return;
    }

    setLoading(true);
    try {
      // Data gửi đi bây giờ đã có đủ ID và Name chuẩn
      const res = await AddressService.createAddress(data);
      onSuccess(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi tạo địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
      {/* Tên & SĐT */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tên người nhận <span className="text-red-500">*</span></Label>
          <Input {...register("recipientName", { required: "Nhập tên" })} placeholder="Nguyễn Văn A" />
          {errors.recipientName && <p className="text-red-500 text-xs">{errors.recipientName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại <span className="text-red-500">*</span></Label>
          <Input {...register("phone", { required: "Nhập SĐT", pattern: { value: /^[0-9]{10}$/, message: "SĐT không hợp lệ" } })} placeholder="09xxxx" />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Tìm kiếm bản đồ (Lấy tọa độ) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600"/> 
            Tìm địa điểm trên bản đồ (Để lấy tọa độ) <span className="text-red-500">*</span>
        </Label>
        <AddressAutocomplete 
          value={watch("detailAddress")}
          onChange={handleAutocompleteSelect}
          placeholder="Nhập tên tòa nhà, đường phố..."
        />
        <p className="text-[10px] text-gray-500">
           * Gõ tên địa điểm để hệ thống lấy tọa độ chính xác cho việc tính phí ship.
        </p>
        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />
      </div>

      {/* 3 Dropdown chọn địa chỉ hành chính */}
      <div className="grid grid-cols-3 gap-3">
          {/* Tỉnh / Thành */}
          <div className="space-y-2">
              <Label>Tỉnh/Thành <span className="text-red-500">*</span></Label>
              <Select onValueChange={onProvinceChange}>
                  <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                      {provinces.map(p => (
                          <SelectItem key={p.code} value={p.code.toString()}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>

          {/* Quận / Huyện */}
          <div className="space-y-2">
              <Label>Quận/Huyện <span className="text-red-500">*</span></Label>
              <Select onValueChange={onDistrictChange} disabled={districts.length === 0}>
                  <SelectTrigger>
                      <SelectValue placeholder="Chọn Huyện" />
                  </SelectTrigger>
                  <SelectContent>
                      {districts.map(d => (
                          <SelectItem key={d.code} value={d.code.toString()}>{d.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>

          {/* Phường / Xã */}
          <div className="space-y-2">
              <Label>Phường/Xã <span className="text-red-500">*</span></Label>
              <Select onValueChange={onWardChange} disabled={wards.length === 0}>
                  <SelectTrigger>
                      <SelectValue placeholder="Chọn Xã" />
                  </SelectTrigger>
                  <SelectContent>
                      {wards.map(w => (
                          <SelectItem key={w.code} value={w.code.toString()}>{w.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
      </div>

      {/* Số nhà chi tiết */}
      <div className="space-y-2">
          <Label>Số nhà, tên đường cụ thể</Label>
          <Input {...register("detailAddress", { required: "Nhập địa chỉ chi tiết" })} />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="default" 
          onCheckedChange={(checked) => setValue("isDefault", checked === true)} 
        />
        <Label htmlFor="default" className="text-sm font-normal cursor-pointer">Đặt làm địa chỉ mặc định</Label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />} Lưu địa chỉ
        </Button>
      </div>
    </form>
  );
}