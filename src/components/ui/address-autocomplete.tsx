"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils"; // Hàm merge class của Shadcn/Tailwind

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value?: string; // Giá trị địa chỉ ban đầu
  onChange: (address: string, lat: number, lon: number) => void; // Callback trả data về form cha
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  value = "", 
  onChange, 
  placeholder = "Nhập địa chỉ...",
  className 
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Dùng ref để xử lý debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync prop value vào state khi form cha reset/init
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm gọi API OpenStreetMap
  const fetchAddress = async (keyword: string) => {
    if (!keyword || keyword.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Gọi API Nominatim (Miễn phí)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(keyword)}&format=json&addressdetails=1&limit=5&countrycodes=vn`
      );
      const data = await res.json();
      setSuggestions(data || []);
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

    // Debounce 500ms: Chỉ gọi API khi ngừng gõ 0.5s
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      fetchAddress(val);
    }, 500);
  };

  const handleSelect = (item: AddressResult) => {
    setQuery(item.display_name);
    setIsOpen(false);
    
    // Convert string lat/lon sang number và gửi về cha
    onChange(
      item.display_name, 
      parseFloat(item.lat), 
      parseFloat(item.lon)
    );
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

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-start gap-2 border-b last:border-0"
            >
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <span>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}