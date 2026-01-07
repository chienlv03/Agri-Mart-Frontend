import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SellerFloatingButton } from "@/components/shared/seller-floating-button";
// 1. Import Provider
import { NotificationProvider } from "@/components/providers/notification-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nông Sản Sạch - Từ Vườn Đến Bàn Ăn",
  description: "Sàn thương mại điện tử kết nối trực tiếp nông dân và người tiêu dùng Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* 2. Bọc NotificationProvider ở đây */}
        <NotificationProvider>
            <main className="grow">{children}</main>
            
            <SellerFloatingButton />
            
            {/* Toaster để hiển thị popup thông báo real-time */}
            <Toaster position="top-center" richColors />
        </NotificationProvider>
      </body>
    </html>
  );
}