# 主题切换全面适配实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将主题切换功能从仅顶部栏生效扩展到所有页面和组件（侧边栏、body、底部栏、所有UI组件）

**Architecture:** 使用已存在的 CSS 变量系统（globals.css 中已定义 :root 和 .dark 变量），将所有硬编码的 slate/gray/white 颜色替换为 CSS 变量（如 bg-card、text-foreground、border-border 等）。Tailwind 的 dark: 变体会自动根据 html 元素上的 class 切换。

**Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS 3.4 + shadcn/ui CSS 变量系统

---

## 当前状态分析

### 已完成的主题基础设施
- ✅ `src/components/theme-provider.tsx` - 主题状态管理 Context
- ✅ `src/app/globals.css` - CSS 变量定义（:root 和 .dark）
- ✅ `tailwind.config.ts` - Tailwind 颜色配置引用 CSS 变量
- ✅ `src/app/layout.tsx` - 已包裹 ThemeProvider

### 需要修复的组件分类

| 优先级 | 组件/页面 | 当前问题 |
|--------|-----------|----------|
| P0 | layout.tsx body | 硬编码 `bg-gray-50` |
| P0 | Sidebar.tsx | 大量使用 `bg-white`, `border-slate-200/50`, `text-slate-600` |
| P0 | 各页面背景 | 使用 `bg-gradient-to-br from-slate-50 via-white to-blue-50` |
| P1 | UI 组件 (card, button, tabs) | 硬编码 slate 颜色 |
| P1 | 业务组件 (fund-card, transaction-form) | 硬编码颜色 |
| P2 | 首页 (Landing Page) | 特殊设计，需要单独处理 |

---

## Task 1: 修复 layout.tsx body 背景

**Files:**
- Modify: `src/app/layout.tsx:22`

**修改内容:**
```tsx
// 修改前:
<body className="min-h-screen bg-gray-50">

// 修改后:
<body className="min-h-screen bg-background">
```

---

## Task 2: 修复 Sidebar.tsx 暗黑模式适配

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**修改内容:**

1. NavLink 组件样式 (第62-68行):
   - `hover:bg-slate-100` → `hover:bg-accent`
   - `bg-blue-50 text-blue-600 hover:bg-blue-100` → `bg-primary/10 text-primary hover:bg-primary/20`
   - `text-slate-600` → `text-muted-foreground`

2. Icon 颜色 (第70行):
   - `text-blue-600` → `text-primary`

3. 文字颜色 (第72行):
   - `text-blue-600` → `text-primary`

4. aside 背景 (第107行):
   - `bg-white border-r border-slate-200/50` → `bg-card border-r border-border`

5. header 边框 (第114行):
   - `border-slate-100` → `border-border`

6. Logo 区域 (第118-122行):
   - `from-blue-500 to-blue-600` → `from-primary to-primary/80`
   - `shadow-blue-500/25` → `shadow-primary/25`
   - `text-white` → `text-primary-foreground`
   - 移除渐变文字效果，使用 `text-foreground`

7. 底部按钮区域 (第139行和第143行):
   - `border-slate-100` → `border-border`
   - `text-slate-400 hover:text-slate-600 hover:bg-slate-100` → `text-muted-foreground hover:text-foreground hover:bg-accent`

8. MobileSidebar 按钮 (第168行):
   - `hover:bg-slate-100` → `hover:bg-accent`

9. SheetContent (第172行):
   - 添加 `bg-card`

10. MobileSidebar 内部样式 (第174-178行):
    - 同 Logo 区域修改

11. MobileSidebar 导航链接 (第195-198行):
    - 同 NavLink 组件样式修改

---

## Task 3: 修复 dashboard/page.tsx

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**修改内容:**

1. 页面背景 (第89行和第93行):
   - `bg-gradient-to-br from-slate-50 via-white to-blue-50` → `bg-background`

2. 标题区域 (第100-101行):
   - `text-slate-900` → `text-foreground`
   - `text-slate-500` → `text-muted-foreground`

3. 卡片标题 (第115行):
   - `text-slate-900` → `text-foreground`

4. 标签样式 (第121行):
   - `bg-slate-100 text-slate-600` → `bg-muted text-muted-foreground`

5. TabsList 背景 (第190行):
   - `bg-slate-100` → `bg-muted`

6. TabsTrigger 激活样式 (第191-199行):
   - `data-[state=active]:bg-white` → `data-[state=active]:bg-background`

