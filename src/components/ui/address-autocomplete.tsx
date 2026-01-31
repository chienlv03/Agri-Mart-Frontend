"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  // Bổ sung interface cho address detail
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string; // Phường/Xã
    quarter?: string;
    village?: string;
    county?: string; // Quận/Huyện
    district?: string;
    city?: string;   // Tỉnh/Thành phố
    state?: string;
    town?: string;
    [key: string]: string | undefined;
  };
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: string, lat: number, lon: number) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value = "",
  onChange,
  placeholder = "Nhập địa chỉ (VD: Số 1 Đại Cồ Việt)...",
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HÀM HELPER: Format địa chỉ VN chuẩn 3 cấp ---
  const formatVietnameseAddress = (item: AddressResult) => {
    const addr = item.address;
    if (!addr) return item.display_name;

    const parts: string[] = [];

    // 1. Số nhà / Tên đường
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);

    // 2. Cấp Xã/Phường (Ưu tiên suburb > quarter > village)
    const ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.hamlet;
    if (ward) parts.push(ward);

    // 3. Cấp Quận/Huyện (Lưu ý: Nominatim thường trả về 'county' cho Quận/Huyện ở VN)
    const district = addr.county || addr.district || addr.town;
    if (district) parts.push(district);

    // 4. Cấp Tỉnh/Thành phố
    const city = addr.city || addr.state;
    if (city) parts.push(city);

    // Loại bỏ trùng lặp (VD: Hà Nội xuất hiện 2 lần) và ghép chuỗi
    return [...new Set(parts)].join(", ");
  };

  const fetchAddress = async (keyword: string) => {
    if (!keyword || keyword.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // THAY ĐỔI URL:
      // 1. accept-language=vi: Bắt buộc trả về tiếng Việt
      // 2. addressdetails=1: Lấy chi tiết để tự format
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          keyword
        )}&format=json&addressdetails=1&limit=5&countrycodes=vn&accept-language=vi`
      );
      const data = await res.json();
      
      // Map lại data để hiển thị đẹp hơn ngay từ đầu
      const formattedData = data.map((item: any) => ({
        ...item,
        display_name: formatVietnameseAddress(item), // Ghi đè display_name bằng format của mình
      }));

      setSuggestions(formattedData || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Lỗi tìm địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchAddress(val);
    }, 500);
  };

  const handleSelect = (item: AddressResult) => {
    // Dùng cái display_name đã được format
    setQuery(item.display_name); 
    setIsOpen(false);
    onChange(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
  };

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <div className="relative">
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm flex items-start gap-2 border-b last:border-0"
            >
              <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{item.display_name}</span>
                {/* Nếu muốn hiện thêm loại địa điểm (Cửa hàng, Trường học...) */}
                {/* <span className="text-xs text-gray-500">{(item as any).type}</span> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}