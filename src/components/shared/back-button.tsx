"use client"; // Bắt buộc phải có dòng này để dùng useRouter

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => router.back()} 
      className="gap-1 text-gray-600 hover:text-green-700 hover:bg-green-50 pl-0"
    >
      <ChevronLeft className="h-5 w-5" />
      Quay lại
    </Button>
  );
}