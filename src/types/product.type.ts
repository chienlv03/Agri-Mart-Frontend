import { Certification, SellerInfo } from "@/types/user.type";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  isActive: boolean;
}

// 1. Các thuộc tính đặc thù (ProductAttribute)
export interface ProductAttribute {
  origin?: string;
  expiryDays?: number;
  preservation?: string;
  instantDeliveryOnly?: boolean;
  maxDeliveryRadius?: number; // Nullable
  // Garden Location nếu cần map (GeoJSON)
  gardenLocation?: {
    x: number; // Longitude
    y: number; // Latitude
  } | null;
  certifications?: Certification[]; // Mảng chứng chỉ (VietGAP, OCOP, ...)
}

// 3. Product Response (Dữ liệu hiển thị)
export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  
  price: number;
  unit: string;
  weight: number;      // Quan trọng: Cân nặng tính ship
  availableQuantity: number; // Số lượng tồn kho (lấy từ Inventory)
  
  thumbnail?: string;
  images: string[];
  videos: string[];
  
  isPreOrder: boolean;
  expectedHarvestDate?: string; // ISO String
  
  attributes?: ProductAttribute;
  sellerProfileResponse?: SellerInfo;
  
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  unit: string;
  weight: number;
  quantity: number; // Số lượng ban đầu để init kho
  
  categoryIds: string[];
  
  isPreOrder?: boolean;
  expectedHarvestDate?: string | null; // ISO String
  
  attributes?: ProductAttribute;
}

// 5. Update Request (Dữ liệu gửi lên khi sửa)
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  weight?: number;
  quantity?: number; // Số lượng MỚI (để backend tính delta)
  
  categoryIds?: string[];
  
  isPreOrder?: boolean;
  expectedHarvestDate?: string | null;
  
  attributes?: ProductAttribute;
  
  // Logic giữ lại Media cũ
  keepImages?: string[];
  keepVideos?: string[];
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  
  price: number;
  unit: string;
  weight: number;      // Quan trọng: Cân nặng tính ship
  availableQuantity: number; // Số lượng tồn kho (lấy từ Inventory)
  
  thumbnail?: string;
  images: string[];
  videos: string[];
  
  isPreOrder: boolean;
  expectedHarvestDate?: string; // ISO String

  ratingAverage: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  
  attributes?: ProductAttribute;
  sellerProfileResponse?: SellerInfo;
  
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page
  last: boolean; // Is this the last page
}

// Các Enum trạng thái sản phẩm (Khớp với Java ProductStatus)
export type ProductStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'CLOSED' | 'SOLD_OUT' | 'DELETED';

// Interface cho tham số phân trang/sắp xếp
export interface ProductSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}