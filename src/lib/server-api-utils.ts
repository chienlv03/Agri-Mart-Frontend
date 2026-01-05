// lib/server-api-utils.ts
import { cookies } from "next/headers";

export async function getAuthHeaders() {
  const cookieStore = await cookies();
//   const token = cookieStore.get("accessToken")?.value; // Thay 'accessToken' bằng tên cookie bạn lưu

  // Trả về header Authorization chuẩn
  return {
    // Authorization: token ? `Bearer ${token}` : "",
    // Nếu backend của bạn đọc trực tiếp Cookie thay vì Header Authorization, dùng dòng dưới:
    Cookie: cookieStore.toString() 
  };
}