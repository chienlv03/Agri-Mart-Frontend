"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/product.type";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { CategoryService } from "@/services/category.service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCategories();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await CategoryService.deleteCategory(id);
      toast.success("Đã xóa danh mục");
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h1>
        <CategoryDialog onSuccess={fetchCategories}>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
          </Button>
        </CategoryDialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={cat.image} />
                    <AvatarFallback>{cat.name}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500">{cat.slug}</TableCell>
                <TableCell className="text-gray-500">
                  {cat.description}
                  </TableCell>
                <TableCell className="text-right space-x-2">
                  <CategoryDialog category={cat} onSuccess={fetchCategories}>
                    <Button variant="outline" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CategoryDialog>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}