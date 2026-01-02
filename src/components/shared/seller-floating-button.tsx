"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Store } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SellerFloatingButton() {
  const { user } = useAuthStore();
  const router = useRouter();
  const constraintsRef = useRef(null);
  
  // State để kiểm tra xem user có đang kéo hay không (tránh nhầm lẫn giữa click và drag)
  const [isDragging, setIsDragging] = useState(false);

  // Chỉ hiện nếu là SELLER
  if (!user || !user.roles.includes(Role.SELLER)) {
    return null;
  }

  // Hàm xử lý Click
  const handleClick = () => {
    if (!isDragging) {
      console.log("Đang chuyển đến trang tạo sản phẩm mới...");
      router.push("/seller/products/create");
    }
  };

  return (
    // Lớp phủ vô hình full màn hình để tạo giới hạn kéo thả (Constraints)
    // pointer-events-none để không chặn click vào các element bên dưới
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              drag
              dragConstraints={constraintsRef} // Chỉ được kéo trong màn hình
              dragElastic={0.1} // Độ đàn hồi khi kéo kịch biên
              dragMomentum={false} // Tắt quán tính để dừng lại ngay khi thả chuột
              
              // Xử lý sự kiện để phân biệt Click và Drag
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 100)} // Delay nhỏ để tránh trigger click
              onClick={handleClick}
              
              // Vị trí mặc định (Góc dưới phải)
              initial={{ x: 0, y: 0 }} 
              className="pointer-events-auto absolute bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group transition-colors border-4 border-white/20 active:scale-95 active:cursor-grabbing cursor-grab"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                 <Store className="w-6 h-6" />
                 <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-green-600"></div>
                 <Plus className="w-3 h-3 absolute -top-1.5 -right-1.5 text-white font-bold" />
              </div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p className="font-semibold">Đăng bán ngay</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>
  );
}