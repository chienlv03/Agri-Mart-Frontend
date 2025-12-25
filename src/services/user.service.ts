import apiClient from "@/lib/axios";
import { UpdateSellerProfileRequest } from "@/types/user.type";

export const UserService = {
   updateSellerProfile: async (
    data: UpdateSellerProfileRequest,
    avatarFile?: File | null,       // Ảnh đại diện
    idCardFrontFile?: File | null,  // Ảnh mặt trước CCCD (Mới)
    idCardBackFile?: File | null,   // Ảnh mặt sau CCCD (Mới)
    farmImages?: File[]             // Ảnh vườn
  ) => {
    const formData = new FormData();

    // 1. Pack JSON data
    // Backend @RequestPart("data")
    const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
    formData.append("data", jsonBlob);

    // 2. Avatar
    // Backend @RequestPart("avatar")
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    // 3. Ảnh CCCD Mặt trước (Mới)
    // Backend @RequestPart("idCardFront")
    if (idCardFrontFile) {
      formData.append("idCardFront", idCardFrontFile);
    }

    // 4. Ảnh CCCD Mặt sau (Mới)
    // Backend @RequestPart("idCardBack")
    if (idCardBackFile) {
      formData.append("idCardBack", idCardBackFile);
    }

    // 5. Ảnh vườn
    // Backend @RequestPart("farmImages") 
    // Lưu ý: Tên key phải là "farmImages" để khớp với List<MultipartFile> farmImages bên Java
    if (farmImages && farmImages.length > 0) {
      farmImages.forEach((file) => {
        formData.append("farmImages", file);
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

  getSellerProfile: async () => {
    // Gọi GET /sellers/profile
    return await apiClient.get("/sellers/profile");
  },
}