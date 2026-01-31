import { SellerProfileForm } from "@/components/seller/seller-profile-form";

export default function SellerProfilePage() {
  return (
    <div className="space-y-6">
      <div className="items-center flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ nhà bán hàng</h1>
        <p className="text-muted-foreground">Cập nhật đầy đủ thông tin để tăng độ uy tín với khách hàng.</p>
      </div>
      <SellerProfileForm />
    </div>
  );
}