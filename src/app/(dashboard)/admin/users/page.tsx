"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/services/auth.service";
import { User } from "@/types/user.type";
import { Role } from "@/types/auth.types";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Dùng Ref để chặn gọi API trùng lặp trong Strict Mode
  const isFetchingRef = useRef(false);

  // 1. Hàm load user tách rời và dùng useCallback
  const loadUsers = useCallback(async (pageIndex: number) => {
    // Nếu đang fetch hoặc không còn dữ liệu thì dừng
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const res = await AuthService.getAllUsers(pageIndex, 20, "createdAt", "desc");
      
      // Kiểm tra data trả về có hợp lệ không
      if (res && res.content) {
        setUsers((prev) => {
            // Option: Có thể lọc trùng ID ở đây nếu API trả về trùng
            // const newUsers = res.content.filter(u => !prev.some(p => p.id === u.id));
            return [...prev, ...res.content];
        });
        setHasMore(!res.last);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasMore]); // Dependency

  // 2. useEffect chỉ trigger khi page thay đổi
  useEffect(() => {
    loadUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 

  // 3. Xử lý Scroll tối ưu hơn
  useEffect(() => {
    const handleScroll = () => {
      // Nếu đang loading, hết dữ liệu, hoặc chưa có user nào (tránh load page 1 ngay lập tức) thì return
      if (isLoading || !hasMore || users.length === 0) return;

      const { innerHeight, scrollY } = window;
      const { offsetHeight } = document.body;

      // Trigger khi cuộn gần đến đáy (còn 100px)
      if (innerHeight + scrollY >= offsetHeight - 100) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, users.length]); // Thêm users.length vào dependency

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              // Sử dụng user.id làm key là tốt nhất, fallback sang index nếu cần
              <TableRow key={user.id || index}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-blue-600">{user.email}</span>
                </TableCell>
                <TableCell>
                  {user.roles.map((r) => (
                    <Badge
                      className="mr-1"
                      key={r}
                      variant={
                        r === Role.ADMIN
                          ? "destructive"
                          : r === Role.SELLER
                          ? "default"
                          : "secondary"
                      }
                    >
                      {r}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Loading Indicator ở cuối bảng */}
        {isLoading && (
            <div className="py-4 text-center text-sm text-gray-500">
                Đang tải thêm dữ liệu...
            </div>
        )}
      </div>
    </div>
  );
}