---

## Task 4: 修复 holdings/page.tsx

**Files:**
- Modify: `src/app/holdings/page.tsx`

**修改内容:**

1. 页面背景 (第92行和第96行):
   - `bg-gradient-to-br from-slate-50 via-white to-blue-50` → `bg-background`

2. 标题区域 (第104-105行):
   - `text-slate-900` → `text-foreground`
   - `text-slate-500` → `text-muted-foreground`

3. 搜索框样式 (第122-127行):
   - `border-slate-200` → `border-input`
   - `focus:ring-blue-500` → `focus:ring-ring`
   - 添加 `bg-background`

4. 下拉选择框 (第134行):
   - `border-slate-200` → `border-input`
   - `focus:ring-blue-500` → `focus:ring-ring`
   - `bg-white` → `bg-background`

5. 加载骨架屏 (第163行):
   - `bg-slate-100` → `bg-muted`

6. 空状态样式 (第169-172行):
   - `bg-slate-100` → `bg-muted`
   - `text-slate-400` → `text-muted-foreground`
   - `text-slate-900` → `text-foreground`

---

## Task 5: 修复其他页面

按照 Task 3 和 Task 4 的模式，修复以下页面：

- `src/app/rankings/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/sip/page.tsx`
- `src/app/import/page.tsx`
- `src/app/analysis/page.tsx`
- `src/app/fund/[code]/page.tsx`

**通用替换规则：**

| 查找 | 替换 |
|------|------|
| `bg-gradient-to-br from-slate-50 via-white to-blue-50` | `bg-background` |
| `bg-slate-50` | `bg-muted` |
| `bg-slate-100` | `bg-muted` |
| `bg-white` | `bg-card` 或 `bg-background` |
| `text-slate-900` | `text-foreground` |
| `text-slate-600` | `text-muted-foreground` |
| `text-slate-500` | `text-muted-foreground` |
| `text-slate-400` | `text-muted-foreground` |
| `border-slate-200` | `border-input` 或 `border-border` |
| `border-slate-100` | `border-border` |
| `focus:ring-blue-500` | `focus:ring-ring` |

---

## Task 6: 修复 UI 组件

**Files:**
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/toast.tsx`
- Modify: `src/components/ui/tooltip.tsx`
- Modify: `src/components/ui/sheet.tsx`

**修改内容:**

将各 UI 组件中的硬编码颜色替换为 CSS 变量：
- `bg-white` → `bg-card`
- `bg-slate-100` → `bg-muted`
- `text-slate-900` → `text-foreground`
- `text-slate-600` → `text-muted-foreground`
- `border-slate-200` → `border-border`

---

## Task 7: 修复业务组件

**Files:**
- Modify: `src/components/fund-card.tsx`
- Modify: `src/components/transaction-form.tsx`
- Modify: `src/components/sip-calculator.tsx`

**修改内容:**

按照通用替换规则修复业务组件中的硬编码颜色。

---

## Task 8: 修复首页 (Landing Page)

**Files:**
- Modify: `src/app/page.tsx`

**特殊处理:**

首页是营销页面，有独特的设计风格。建议：
1. 保持现有的渐变和视觉设计
2. 为暗黑模式创建对应的深色渐变
3. 或使用 `dark:` 前缀添加暗黑模式样式

---

## Task 9: 验证主题切换

**验证步骤:**

1. 启动开发服务器: `npm run dev`
2. 访问 http://localhost:3000
3. 在 UserMenu 中切换主题
4. 验证以下组件是否正确切换:
   - ✅ 顶部栏 (TopNavigation)
   - ✅ 侧边栏 (Sidebar)
   - ✅ 页面主体背景
   - ✅ 卡片组件
   - ✅ 按钮组件
   - ✅ 文字颜色
   - ✅ 边框颜色

---

## CSS 变量参考

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 221 83% 53%;
}

.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 14%;
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 14%;
  --popover-foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 222 47% 11%;
  --secondary: 222 47% 18%;
  --secondary-foreground: 210 40% 98%;
  --muted: 222 47% 18%;
  --muted-foreground: 215 20% 65%;
  --accent: 222 47% 18%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 210 40% 98%;
  --border: 222 47% 20%;
  --input: 222 47% 20%;
  --ring: 217 91% 60%;
}
```

---

**Plan complete and saved to `docs/plans/2026-02-22-theme-adaptation-plan.md`.**
