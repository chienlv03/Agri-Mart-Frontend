import { Certification } from "@/types/user.type";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  isActive: boolean;
}

export interface ProductAttribute {
  origin: string;
  harvestDate: string; // Backend trả về Instant (ISO String)
  expiryDays: number;
  preservation: string;
  certifications: Certification[];
}

export interface SellerInfo {
  id: string;
  name: string;
  avatar: string;
  provinceName?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;

  categoryIds: string[];
  tags?: string[];

  // Media
  thumbnail?: string;
  images?: string[];
  videos?: string[];

  // Embedded seller
  seller: SellerInfo;

  // Giá cơ bản
  price?: number;
  originalPrice?: number;
  unit?: string;
  availableQuantity?: number;

  // Biến thể
  variants?: ProductVariant[];

  // Thuộc tính nông sản
  attributes?: ProductAttribute;

  // Chỉ số
  ratingAverage: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;

  // Trạng thái
  status: ProductStatus;
  isFeatured: boolean;

  createdAt: string; // Instant -> ISO string
  updatedAt: string; // Instant -> ISO string
}

export interface ProductVariant {
  variantId?: string;
  sku: string;
  name: string;        // ví dụ: 1kg, 2kg
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  images?: string[];
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
export type ProductStatus = "ACTIVE" | "PENDING" | "REJECTED";

// Interface cho tham số phân trang/sắp xếp
export interface ProductSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}