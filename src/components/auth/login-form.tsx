"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Phone, KeyRound } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { loginSchema, LoginSchemaType } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore(); // Lấy hàm login từ store
  
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      otpCode: "",
    },
  });

  // 1. Gửi OTP
  const handleSendOtp = async () => {
    const isValid = await form.trigger("phoneNumber");
    if (!isValid) return;

    const phone = form.getValues("phoneNumber");
    setIsLoading(true);

    try {
      const response = await AuthService.sendOtp({ phoneNumber: phone, type: "LOGIN" });

      toast.info(`Mã OTP test của bạn là: ${response.data.otp}`, {
        duration: 10000,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(response.data.otp)
        },
      });
      
      setShowOtpInput(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi gửi OTP");
      const status = error.response?.status;
      setCountdown(0);
      if (status === 409) {
          form.setValue("phoneNumber", ""); 
          form.setFocus("phoneNumber"); 
      } 
      else {
          form.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Đăng nhập
  const onSubmit = async (values: LoginSchemaType) => {
    if (!values.otpCode || values.otpCode.length < 6) {
      form.setError("otpCode", { message: "Mã OTP không hợp lệ" });
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API Login
      await AuthService.login({
        phoneNumber: values.phoneNumber,
        otpCode: values.otpCode,
      });

      const userRes = await AuthService.getMe(); 
      
      // Cập nhật Global State
      login(userRes.data);

      toast.success("Đăng nhập thành công!");
      
      // Chuyển hướng
      if (userRes.data.userRole === "SELLER") {
        router.push("/seller/dashboard");
      } else if (userRes.data.userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại mã OTP.";
      toast.error(msg);
      // Lỗi thường gặp: OTP sai hoặc hết hạn -> Xóa OTP để nhập lại
      form.setValue("otpCode", ""); 
      form.setFocus("otpCode");
      setCountdown(0);

      // Nếu API báo lỗi SĐT đã tồn tại (dù hãn hữu vì đã check ở bước 1)
      if (msg.includes("Số điện thoại chưa được đăng ký") || error.response?.status === 404) {
          setShowOtpInput(false); // Ẩn ô OTP đi
          form.setValue("phoneNumber", ""); // Xóa SĐT
          form.setFocus("phoneNumber"); // Focus lại SĐT
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-green-600">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold text-green-800">Đăng Nhập</CardTitle>
        <CardDescription>
          Chào mừng bà con và quý khách quay trở lại
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Input SĐT */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        className="pl-10" 
                        placeholder="0988 888 888" 
                        type="tel"
                        disabled={showOtpInput}
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Input OTP */}
            {showOtpInput && (
              <FormField
                control={form.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-green-700 font-semibold">Mã xác thực (OTP)</FormLabel>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          className="pl-10 text-lg tracking-widest font-mono" 
                          placeholder="------" 
                          maxLength={6}
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                    <div className="text-center text-sm mt-2">
                      {countdown > 0 ? (
                        <span className="text-muted-foreground">Gửi lại sau {countdown}s</span>
                      ) : (
                        <span 
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={handleSendOtp}
                        >
                          Gửi lại mã mới
                        </span>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            )}

            <Button 
              type={showOtpInput ? "submit" : "button"}
              className="w-full bg-green-600 hover:bg-green-700 text-lg h-12"
              onClick={showOtpInput ? undefined : handleSendOtp}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showOtpInput ? "Đăng Nhập" : "Lấy Mã OTP"}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}