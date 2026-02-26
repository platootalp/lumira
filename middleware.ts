import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register'];
const staticPrefixes = ['/_next', '/api', '/favicon', '/images', '/fonts'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源
  if (staticPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const accessToken = request.cookies.get('accessToken')?.value;

  // 公开路由处理
  if (isPublicRoute) {
    // 已登录用户访问登录/注册页面，重定向到首页
    if ((pathname === '/login' || pathname === '/register') && accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 保护路由：未登录则重定向到登录页面
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
