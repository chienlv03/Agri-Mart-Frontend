"use client";

import { useState } from "react";
import { useNotification } from "@/components/providers/notification-provider";
import { Bell, Package, ShoppingCart, Leaf, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { Notification } from "@/types/notification.types";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const [open, setOpen] = useState(false);

  // Helper chọn Icon theo loại
  const getIcon = (type: string) => {
    if (type.includes("ORDER")) return <ShoppingCart className="w-4 h-4 text-blue-600" />;
    if (type.includes("PRODUCT")) return <Package className="w-4 h-4 text-orange-600" />;
    if (type.includes("HARVEST")) return <Leaf className="w-4 h-4 text-green-600" />;
    return <Info className="w-4 h-4 text-gray-600" />;
  };

  // Helper điều hướng khi click
  const getLink = (n: Notification) => {
      if (n.type.includes("ORDER")) return `/orders/${n.referenceId}`;
      if (n.type.includes("PRODUCT")) return `/products/${n.referenceId}`; // Hoặc trang quản lý shop
      return "#";
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-green-700 hover:bg-green-50">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
          <h4 className="font-semibold text-sm">Thông báo ({unreadCount})</h4>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto px-2 text-xs text-blue-600 hover:text-blue-700"
                onClick={markAllRead}
            >
                Đánh dấu đã đọc hết
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              Chưa có thông báo nào
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link 
                    href={getLink(notification)} 
                    key={notification.id}
                    onClick={() => {
                        if(!notification.isRead) markRead(notification.id);
                        setOpen(false); // Đóng popup khi click
                    }}
                >
                    <div className={cn(
                        "flex gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                        !notification.isRead ? "bg-blue-50/40" : "bg-white"
                    )}>
                        {/* Avatar/Icon */}
                        <div className="shrink-0 mt-1">
                             {notification.imageUrl ? (
                                 <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                                     <Image src={notification.imageUrl} alt="" fill className="object-cover" unoptimized />
                                 </div>
                             ) : (
                                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                     {getIcon(notification.type)}
                                 </div>
                             )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                            <p className={cn("text-sm text-gray-900 line-clamp-2", !notification.isRead && "font-semibold")}>
                                {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                        
                        {/* Dot indicator */}
                        {!notification.isRead && (
                             <div className="shrink-0 self-center">
                                 <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                             </div>
                        )}
                    </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}