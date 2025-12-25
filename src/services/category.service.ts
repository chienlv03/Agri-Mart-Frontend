import { Category } from "@/types/product.type";
import apiClient from "@/lib/axios";

export const CategoryService = {
    // 1. API Lấy tất cả danh mục (Public)
    createCategory: async (formData: FormData) => {
        return await apiClient.post<Category>("/categories", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    getAllCategories: async () => {
        const res = await apiClient.get<Category[]>("/categories");
        return res.data;
    },

    updateCategory: async (id: string, formData: FormData) => {
        return await apiClient.put<Category>(`/categories/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteCategory: async (id: string) => {
        return await apiClient.delete(`/categories/${id}`);
    },
}