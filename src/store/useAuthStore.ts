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
  updateSellerProfile: (user: User) => void;
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

      updateSellerProfile: (user) => set({
        user: {
          ...user,
          fullName: user.fullName,
          email: user.email,
        }
      })
    }),
    {
      name: "auth-storage", // Vẫn lưu localStorage để F5 không bị mất thông tin User
    }
  )
);