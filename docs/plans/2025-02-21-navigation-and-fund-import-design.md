# Lumira 导航重构与基金导入功能设计文档

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构应用导航架构（添加侧边栏），将定投计算器拆分为独立页面，并实现四种基金添加方式（搜索、手动输入、Excel导入、OCR识别）。

**Architecture:** 采用左侧固定侧边栏导航，将原首页功能拆分为资产概览、持仓明细、收益分析、定投计划四个独立页面。基金导入功能统一在「数据导入」页面，支持多种数据源的智能识别与预览确认。

**Tech Stack:** Next.js 14 + React 18, TypeScript, TailwindCSS, Tesseract.js (客户端OCR), Dexie.js (IndexedDB)

---

## 目录

1. [导航架构重构](#一导航架构重构)
2. [侧边栏组件设计](#二侧边栏组件设计)
3. [页面功能拆分](#三页面功能拆分)
4. [基金导入功能](#四基金导入功能)
5. [定投计划页面](#五定投计划页面)
6. [数据模型更新](#六数据模型更新)
7. [实施顺序](#七实施顺序)

---

## 一、导航架构重构

### 1.1 新的页面结构

```
src/app/
├── layout.tsx                 # 添加侧边栏布局
├── page.tsx                   # 资产概览（精简版）
├── holdings/
│   └── page.tsx              # 持仓明细（新增）
├── analysis/
│   └── page.tsx              # 收益分析（新增）
├── sip/
│   └── page.tsx              # 定投计划（从首页拆分）
├── rankings/
│   └── page.tsx              # 基金排行（现有）
├── compare/
│   └── page.tsx              # 基金对比（现有）
└── import/
    └── page.tsx              # 数据导入（新增）
```

### 1.2 侧边栏导航项

| 图标 | 标签 | 路径 | 说明 |
|------|------|------|------|
| LayoutDashboard | 资产概览 | / | 总资产卡片+图表 |
| Wallet | 持仓明细 | /holdings | 基金列表+管理 |
| TrendingUp | 收益分析 | /analysis | 收益趋势+日历 |
| Calculator | 定投计划 | /sip | 计算器+回测 |
| Trophy | 基金排行 | /rankings | 现有功能 |
| GitCompare | 基金对比 | /compare | 现有功能 |
| Upload | 数据导入 | /import | 四种添加方式 |

---

## 二、侧边栏组件设计

### 2.1 组件规格

**文件位置：** `src/components/layout/Sidebar.tsx`

**Props 接口：**
```typescript
interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}
```

**设计规格：**
- 宽度：展开 240px / 收起 64px
- 位置：左侧固定 (fixed left-0 top-0 h-full)
- 背景：白色 + 右侧阴影 (shadow-lg)
- 响应式：移动端变为抽屉式 (Sheet 组件)

**交互细节：**
- 当前页面高亮：蓝色背景 + 蓝色图标
- 悬停效果：浅灰色背景
- 收起/展开动画：宽度过渡 300ms ease
- 收起时仅显示图标，tooltip 显示标签

### 2.2 布局适配

**文件位置：** `src/app/layout.tsx`

```typescript
// 主要内容区域需要适配侧边栏
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 ml-[240px] overflow-auto">
    {children}
  </main>
</div>
```

---

## 三、页面功能拆分

### 3.1 资产概览页面 (src/app/page.tsx)

**保留功能：**
- 资产总览卡片（总资产/累计收益/今日收益/持有数量）
- 资产配置饼图
- 收益走势图
- 快速操作按钮（添加基金 → 跳转 /import）

**移除功能：**
- 基金卡片列表 → 移至 /holdings
- 定投计算器 → 移至 /sip
- 顶部功能链接（排行/对比）→ 移至侧边栏

### 3.2 持仓明细页面 (src/app/holdings/page.tsx)

**功能列表：**
1. **页面头部**
   - 标题：持仓明细
   - 统计信息：持有基金数、总资产
   - 添加按钮：跳转 /import

2. **筛选区域**
   - 分组筛选下拉框
   - 搜索框（按基金名称/代码）
   - 排序选项（市值/收益率/今日涨跌）

3. **基金列表**
   - 复用现有的 FundCard 组件
   - 网格布局，自适应列数
   - 空状态提示

### 3.3 收益分析页面 (src/app/analysis/page.tsx) - 简化版

**第一阶段实现：**
1. **收益日历**
   - 月历视图显示每日收益
   - 正收益红色，负收益绿色

2. **收益趋势图**
   - 近7日/30日/90日/1年切换
   - 累计收益曲线

### 3.4 数据导入页面 (src/app/import/page.tsx)

**页面结构：**
```
数据导入
├── 标签切换: [搜索添加] [手动输入] [Excel导入] [截图识别]
│
├── Tab 1: 搜索添加
├── Tab 2: 手动输入
├── Tab 3: Excel导入
└── Tab 4: 截图识别
```

---

## 四、基金导入功能

### 4.1 搜索添加 (Tab 1)

- 复用现有 AddHoldingModal 的搜索逻辑
- 提取搜索和选择逻辑到独立组件
- 选中后跳转持仓填写页面

### 4.2 手动输入 (Tab 2)

**表单字段：**
```typescript
interface ManualFundInput {
  fundId: string;        // 基金代码，必填
  fundName: string;      // 基金名称，必填
  fundType?: FundType;   // 基金类型，可选
  nav?: number;          // 当前净值，可选
}
```

### 4.3 Excel导入 (Tab 3)

**支持的格式：**

| 平台 | 文件特征 | 解析策略 |
|------|----------|----------|
| 支付宝 | 含"基金代码""基金名称""持有份额" | 列名匹配 |
| 微信理财通 | 含"基金名称""持仓份额" | 列名匹配+数值识别 |
| 蚂蚁财富 | 类似支付宝格式 | 列名匹配 |

**技术实现：**
- 使用 `xlsx` 库解析 Excel 文件
- 浏览器端解析，不上传服务器
- 支持最大 1000 行数据

### 4.4 OCR截图识别 (Tab 4)

**双模式实现：**

#### 模式A - 客户端识别 (Tesseract.js)

**技术规格：**
- 库：`tesseract.js` v5
- 语言包：chi_sim+eng（中文简体+英文）

#### 模式B - 云端API识别

**可选API：**
| 服务商 | 优点 | 缺点 |
|--------|------|------|
| 百度OCR | 中文准确率高，有免费额度 | 需要实名认证 |
| 腾讯云OCR | 表格识别强 | 付费 |
| 阿里云OCR | 文档分析强 | 付费 |

---

## 五、定投计划页面

### 5.1 页面布局

左侧：我的定投方案列表
右侧：定投计算器 + 计算结果 + 定投回测

### 5.2 功能模块

**1. 我的方案**
- 保存多个定投方案
- 快速切换查看不同参数的结果

**2. 定投计算器**
- 复用现有的 SIPCalculator 组件
- 添加「保存方案」按钮

**3. 定投回测（新增）**
- 选择历史基金
- 选择回测时间段
- 模拟定投收益计算

---

## 六、数据模型更新

### 6.1 新增类型定义

**文件位置：** `src/types/import.ts`（新建）

```typescript
export interface ImportPreviewItem {
  fundId: string;
  fundName: string;
  totalShares: number;
  avgCost?: number;
  channel?: string;
  group?: string;
  valid: boolean;
  errors: string[];
}

export type ImportSource = 'search' | 'manual' | 'excel' | 'ocr';
export type ExcelPlatform = 'alipay' | 'wechat' | 'ant' | 'unknown';

export interface OcrConfig {
  provider: 'client' | 'baidu' | 'tencent' | 'aliyun';
  apiKey?: string;
  secretKey?: string;
}
```

**文件位置：** `src/types/sip.ts`（新建）

```typescript
export interface SIPPlan {
  id: string;
  name: string;
  monthlyAmount: number;
  years: number;
  expectedReturn: number;
  currentNav?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 IndexedDB 更新

**文件位置：** `src/lib/db.ts`

添加新表：
```typescript
// 在 LumiraDatabase 构造函数中
this.version(2).stores({
  sipPlans: 'id, name, createdAt',
  ocrConfig: 'id'
});
```

---

## 七、实施顺序

### Phase 1: 基础架构（1-2天）
1. 创建 Sidebar 组件
2. 更新 layout.tsx 集成侧边栏
3. 创建新页面框架（holdings, analysis, sip, import）
4. 配置侧边栏导航路由

### Phase 2: 页面迁移（2-3天）
1. 精简首页，移除基金列表和定投计算器
2. 创建持仓明细页面（/holdings）
3. 创建收益分析页面（/analysis）- 简化版
4. 创建定投计划页面（/sip）- 迁移现有计算器

### Phase 3: 基金导入功能（3-4天）
1. 数据导入页面框架（Tabs）
2. 搜索添加 Tab
3. 手动输入 Tab
4. Excel导入 Tab（含解析器）
5. OCR识别 Tab（客户端 + 云端）

### Phase 4: 定投计划增强（2-3天）
1. 定投方案保存功能
2. 定投回测功能
3. 历史基金数据获取

### Phase 5: 优化完善（1-2天）
1. 响应式适配（移动端侧边栏）
2. 数据导入错误处理
3. 空状态、加载状态优化

---

**预计总工期：9-14天**

**Ready to implement?** 使用 `superpowers:executing-plans` 可以开始按此计划实施。
