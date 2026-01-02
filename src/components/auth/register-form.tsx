"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react"; // Thêm icon ArrowLeft

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

import { registerSchema, RegisterSchemaType } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
export function RegisterForm() {
  const { register } = useAuthStore(); // Giữ nguyên hàm register của bạn
  const router = useRouter();
  
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      otpCode: "",
    },
  });

  // --- LOGIC MỚI: Reset để quay lại bước 1 ---
  const handleResetFlow = () => {
    setShowOtpInput(false);
    setCountdown(0);
    form.setValue("otpCode", ""); // Xóa OTP
    // Giữ nguyên fullName và phoneNumber để user sửa
  };

  // 1. Gửi OTP
  const handleSendOtp = async () => {
    const isValid = await form.trigger(["fullName", "phoneNumber"]);
    if (!isValid) return;

    const phone = form.getValues("phoneNumber");
    setIsLoading(true);

    try {
      const response = await AuthService.sendOtp({ phoneNumber: phone, type: "REGISTER" });
      
      toast.info(`Mã OTP test: ${response.data.otp}`, {
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
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
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

  // 2. Submit Đăng ký
  const onSubmit = async (values: RegisterSchemaType) => {
    if (!values.otpCode || values.otpCode.length < 6) {
      form.setError("otpCode", { message: "Vui lòng nhập đủ 6 số OTP" });
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API Đăng ký
      await AuthService.register({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        otpCode: values.otpCode,
      });

      // --- LOGIC CŨ CỦA BẠN: Gọi getMe để lấy thông tin user ---
      const userRes = await AuthService.getMe();
      
      // Lưu vào Store
      register(userRes.data);

      toast.success("Đăng ký thành công!");
      router.push("/");

    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(msg);
      
      // Lỗi thường gặp: OTP sai hoặc hết hạn -> Xóa OTP để nhập lại
      form.setValue("otpCode", ""); 
      form.setFocus("otpCode");
      setCountdown(0);

      // Nếu API báo lỗi SĐT đã tồn tại (dù hãn hữu vì đã check ở bước 1)
      if (msg.includes("tồn tại") || error.response?.status === 409) {
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
      <CardHeader className="text-center relative">
        
        {/* NÚT QUAY LẠI (Chỉ hiện khi đang nhập OTP) */}
        {showOtpInput && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-4 text-gray-500 hover:text-green-600"
            onClick={handleResetFlow}
            disabled={isLoading}
            title="Sửa số điện thoại"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <CardTitle className="text-2xl font-bold text-gray-800">Đăng Ký Tài Khoản</CardTitle>
        <CardDescription>
          Nhập thông tin cá nhân để bắt đầu mua sắm.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* 1. Họ và tên */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: Nguyễn Văn A" 
                      className="h-11" 
                      {...field} 
                      disabled={showOtpInput} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Số điện thoại */}
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
                      className="h-11"
                      {...field} 
                      disabled={showOtpInput} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Nhập OTP */}
            {showOtpInput && (
              <FormField
                control={form.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-4 duration-500 bg-green-50 p-4 rounded-lg border border-green-100">
                    <FormLabel className="text-green-800 font-semibold block text-center">
                      Nhập mã xác thực (OTP)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••" 
                        maxLength={6} 
                        className="text-center text-2xl tracking-[0.5em] h-12 font-bold bg-white"
                        {...field} 
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage className="text-center"/>
                    
                    <div className="flex justify-between items-center mt-3 text-xs">
                       {/* Nút text đổi SĐT */}
                       <span 
                          className="text-gray-500 cursor-pointer hover:text-green-700 hover:underline"
                          onClick={handleResetFlow}
                       >
                          Đổi số điện thoại?
                       </span>

                       {countdown > 0 ? (
                        <span className="text-muted-foreground">Gửi lại sau <span className="font-bold text-orange-600">{countdown}s</span></span>
                      ) : (
                        <span 
                            className="text-blue-600 cursor-pointer hover:underline font-medium" 
                            onClick={() => { if(countdown === 0) handleSendOtp() }}
                        >
                            Gửi lại mã OTP
                        </span>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* 4. Buttons */}
            {!showOtpInput ? (
              <Button 
                type="button" 
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 shadow-md"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Lấy Mã OTP
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-md"
                disabled={isLoading}
              >
                 {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Hoàn Tất Đăng Ký
              </Button>
            )}

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}