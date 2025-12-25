import { ProductForm } from "@/components/seller/product-form";

export default function CreateProductPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">Đăng bán sản phẩm mới</h1>
      <p className="text-muted-foreground mb-6">Điền đầy đủ thông tin để sản phẩm được duyệt nhanh chóng.</p>
      <ProductForm />
    </div>
  );
}