import apiClient from "@/lib/axios";
import { UpdateSellerProfileRequest } from "@/types/user.type";

export const UserService = {
   saveSellerProfile: async (
    data: UpdateSellerProfileRequest,
    avatarFile?: File | null,       // Ảnh đại diện
    idCardFrontFile?: File | null,  // Ảnh mặt trước CCCD (Mới)
    idCardBackFile?: File | null,   // Ảnh mặt sau CCCD (Mới)
    farmImages?: File[],             // Ảnh vườn
    businessLicensesImages?: File[]    // Ảnh giấy phép kinh doanh
  ) => {
    const formData = new FormData();

    // 1. Pack JSON data
    const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
    formData.append("data", jsonBlob);

    // 2. Avatar
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    // 3. Ảnh CCCD Mặt trước (Mới)
    if (idCardFrontFile) {
      formData.append("idCardFront", idCardFrontFile);
    }

    // 4. Ảnh CCCD Mặt sau (Mới)
    if (idCardBackFile) {
      formData.append("idCardBack", idCardBackFile);
    }

    // 5. Ảnh vườn
    if (farmImages && farmImages.length > 0) {
      farmImages.forEach((file) => {
        formData.append("farmImages", file);
      });
    }

    // 6. Ảnh giấy phép kinh doanh
    if (businessLicensesImages && businessLicensesImages.length > 0) {
      businessLicensesImages.forEach((file) => {
        formData.append("businessLicensesImages", file);
      });
    }

    // Gọi API
    // Lưu ý: Nếu backend trả về void thì response sẽ không có data body
    return await apiClient.put("/sellers/profile", formData, {
      headers: { 
        "Content-Type": "multipart/form-data" 
      },
    });
  },

  getMySellerProfile: async () => {
    // Gọi GET /sellers/profile
    return await apiClient.get("/sellers/profile");
  },

  
  async getSellerPublicProfile(sellerId: string) {
    const res = await apiClient.get(`/sellers/${sellerId}`);
    return res.data;
  },
}