import { z } from "zod";

// Regex kiểm tra số điện thoại Việt Nam
const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự" }),
  phoneNumber: z.string().regex(phoneRegex, { message: "Số điện thoại không hợp lệ" }),
  // OTP code là optional ban đầu, nhưng bắt buộc khi submit cuối cùng
  otpCode: z.string().optional(), 
});

export const loginSchema = z.object({
  phoneNumber: z.string().regex(phoneRegex, { message: "Số điện thoại không hợp lệ" }),
  otpCode: z.string().optional(), 
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;