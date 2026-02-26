# 登录注册流程重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有的弹窗式登录注册改为页面跳转模式，实现统一的路由守卫、Token 自动刷新机制，以及完整的登录后跳转逻辑。

**Architecture:** 
- 使用 Next.js Middleware 实现服务端路由守卫，基于 Cookie 判断登录状态
- 客户端使用定时检查（5分钟阈值）+ 401 拦截兜底的双层 Token 刷新策略
- 登录/注册页面统一处理 `redirect` 参数，实现登录后返回原页面

**Tech Stack:** Next.js 14 App Router, React Query, Zod, JWT

---

## 前置信息

### 现有文件结构
- `src/components/auth/login-modal.tsx` - 登录弹窗（将删除）
- `src/components/auth/register-modal.tsx` - 注册弹窗（将删除）
- `src/components/auth/auth-provider.tsx` - Auth Provider（将简化）
- `src/components/auth/auth-modals-container.tsx` - 弹窗容器（将删除）
- `src/stores/auth-modal.ts` - Zustand 弹窗状态（将删除）
- `src/hooks/use-auth.ts` - 认证 Hook（需大幅修改）
- `src/lib/api-client.ts` - API 客户端（需添加刷新逻辑）
- `src/lib/api.ts` - API 方法（基本可用）

### 需保护的路由（未登录时重定向到 /login）
- `/holdings`
- `/fund/[code]`
- `/compare`
- `/sip`
- `/rankings`
- `/import`
- `/analysis`

### 公开路由
- `/` - 首页（展示登录引导）
- `/login` - 登录页（已登录则跳首页）
- `/register` - 注册页（已登录则跳首页）

---

## 任务依赖关系

```
Phase 1 (可并行)
├── 1.1 创建 cookies.ts
├── 1.2 启用 middleware.ts 路由守卫
└── 1.3 验证 register/page.tsx redirect

Phase 2 (依赖1.1)
└── 2.1 重构 api-client.ts 添加刷新机制

Phase 3 (依赖2.1)
└── 3.1 更新 use-auth.ts 添加 requireAuth

Phase 4 (独立)
└── 4.1 验证 login/page.tsx redirect

Phase 5 (依赖3.1)
├── 5.1 简化 auth-provider.tsx
├── 5.2 移除 layout.tsx 弹窗容器
├── 5.3 删除弹窗组件
└── 5.4 删除 auth-modal store
```

---

## Phase 1: 基础设置

### Task 1.1: 创建 Cookie 辅助工具

**Files:**
- Create: `src/lib/cookies.ts`

**Step 1: 编写代码**

```typescript
export interface CookieOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return decodeURIComponent(cookieValue);
  }
  return null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return;
  const { path = '/', expires, maxAge, domain, secure, sameSite = 'lax' } = options;
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (path) cookieString += `; path=${path}`;
  if (expires) cookieString += `; expires=${expires.toUTCString()}`;
  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  document.cookie = cookieString;
}

export function deleteCookie(name: string, path = '/'): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
```

**Step 2: TypeScript 检查**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/cookies.ts
git commit -m "feat(auth): add cookie utility functions

- Add getCookie, setCookie, deleteCookie helpers
- Define AUTH_COOKIES constants for token management
- Support all standard cookie options"
```

---

### Task 1.2: 启用 Middleware 路由守卫

**Files:**
- Create: `middleware.ts` (项目根目录)

**Step 1: 编写 Middleware 代码**

```typescript
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
```

**Step 2: 测试 Middleware**

Test case 1: 未登录访问 /holdings
```bash
curl -I http://localhost:3000/holdings
```
Expected: HTTP/1.1 302 Found, Location: /login?redirect=/holdings

Test case 2: 已登录访问 /login (带 cookie)
```bash
curl -I --cookie "accessToken=test" http://localhost:3000/login
```
Expected: HTTP/1.1 302 Found, Location: /

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): implement Next.js middleware for route protection

- Protect all routes except /, /login, /register
- Redirect unauthenticated users to /login with redirect param
- Redirect authenticated users away from /login and /register
- Skip static resources and API routes"
```

