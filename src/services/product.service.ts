import { PageResponse, Product, ProductSearchParams, ProductStatus } from "@/types/product.type";
import apiClient from "@/lib/axios";

export const ProductService = {
  // 1. API Tạo sản phẩm (ROLE_SELLER)
  // Endpoint: POST /api/v1/products
  // Body: FormData (data: json, images: file[], videos: file[])
  createProduct: async (formData: FormData) => {
    return await apiClient.post<Product>("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 3. API Xem chi tiết theo ID (Public)
  // Endpoint: GET /api/v1/products/{id}
  getProductById: async (id: string) => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  // 4. API Xem chi tiết theo Slug (Public - SEO)
  // Endpoint: GET /api/v1/products/slug/{slug}
  getProductBySlug: async (slug: string) => {
    const res = await apiClient.get<Product>(`/products/slug/${slug}`);
    return res.data;
  },

  // 5. API Lấy sản phẩm của tôi (ROLE_SELLER)
  // Endpoint: GET /api/v1/products/seller/me
  getMyProducts: async (params?: ProductSearchParams) => {
    const res = await apiClient.get<PageResponse<Product>>("/products/seller/me", {
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
    const res = await apiClient.get<PageResponse<Product>>("/products/active", {
      params: {
        page: params?.page || 0,
        size: params?.size || 10,
        createdAt: params?.sortBy || "createdAt", // Backend param tên là 'createdAt' (sortBy)
        desc: params?.order || "desc",            // Backend param tên là 'desc' (order)
      },
    });
    return res.data;
  },

  // 7. API Lấy sản phẩm PENDING cho Admin duyệt (ROLE_ADMIN)
  // Endpoint: GET /api/v1/products/pending
  getPendingProducts: async (params?: ProductSearchParams) => {
    const res = await apiClient.get<PageResponse<Product>>("/products/pending", {
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
  // Endpoint: PUT /api/v1/products/{id}/status?status=...
  updateProductStatus: async (id: string, status: ProductStatus) => {
    // Backend controller trả về ResponseEntity<Void> nên không có data trả về
    return await apiClient.put<void>(`/products/${id}/status`, null, {
      params: { status } // Gửi status qua Query Param
    });
  },

  deleteProduct: async (id: string) => {
    return await apiClient.delete<void>(`/products/${id}`);
  },


  updateProduct: async (id: string, formData: FormData) => {
    return await apiClient.put<Product>(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};