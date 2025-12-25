import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      {/* Logo hoặc Header nhỏ */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-800 tracking-tight">🌾 Nông Sản Việt</h1>
        <p className="text-green-600">Kết nối trực tiếp từ vườn đến bàn ăn</p>
      </div>

      {/* Form đăng ký chính */}
      <RegisterForm />

      {/* Footer chuyển trang */}
      <div className="mt-6 text-center text-sm">
        <p className="text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}