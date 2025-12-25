import { Button } from "@/components/ui/button";

export function HomeBanner() {
  return (
    <div className="relative h-[200px] md:h-[300px] w-full rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-800 flex items-center px-8 md:px-16 shadow-lg">
      <div className="text-white space-y-2 z-10">
        <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-1 rounded-md animate-pulse">
          FREESHIP
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Chợ Phiên <br /> Cuối Tuần
        </h2>
        <p className="text-green-100 max-w-md text-sm md:text-base">
          Giảm giá lên đến 50% cho các sản phẩm rau củ quả tươi trong ngày.
        </p>
        <Button className="bg-white text-green-700 hover:bg-gray-100 mt-4 font-bold shadow-md">
          Mua Ngay
        </Button>
      </div>
      {/* Hình trang trí */}
      <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
        <span className="text-[10rem] md:text-[15rem]">🥗</span>
      </div>
    </div>
  );
}