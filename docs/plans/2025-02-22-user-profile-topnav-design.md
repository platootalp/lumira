# 顶部用户信息栏实现方案

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在登录后的页面顶部添加用户信息栏，支持设置、个人信息、主题切换（明/暗/跟随系统）功能

**Architecture:** 
- 使用 React Context 构建主题系统，支持 light/dark/system 三种模式，偏好存储在 localStorage
- 创建 TopNavigation 组件作为应用布局的顶部栏，包含面包屑导航和用户信息下拉菜单
- 新增 /settings 和 /profile 页面用于用户配置和个人信息管理

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui

---

## 项目上下文

### 现有文件结构
```
src/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # 已定义 .dark 主题变量
│   └── dashboard/page.tsx      # 仪表盘页面
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # 侧边栏
│   │   └── AppLayout.tsx       # 应用布局
│   └── ui/                     # UI 组件
├── hooks/
│   └── use-auth.ts             # 认证 hook
└── lib/
    ├── api.ts                  # API 函数
    └── api-client.ts           # API 客户端
```

### 关键依赖
- 主题变量已在 globals.css 中定义
- useAuth hook 提供用户信息（name, email）
- AppLayout 目前只包含侧边栏

---

## 实现步骤

### Task 1: 创建主题系统 (已完成)

**Files:**
- Create: `src/components/theme-provider.tsx`

**功能:**
- 支持 light/dark/system 三种模式
- 存储键名: `lumira-theme`
- 自动监听系统主题变化

### Task 2: 安装 shadcn/ui 组件

```bash
npx shadcn add dropdown-menu avatar separator
```

### Task 3: 创建主题切换组件

**Files:**
- Create: `src/components/theme-toggle.tsx`

**功能:**
- 下拉菜单选择浅色/深色/跟随系统
- 使用太阳/月亮图标显示当前主题

### Task 4: 创建用户菜单组件

**Files:**
- Create: `src/components/user-menu.tsx`

**功能:**
- 显示用户头像（首字母）
- 下拉菜单包含：个人信息、设置、退出登录
- 显示用户名称和邮箱

### Task 5: 创建面包屑组件

**Files:**
- Create: `src/components/breadcrumb.tsx`

**功能:**
- 根据当前路径显示面包屑
- 支持所有主要页面路径映射

### Task 6: 创建顶部导航栏

**Files:**
- Create: `src/components/layout/TopNavigation.tsx`

**布局:**
- 左侧：面包屑导航
- 右侧：主题切换按钮 + 分隔线 + 用户菜单

### Task 7: 更新 AppLayout

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

**变更:**
- 添加 TopNavigation 到布局中
- 调整主内容区域样式适配顶部栏

### Task 8: 创建设置页面

**Files:**
- Create: `src/app/settings/page.tsx`

**功能:**
- 主题设置（明/暗/跟随系统）
- 其他应用设置（预留）

### Task 9: 创建个人信息页面

**Files:**
- Create: `src/app/profile/page.tsx`

**功能:**
- 显示用户信息（姓名、邮箱）
- 预留编辑功能接口

### Task 10: 更新 layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

**变更:**
- 添加 ThemeProvider 包裹
- 添加 suppressHydrationWarning 属性

---

## 组件详细设计

### ThemeProvider
使用 React Context 管理主题状态，支持三种模式切换。

### TopNavigation
顶部固定导航栏，高度 56px，包含面包屑、主题切换、用户菜单。

### UserMenu
圆形头像按钮，点击展开下拉菜单，包含用户信息展示和操作选项。

### ThemeToggle
图标按钮，点击展开主题选择下拉菜单。

---

## 测试清单

- [ ] 主题切换正常工作（明/暗/跟随系统）
- [ ] 主题偏好持久化到 localStorage
- [ ] 用户菜单显示正确的用户名和邮箱
- [ ] 面包屑导航根据路径正确显示
- [ ] 点击个人信息跳转到 /profile
- [ ] 点击设置跳转到 /settings
- [ ] 点击退出登录清除认证状态并跳转
- [ ] 深色模式下所有页面样式正确
