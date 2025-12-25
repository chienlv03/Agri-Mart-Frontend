import { create } from 'zustand';
import { toast } from 'sonner';
import { CartService } from '@/services/cart.service';
import { CartItemResponse } from '@/types/order.types';

interface CartState {
  items: CartItemResponse[];
  isLoading: boolean;
  
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  // 1. Lấy giỏ hàng từ Backend
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await CartService.getMyCart();
      set({ items: data });
    } catch (error: any) {
      // Nếu lỗi 401 (Chưa đăng nhập), interceptor đã xử lý redirect hoặc 
      // ta có thể set giỏ hàng rỗng ở đây
      console.error("Lỗi tải giỏ hàng:", error);
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. Thêm vào giỏ
  addToCart: async (productId, quantity) => {
    // Optimistic Update (Tùy chọn): Cập nhật UI trước cho mượt (nhưng ở đây làm chuẩn là gọi API xong mới load lại)
    try {
      await CartService.addToCart({ productId, quantity });
      
      toast.success("Đã thêm vào giỏ hàng!");
      
      // Quan trọng: Sau khi thêm xong, phải tải lại giỏ hàng mới nhất từ Redis về
      // Để đảm bảo giá cả và thông tin đồng bộ
      await get().fetchCart(); 

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi thêm vào giỏ hàng";
      
      // Nếu chưa đăng nhập (401), Interceptor sẽ lo việc redirect.
      // Nếu 400 (Hết hàng), toast lỗi ra
      if (error.response?.status !== 401) {
          toast.error(msg);
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    // 1. Validation cơ bản
    if (quantity < 1) return;

    // 2. Lưu lại state cũ (để revert nếu API lỗi)
    const oldItems = get().items;

    // 3. OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId === productId) {
          // Cập nhật số lượng và tính lại tổng tiền item đó
          return { 
             ...item, 
             quantity: quantity,
             totalPrice: item.price * quantity // Giả sử price là number
          };
        }
        return item;
      }),
    }));

    // 4. Gọi API ngầm (Background)
    try {
      await CartService.updateQuantity({ productId, quantity });
      // API thành công -> Không cần làm gì thêm vì UI đã đúng rồi
    } catch (error) {
      // 5. Nếu lỗi -> Revert về state cũ và thông báo
      console.error("Lỗi cập nhật số lượng", error);
      set({ items: oldItems });
      toast.error("Không thể cập nhật số lượng, vui lòng thử lại");
    }
  },

  // 3. Xóa khỏi giỏ
  removeFromCart: async (productId) => {
    try {
      await CartService.removeFromCart(productId);
      
      // Xóa ở Client luôn cho nhanh (Optimistic UI)
      set((state) => ({
        items: state.items.filter((i) => i.productId !== productId)
      }));
      
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm", error);
      toast.error("Lỗi xóa sản phẩm");
    }
  },

  // 4. Xóa sạch giỏ (Dùng sau khi Checkout thành công)
  clearCart: () => {
    set({ items: [] });
  },

  // Tính toán UI
  totalItems: () => get().items.length,
  totalPrice: () => get().items.reduce((total, item) => total + item.totalPrice, 0),
}));