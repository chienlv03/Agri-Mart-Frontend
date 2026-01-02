import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Định nghĩa các Route
const publicPaths = ['/login', '/register', '/', '/products'];
const authPaths = ['/login', '/register'];
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy cả 2 token
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value; // <--- THÊM DÒNG NÀY

  // --- CASE 1: Chưa đăng nhập hẳn (Mất cả 2 token) ---
  // Chỉ redirect khi mất cả accessToken LẪN refreshToken
  if (!accessToken && !refreshToken) {
    const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith('/products') || pathname.startsWith('/shops'));

    if (!isPublic) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- CASE 1.5: Hết hạn Access Token nhưng còn Refresh Token (Trạng thái chờ Refresh) ---
  // QUAN TRỌNG: Nếu lọt vào đây, nghĩa là AccessToken = null nhưng RefreshToken có.
  // Ta phải cho qua (next) để Client load lên và Axios Interceptor tự gọi API refresh.
  // Nếu ta chặn ở đây hoặc check quyền UserRole (mặc định là BUYER), user sẽ bị đá về Home sai logic.
  if (!accessToken && refreshToken) {
     return NextResponse.next();
  }

  // --- CASE 2: Đã có Access Token (Đăng nhập ổn định) ---
  
  // Giải mã Token
  const userRole = getUserRole(accessToken!); // Chắc chắn có token mới decode

  // 2.1: Đã đăng nhập mà vào Login/Register -> Về Home
  if (authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2.2: Check quyền SELLER
  if ((pathname.startsWith('/seller') || pathname.startsWith('/orders/bought')) && !userRole.includes("SELLER")) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2.3: Check quyền ADMIN
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};

// --- HÀM GIẢI MÃ TOKEN (ĐÃ FIX THEO TOKEN CỦA BẠN) ---
function getUserRole(token: string): string {
  if (!token) return "BUYER";

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // --- LOGIC MỚI: QUÉT REALM_ACCESS VÀ CHECK ROLE_ ---

    // Kiểm tra cấu trúc realm_access.roles (Chuẩn Keycloak/Spring Security)
    if (payload.realm_access?.roles && Array.isArray(payload.realm_access.roles)) {
      const roles = payload.realm_access.roles;

      // Ưu tiên quyền cao nhất trước
      if (roles.includes('ROLE_ADMIN')) return 'ADMIN';
      if (roles.includes('ROLE_SELLER')) return 'SELLER';
    }

    // Nếu không có quyền đặc biệt nào -> Mặc định là BUYER
    return "BUYER";

  } catch (error) {
    console.error("Lỗi decode token:", error);
    return "BUYER";
  }
}