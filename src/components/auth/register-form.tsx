"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { registerSchema, RegisterSchemaType } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { UserRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/useAuthStore";

export function RegisterForm() {
  const { register } = useAuthStore(); // Lấy hàm register từ store
  const router = useRouter();
  const [showOtpInput, setShowOtpInput] = useState(false); // Trạng thái hiện ô OTP
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // Đếm ngược 60s

  // 1. Khởi tạo Form
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneNumber: "",
      userRole: UserRole.BUYER, // Mặc định là người mua
      otpCode: "",
    },
  });

  // 2. Hàm xử lý gửi OTP
  const handleSendOtp = async () => {
    // Validate trước các trường SĐT và Tên
    const isValid = await form.trigger(["phoneNumber", "userRole"]);
    if (!isValid) return;

    const phone = form.getValues("phoneNumber");
    setIsLoading(true);

    try {
      // Gọi API gửi OTP
      const response = await AuthService.sendOtp({ phoneNumber: phone });
      
      toast.info(`Mã OTP test của bạn là: ${response.data.otp}`, {
        duration: 10000, // Hiện lâu chút (10s) để kịp nhìn
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(response.data.otp)
        },
      });
      setShowOtpInput(true);
      
      // Bắt đầu đếm ngược 60s
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi gửi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Hàm xử lý Đăng ký (Submit cuối cùng)
  const onSubmit = async (values: RegisterSchemaType) => {
    if (!values.otpCode || values.otpCode.length < 6) {
      form.setError("otpCode", { message: "Vui lòng nhập đủ 6 số OTP" });
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API Đăng ký
      await AuthService.register({
        phoneNumber: values.phoneNumber,
        userRole: values.userRole as UserRole,
        otpCode: values.otpCode,
      });

      const userRes = await AuthService.getMe(); // Cần đảm bảo axios interceptor đã gắn token vừa lưu
      console.log("User info:", userRes.data);
      
      // Cập nhật Global State
      register(userRes.data);

      toast.success("Đăng ký thành công!");
      
      // Chuyển hướng dựa trên vai trò
      if (values.userRole === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-700">Tạo Tài Khoản Mới</CardTitle>
        <CardDescription>
          Nhập số điện thoại để bắt đầu kinh doanh hoặc mua sắm nông sản.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Chọn Vai trò (Radio Group đẹp) */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Bạn là ai?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={showOtpInput} // Khóa lại khi đang nhập OTP
                    >
                      <div>
                        <RadioGroupItem value="BUYER" id="buyer" className="peer sr-only" />
                        <Label
                          htmlFor="buyer"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                        >
                          <span className="text-xl mb-1">🛒</span>
                          Người Mua
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="SELLER" id="seller" className="peer sr-only" />
                        <Label
                          htmlFor="seller"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                        >
                          <span className="text-xl mb-1">👩‍🌾</span>
                          Nông Dân
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Nhập Họ tên
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Nguyễn Văn A" {...field} disabled={showOtpInput} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* 3. Nhập Số điện thoại */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0988 888 888" 
                      type="tel" 
                      {...field} 
                      disabled={showOtpInput} // Khóa khi đã gửi OTP
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Nhập OTP (Chỉ hiện khi đã gửi mã) */}
            {showOtpInput && (
              <FormField
                control={form.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <FormLabel className="text-green-700 font-semibold">
                      Nhập mã xác thực (OTP)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập 6 số OTP" 
                        maxLength={6} 
                        className="text-center text-lg tracking-widest"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground text-center">
                      Mã đã gửi về console log (giả lập Zalo). {countdown > 0 ? `Gửi lại sau ${countdown}s` : <span className="text-blue-600 cursor-pointer" onClick={() => { if(countdown === 0) handleSendOtp() }}>Gửi lại mã</span>}
                    </p>
                  </FormItem>
                )}
              />
            )}

            {/* 5. Nút bấm biến hình */}
            {!showOtpInput ? (
              <Button 
                type="button" 
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Lấy Mã OTP
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                disabled={isLoading}
              >
                 {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Đăng Ký Ngay
              </Button>
            )}

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}