import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SellerFloatingButton } from "@/components/shared/seller-floating-button";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { Suspense } from "react"; // 1. Import Suspense

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
        <NotificationProvider>
            {/* 2. Bọc Suspense để tránh lỗi de-opt static generation khi dùng search params */}
            <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
               <main className="grow">{children}</main>
            </Suspense>
            
            <SellerFloatingButton />
            <Toaster position="top-center" richColors />
        </NotificationProvider>
      </body>
    </html>
  );
}