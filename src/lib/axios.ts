import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // BẮT BUỘC: Để gửi/nhận Cookie
});

// Cờ đánh dấu đang refresh để tránh gọi trùng lặp
let isRefreshing = false;
// Hàng đợi các request bị lỗi trong khi đang chờ refresh
let failedQueue: any[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Interceptor Response (Xử lý lỗi 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Nếu lỗi 401 xảy ra ở chính API login hoặc refresh -> Không retry nữa (tránh lặp vô tận)
      if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      // Đánh dấu request này đã được retry
      originalRequest._retry = true;

      // Nếu đang có một tiến trình refresh khác chạy, hãy xếp hàng chờ
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Khi refresh xong, gọi lại request ban đầu
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Gọi API Refresh (Trình duyệt tự gửi cookie refreshToken đi)
        await apiClient.post("/auth/refresh");

        // Refresh thành công! (Backend đã set lại cookie accessToken mới)

        // Giải phóng hàng đợi, báo cho các request đang chờ biết là OK rồi
        processQueue(null, true);

        // Gọi lại request hiện tại
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh thất bại (Refresh token hết hạn hoặc lỗi mạng)
        processQueue(refreshError, null);

        // --- BỔ SUNG: Gọi API Logout để Server xóa cookie HttpOnly ---
        try {
          // Dùng fetch native hoặc axios instance khác để tránh loop
          await fetch("/api/v1/auth/logout", { method: "POST" });
        } catch (e) {
          console.error("Force logout failed", e);
        }
        
        // Xóa dữ liệu user ở client và chuyển về trang login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;