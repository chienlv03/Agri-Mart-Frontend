import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      
      {/* Logo */}
      <Link href="/" className="mb-8 flex flex-col items-center group">
        <span className="text-4xl mb-2">🌾</span>
        <span className="text-2xl font-bold text-green-800 group-hover:text-green-600 transition-colors">
          AgriMart
        </span>
      </Link>
      
      {/* Form */}
      <LoginForm />

      {/* Footer Link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <Link href="/register" className="text-green-700 font-bold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}