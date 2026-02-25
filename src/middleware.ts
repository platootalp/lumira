import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由（无需登录即可访问）
const publicRoutes = [
  '/',
  '/login',
  '/register',
];

// 静态资源路由前缀
const staticPrefixes = [
  '/_next',
  '/api',
  '/favicon',
  '/images',
  '/fonts',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源和 API 路由
  if (staticPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 不再在中间件层面进行登录检查
  // 客户端会通过 API 调用时的 401 响应来显示登录弹窗
  return NextResponse.next();
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // 未登录，重定向到登录页面，并记录原目标地址
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录，允许访问
  return NextResponse.next();
}

// 配置匹配器
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
