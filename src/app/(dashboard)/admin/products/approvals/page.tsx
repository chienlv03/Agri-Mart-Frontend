"use client";

import { useEffect, useState } from "react";
import { ProductService } from "@/services/product.service";
import { ProductResponse } from "@/types/product.type";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductDetailDialog } from "@/components/admin/product-detail-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { format } from "date-fns";

export default function ProductApprovalPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [totalPages, setTotalPages] = useState(0); // Tổng số trang
    const pageSize = 10; // Số lượng item 1 trang

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await ProductService.getPendingProducts({
                page: page,
                size: pageSize,
                sortBy: "createdAt",
                order: "asc"
            });
            setProducts(res.content);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [page]);

    const handleStatusChange = async (id: string, status: "ACTIVE" | "REJECTED") => {
        if (!confirm(status === "ACTIVE" ? "Duyệt sản phẩm này lên sàn?" : "Từ chối sản phẩm này?")) return;

        setProcessingId(id);
        try {
            await ProductService.updateProductStatus(id, status);

            toast.success(status === "ACTIVE" ? "Đã duyệt sản phẩm" : "Đã từ chối sản phẩm");

            // Xóa khỏi danh sách UI ngay lập tức (Optimistic update)
            setProducts((prev) => prev.filter((p) => p.id !== id));

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Phê duyệt sản phẩm</h1>
                    <p className="text-sm text-muted-foreground">Kiểm tra kỹ thông tin trước khi duyệt lên sàn.</p>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 px-3 py-1">
                    Chờ duyệt: {products.length}
                </Badge>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[80px]">Ảnh</TableHead>
                            <TableHead className="w-[250px]">Tên sản phẩm</TableHead>
                            <TableHead>Người bán</TableHead>
                            <TableHead>Giá bán</TableHead>
                            <TableHead>Ngày đăng</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                    Tuyệt vời! Không có sản phẩm nào cần duyệt.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="relative h-12 w-12 rounded overflow-hidden border bg-gray-100">
                                            <Image
                                                src={p.thumbnail || (p.images && p.images[0]) || "/placeholder.jpg"}
                                                alt={p.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium line-clamp-2" title={p.name}>{p.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-6 w-6 rounded-full overflow-hidden border">
                                                <Image src={p.sellerProfileResponse?.avatarUrl || "/placeholder.jpg"} alt="" fill className="object-cover" unoptimized />
                                            </div>
                                            <span className="text-sm font-medium">{p.sellerProfileResponse?.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-red-600">
                                        {p.price?.toLocaleString()}đ/{p.unit}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {/* Cần xử lý hiển thị ngày tùy format backend */}
                                        {format(new Date(p.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Nút Xem Chi Tiết (Mở Dialog) */}
                                            <ProductDetailDialog product={p}>
                                                <Button variant="ghost" size="icon" title="Xem chi tiết">
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            </ProductDetailDialog>

                                            {/* Nút Từ chối */}
                                            <Button
                                                variant="outline" size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 px-2"
                                                onClick={() => handleStatusChange(p.id, "REJECTED")}
                                                disabled={processingId === p.id}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>

                                            {/* Nút Duyệt */}
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 gap-1"
                                                onClick={() => handleStatusChange(p.id, "ACTIVE")}
                                                disabled={processingId === p.id}
                                            >
                                                {processingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                Duyệt
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)} // Cập nhật state page -> Kích hoạt useEffect fetch lại
                />
            )}
        </div>
    );
}