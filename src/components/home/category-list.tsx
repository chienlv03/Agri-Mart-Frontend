import Image from "next/image";
import { Category } from "@/types/product.type";
import { CategoryService } from "@/services/category.service";

export async function CategoryList() {
  // Gọi API lấy danh mục (Server Side)
  let categories: Category[] = [];
  try {
    categories = await CategoryService.getAllCategories();
  } catch (error) {
    console.error("Lỗi tải danh mục:", error);
  }

  // Nếu chưa có danh mục nào (lúc mới chạy), hiển thị mock tạm hoặc thông báo
  if (categories.length === 0) {
      // Mock tạm thời nếu backend trống
      categories = [
          { id: "1", name: "Rau củ", slug: "rau-cu", image: "🥬" },
          { id: "2", name: "Trái cây", slug: "trai-cay", image: "🍎" },
          { id: "3", name: "Thịt trứng", slug: "thit-trung", image: "🥩" },
      ] as Category[];
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Danh mục</h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="h-16 w-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-3xl shadow-sm group-hover:border-green-500 group-hover:shadow-md transition-all overflow-hidden relative">
              {/* Nếu có ảnh từ API thì hiện ảnh, không thì hiện icon/chữ cái đầu */}
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized/>
              ) : (
                <span className="text-2xl">{cat.image || cat.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700 text-center line-clamp-1">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}