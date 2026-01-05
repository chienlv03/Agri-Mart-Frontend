"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
// Giả sử bạn đã thêm service api
import { FollowService } from "@/services/follow.service"; 
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  shopId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ shopId, onFollowChange }: FollowButtonProps) {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // 1. Check trạng thái ban đầu khi mount
  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    
    // Không cho phép tự follow mình
    if (user.id === shopId) return;

    FollowService.checkFollowStatus(shopId)
      .then((status) => setIsFollowing(status))
      .catch((err) => console.error(err))
      .finally(() => setChecking(false));
  }, [shopId, user]);

  // 2. Xử lý bấm nút
  const handleToggle = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để theo dõi Shop");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await FollowService.toggleFollow(shopId);
      setIsFollowing(res.isFollowing);
      toast.success(res.message);

      if (onFollowChange) {
        onFollowChange(res.isFollowing);
      }
    } catch (error: any) {
      toast.error(error?.message?.data.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // Nếu là chính mình thì ẩn nút
  if (user?.id === shopId) return null;

  return (
    <Button 
      className={`flex-1 h-9 text-xs md:text-sm ${
        isFollowing 
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300" 
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
      onClick={handleToggle}
      disabled={loading || checking}
    >
      {checking ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-1" /> Đang theo dõi
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-1" /> Theo dõi
        </>
      )}
    </Button>
  );
}