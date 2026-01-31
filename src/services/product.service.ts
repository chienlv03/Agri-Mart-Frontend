import { CreateProductRequest, PageResponse, ProductResponse, ProductSearchParams, ProductSearchRequest, ProductStatus, UpdateProductRequest } from "@/types/product.type";
import apiClient from "@/lib/axios";
import axios from "@/lib/axios";
import { cleanParams } from "@/lib/utils";

export const ProductService = {

  // 3. API Xem chi tiết theo ID (Public)
  // Endpoint: GET /api/v1/products/{id}
  getProductById: async (id: string) => {
    const res = await apiClient.get<ProductResponse>(`/products/${id}`);
    return res.data;
  },

  // 4. API Xem chi tiết theo Slug (Public - SEO)
  // Endpoint: GET /api/v1/products/slug/{slug}
  getProductBySlug: async (slug: string) => {
    const res = await apiClient.get<ProductResponse>(`/products/slug/${slug}`);
    return res.data;
  },

  // 5. API Lấy sản phẩm của tôi (ROLE_SELLER)
  // Endpoint: GET /api/v1/products/seller/me
  getMyProducts: async (params?: ProductSearchParams) => {
    const res = await apiClient.get<PageResponse<ProductResponse>>("/products/seller/me", {
      params: {
        page: params?.page || 0,
        size: params?.size || 10,
      },
    });
    return res.data;
  },

  // 6. API Lấy sản phẩm ACTIVE cho trang chủ (Public)
  // Endpoint: GET /api/v1/products/active
  getActiveProducts: async (params?: ProductSearchParams) => {
    const res = await apiClient.get<PageResponse<ProductResponse>>("/products/active", {
      params: {
        page: params?.page || 0,
        size: params?.size || 10,
        createdAt: params?.sortBy || "createdAt",
        desc: params?.order || "desc",
      },
    });
    return res.data;
  },

  // 7. API Lấy sản phẩm PENDING cho Admin duyệt (ROLE_ADMIN)
  // Endpoint: GET /api/v1/products/pending
  getPendingProducts: async (params?: ProductSearchParams) => {
    const res = await apiClient.get<PageResponse<ProductResponse>>("/products/pending", {
      params: {
        page: params?.page || 0,
        size: params?.size || 10,
        createdAt: params?.sortBy || "createdAt",
        desc: params?.order || "desc",
      },
    });
    return res.data;
  },

  // 2. API Duyệt/Từ chối sản phẩm (ROLE_ADMIN)
  updateProductStatus: async (id: string, status: "ACTIVE" | "REJECTED" | "CLOSED", reason?: string) => {
    return await apiClient.put<void>(`/products/${id}/status`, {
      status: status,
      reason: reason
    });
  },

  deleteProduct: async (id: string) => {
    return await apiClient.delete<void>(`/products/${id}`);
  },

  createProduct: async (
    data: CreateProductRequest,
    images: File[],
    videos: File[] = []
  ): Promise<void> => {
    const formData = new FormData();

    // 1. Đóng gói JSON data
    // Backend yêu cầu @RequestPart("data") là JSON
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // 2. Append Images
    images.forEach((file) => {
      formData.append("images", file);
    });

    // 3. Append Videos
    videos.forEach((file) => {
      formData.append("videos", file);
    });

    // Gọi API POST
    await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Cập nhật sản phẩm (Multipart/form-data)
   * @param id ID sản phẩm
   * @param data Object thông tin cập nhật
   * @param newImages Mảng File ảnh MỚI thêm vào
   * @param newVideos Mảng File video MỚI thêm vào
   */
  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
    newImages: File[] = [],
    newVideos: File[] = []
  ): Promise<void> => {
    const formData = new FormData();

    // 1. Đóng gói JSON data
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // 2. Append New Images (nếu có)
    if (newImages.length > 0) {
      newImages.forEach((file) => {
        formData.append("images", file);
      });
    }

    // 3. Append New Videos (nếu có)
    if (newVideos.length > 0) {
      newVideos.forEach((file) => {
        formData.append("videos", file);
      });
    }

    // Gọi API PUT
    await apiClient.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async getProductsBySeller(sellerId: string, page = 0, size = 12) {
    const res = await apiClient.get(`/products/shop/${sellerId}`, {
      params: {
        page: page,
        size: size
      }
    });
    return res.data;
  },

  async searchProducts(params: ProductSearchRequest): Promise<PageResponse<ProductResponse>> {
    // 1. Làm sạch params trước
    const cleanedParams = cleanParams(params);

    // 2. Để Axios tự xử lý việc serialize (nó xử lý tốt cả mảng và encode)
    const res = await apiClient.get<PageResponse<ProductResponse>>(
      "/products/search",
      { 
        params: cleanedParams 
      }
    );
    
    return res.data;
},
}