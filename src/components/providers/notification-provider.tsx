"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Notification } from "@/types/notification.types";
import { NotificationService } from "@/services/notification.service";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Chỉ dùng user để check trạng thái đăng nhập
  const user = useAuthStore((state) => state.user);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<InstanceType<typeof Client> | null>(null);

  // 1. Fetch lịch sử thông báo (Đã sửa lỗi Cascading Renders)
  useEffect(() => {
    let isMounted = true;

    const initializeNotifications = async () => {
      // Nếu chưa đăng nhập -> Reset mảng rỗng
      if (!user) {
        if (isMounted) setNotifications([]);
        return;
      }

      // Nếu đã đăng nhập -> Gọi API
      try {
        const data = await NotificationService.getMyNotifications();
        if (isMounted) setNotifications(data);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      }
    };

    // Gọi hàm async này sẽ biến việc setState thành bất đồng bộ (Microtask)
    // Giúp tránh lỗi "Synchronous setState"
    initializeNotifications();

    return () => { isMounted = false; };
  }, [user]);

  // 2. Kết nối WebSocket
  useEffect(() => {
    // Guard clause: Nếu chưa có user, tuyệt đối không kết nối
    if (!user) return;

    // URL của Notification Service
    const socketUrl = `http://localhost:8085/ws`;

    interface StompFrame {
      headers: Record<string, string>;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      
      // XÓA BỎ connectHeaders chứa accessToken 
      // Vì chúng ta dùng Cookie (HttpOnly) nên trình duyệt tự gửi
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (): void => {
      setIsConnected(true);
      
      // Subscribe vào hàng đợi cá nhân
      client.subscribe("/user/queue/notifications", (message: Message): void => {
        try {
         const newNotification: Notification = JSON.parse(message.body);
         
         setNotifications((prev: Notification[]) => [newNotification, ...prev]);
         
         toast.info(newNotification.title, {
           description: newNotification.message,
           position: "top-right",
           duration: 5000
         });
        } catch (e) {
         console.error("Lỗi parse notification socket:", e);
        }
      });
      },

      onDisconnect: (): void => {
      setIsConnected(false);
      },

      onStompError: (frame: StompFrame): void => {
      console.error('Broker reported error: ' + frame.headers['message']);
      },

      // Tắt debug log nếu không cần thiết
      debug: (str: string): void => {
      console.log(str); 
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setIsConnected(false);
      }
    };
  }, [user]);

  const markRead = async (id: string) => {
    try {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        await NotificationService.markAsRead(id);
    } catch (error) {
        console.error(error);
    }
  };

  const markAllRead = async () => {
      try {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          await NotificationService.markAllAsRead();
      } catch (error) {
          console.error(error);
      }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
}