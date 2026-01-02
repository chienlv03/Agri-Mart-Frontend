import { Role } from "@/types/auth.types";

export interface Certification {
  type: string;      // Ví dụ: "VietGAP", "OCOP"
  url: string;       // Đường dẫn ảnh chứng chỉ
  expiredAt?: string; // Ngày hết hạn (ISO String)
}

// Request gửi lên Backend
export interface UpdateSellerProfileRequest {
  // --- Thông tin User cơ bản ---
  fullName?: string;
  phone?: string;
  email?: string;

  // --- Thông tin Seller ---
  taxCode?: string;
  
  // --- Thông tin Vườn/Trại ---
  farmName?: string;
  farmDescription?: string;
  farmAddress?: string;
  farmPhotos?: string[];
  businessLicenseUrls?: string[];

  // --- Tọa độ (Quan trọng để tính ship) ---
  latitude?: number;
  longitude?: number;

  // --- Chứng chỉ ---
  certifications?: Certification[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roles: Role[];
  avatarUrl?: string;
  status: string;
  createdAt: string;
}

export interface SellerInfo {
  sellerId: string;
  phone: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;

  idCardFront?: string;
  idCardBack?: string;
  taxCode?: string;

  farmName?: string;
  farmDescription?: string;
  farmAddress?: string;
  farmPhotos?: string[];
  businessLicenseUrls?: string[];

  latitude?: number;
  longitude?: number;

  certifications?: Certification[];
}