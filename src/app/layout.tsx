import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <--- Quan trọng: Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cập nhật Metadata cho chuẩn đồ án
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
        <main className="flex-grow">{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}