---

### Task 1.3: 验证注册页 redirect 支持

**Files:**
- Check: `src/app/register/page.tsx`

**Step 1: 确认已有 redirect 支持**

检查是否包含以下关键代码：
- `import { useSearchParams } from "next/navigation";`
- `const searchParams = useSearchParams();`
- `const redirect = searchParams.get("redirect") || "/";`
- `router.push(redirect)` when authenticated

**Step 2: 手动测试**

访问 `/register?redirect=/holdings`，注册成功后应跳转到 `/holdings`。

**Step 3: 如需修改则提交，否则跳过**

---

## Phase 2: API 客户端增强

### Task 2.1: 重构 api-client.ts 添加 Token 刷新机制

**Files:**
- Modify: `src/lib/api-client.ts`（完全替换）

**关键变更:**
- 添加定时刷新检查（60秒间隔）
- 添加 401 自动重试机制
- 添加 Promise 锁防止并发刷新
- 更新 Cookie 存储逻辑

**测试方法:**
1. 登录后等待5分钟以上，观察是否自动刷新token
2. 在开发者工具中清除cookie的accessToken，然后刷新页面，观察是否401触发刷新
3. 并发发送多个请求，验证Promise锁只触发一次刷新

**Step 1-3: 实现、测试、Commit**

---

## Phase 3: 认证 Hook 更新

### Task 3.1: 更新 use-auth.ts 添加 requireAuth

**Files:**
- Modify: `src/hooks/use-auth.ts`

**关键变更:**
- 添加 `requireAuth(redirectPath?: string)` 方法
- 添加 `handleAuthSuccess(redirectUrl?: string)` 方法
- 添加多标签页 token 同步
- 移除 onUnauthorized handler 设置（由 middleware 处理）

**测试方法:**
1. 调用 requireAuth()，未登录时应跳转到 /login
2. 调用 requireAuth('/holdings')，应跳转到 /login?redirect=/holdings
3. 登录成功后，handleAuthSuccess 应正确处理 redirect 参数

---

## Phase 4: 登录页验证

### Task 4.1: 验证 login/page.tsx redirect 支持

**Files:**
- Check: `src/app/login/page.tsx`

验证登录页是否支持 redirect 参数，逻辑应与注册页一致。

---

## Phase 5: 清理弹窗相关代码

### Task 5.1: 简化 auth-provider.tsx

**Files:**
- Modify: `src/components/auth/auth-provider.tsx`

简化后的代码：
```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuth();
  return <>{children}</>;
}
```

### Task 5.2: 移除 layout.tsx 弹窗容器

**Files:**
- Modify: `src/app/layout.tsx`

移除 `AuthModalsContainer` 组件引用。

### Task 5.3: 删除弹窗组件

**Files to delete:**
- `src/components/auth/login-modal.tsx`
- `src/components/auth/register-modal.tsx`
- `src/components/auth/auth-modals-container.tsx`

### Task 5.4: 删除 auth-modal store

**Files to delete:**
- `src/stores/auth-modal.ts`

---

## 验证清单

### 功能验证
- [ ] 未登录访问 /holdings → 重定向到 /login?redirect=/holdings
- [ ] 已登录访问 /login → 重定向到 /
- [ ] 登录成功后 → 跳转到 redirect 参数指定的页面
- [ ] Token 即将过期（<5分钟）→ 自动刷新
- [ ] 收到 401 响应 → 尝试刷新并重试请求
- [ ] 登出 → 清除 token，跳转到首页

### 回归测试
- [ ] npm run typecheck 通过
- [ ] npm test 通过
- [ ] npm run build 成功

---

## 回滚策略

如需回滚：
```bash
git checkout main
```

或在当前分支：
```bash
git reset --hard HEAD~N  # N 为提交数量
```
