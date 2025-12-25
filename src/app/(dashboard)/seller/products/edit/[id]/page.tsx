"use client";

import { useEffect, useState, use } from "react"; // 1. Thêm import 'use'
import { ProductForm } from "@/components/seller/product-form";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 2. Định nghĩa lại kiểu Props cho params là Promise
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // 3. Dùng hook 'use' để lấy ID chuẩn từ Promise
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        toast.error("Không tìm thấy sản phẩm hoặc có lỗi xảy ra");
        router.push("/seller/products"); // Quay về nếu lỗi
      } finally {
        setIsLoading(false); // Luôn tắt loading dù thành công hay thất bại
      }
    };

    loadProduct();
  }, [id, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Cập nhật sản phẩm</h1>
      <ProductForm initialData={product} isEditMode={true} />
    </div>
  );
}