"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls"; // Component phân trang cũ
import { toast } from "sonner";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await ProductService.getMyProducts({ page, size: 10 });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [page]);


  // Hàm xóa
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await ProductService.deleteProduct(id);
      toast.success("Đã xóa sản phẩm");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sản phẩm của tôi</h1>
        <Link href="/seller/products/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Đăng bán mới
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="relative h-12 w-12 rounded border overflow-hidden">
                    <Image
                      src={p.thumbnail || (p.images && p.images[0]) || "/placeholder.jpg"}
                      alt={p.name} fill className="object-cover"
                      unoptimized
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>{p.name}</div>
                  <div className="text-xs text-muted-foreground">SKU: {p.id.substring(0, 8)}</div>
                </TableCell>
                <TableCell>{p.price.toLocaleString()}đ/{p.unit}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "ACTIVE" ? 'default' : p.status === 'PENDING' ? 'secondary' : 'destructive'}
                    className={p.status === 'ACTIVE' ? 'bg-green-600' : ''}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/products/${p.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                  </Link>
                  <Link href={`/seller/products/edit/${p.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Chưa có sản phẩm nào.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}