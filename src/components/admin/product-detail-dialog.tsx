import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Product } from "@/types/product.type";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Calendar, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDetailDialogProps {
  product: Product;
  children: React.ReactNode; // Nút kích hoạt (icon mắt)
}

export function ProductDetailDialog({ product, children }: ProductDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[80vw] max-w-[1000px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chi tiết sản phẩm chờ duyệt</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cột Trái: Ảnh */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image 
                  src={product.thumbnail || "/placeholder.jpg"} 
                  alt={product.name} 
                  fill 
                  className="object-cover" 
                  unoptimized
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {/* {product.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded border overflow-hidden">
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </div>
                ))} */}
              </div>
            </div>

            {/* Cột Phải: Thông tin */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                    {product.unit}
                  </Badge>
                  <span className="text-lg font-bold text-red-600">
                    {/* {product.price.toLocaleString()}₫ */}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> 
                  <span className="font-semibold">Người bán:</span> {product.seller?.name}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 
                  <span className="font-semibold">Nguồn gốc:</span> {product.attributes?.origin}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> 
                  <span className="font-semibold">Thu hoạch:</span> {product.attributes?.harvestDate ? new Date(product.attributes.harvestDate).toLocaleDateString("vi-VN") : "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> 
                  <span className="font-semibold">Bảo quản:</span> {product.attributes?.preservation}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Mô tả sản phẩm:</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}