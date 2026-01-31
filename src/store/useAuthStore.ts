import { AuthService } from "@/services/auth.service";
import { User } from "@/types/user.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  
  // Actions (Bỏ tham số token đi)
  register: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  saveSellerProfile: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      // Hàm register mới: Chỉ cần nhận user info
      register: (user) => set({ 
        isAuthenticated: true, 
        user: user 
      }),

      // Hàm login mới: Chỉ cần nhận user info
      login: (user) => set({ 
        isAuthenticated: true, 
        user: user 
      }),

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      saveSellerProfile: (user) => set({
        user: {
          ...user,
          email: user.email,
        }
      }),

      checkAuth: async () => {
        try {
          const response = await AuthService.getMe();
          const userData: User = response.data;
          set({ isAuthenticated: true, user: userData });
        } catch (error) {
          set({ isAuthenticated: false, user: null });
        }
      }
    }),
    {
      name: "auth-storage", // Vẫn lưu localStorage để F5 không bị mất thông tin User
    }
  )
);