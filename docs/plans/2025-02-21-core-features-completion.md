# 核心功能补全实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补全基金投资助手的三大核心功能：净值走势图、今日收益计算、排行榜真实数据接入

**Architecture:** 
1. 使用 ECharts 实现净值走势图组件，支持多时间维度切换
2. 修复今日收益计算逻辑，从净值历史中获取昨日净值进行对比
3. 接入天天基金排行榜 API，替换现有的模拟数据

**Tech Stack:** Next.js 14 + React 18 + TypeScript + ECharts 5 + TailwindCSS

---

## 前置依赖检查

**Step 0: 确认依赖已安装**

Run: `cat package.json | grep -E "(echarts|recharts)"`
Expected: 显示 echarts 和 echarts-for-react 已安装

---

## 任务组 1: 净值走势图实现

### Task 1.1: 创建净值走势图组件

**Files:**
- Create: `src/components/charts/NavHistoryChart.tsx`
- Modify: `src/app/fund/[code]/page.tsx:227-242` (替换 TODO 部分)

**Step 1: 创建净值走势图组件**

Create `src/components/charts/NavHistoryChart.tsx` with the chart component code.

**Step 2: 更新基金详情页使用图表组件**

Modify `src/app/fund/[code]/page.tsx` to import and use NavHistoryChart.

**Step 3: 验证组件渲染**

Run: `npm run typecheck`
Expected: 无类型错误

**Step 4: 手动测试**

1. 访问任意基金详情页
2. 切换到"净值走势"标签
3. 确认图表正常显示

**Step 5: Commit**

```bash
git add src/components/charts/NavHistoryChart.tsx src/app/fund/[code]/page.tsx
git commit -m "feat: implement nav history chart with echarts"
```

---

### Task 1.2: 添加时间范围切换功能

**Files:**
- Modify: `src/app/fund/[code]/page.tsx`

**Step 1: 添加时间范围状态**

添加 state: `const [timeRange, setTimeRange] = useState("3m")`

**Step 2: 更新时间范围切换 UI**

添加 1m/3m/6m/1y/all 按钮组

**Step 3: Commit**

```bash
git add src/app/fund/[code]/page.tsx
git commit -m "feat: add time range selector for nav history chart"
```

---

## 任务组 2: 今日收益计算修复

### Task 2.1: 添加获取昨日净值函数

**Files:**
- Modify: `src/services/fund.ts`
- Modify: `src/app/page.tsx`

**Step 1: 在 fund service 中添加获取昨日净值方法**

Add `getFundYesterdayNav` function to fetch yesterday's NAV.

**Step 2: 更新 calculateEstimateProfit 函数**

Add yesterdayNav parameter to calculate todayProfit.

**Step 3: 更新首页使用新的计算函数**

Update page.tsx to fetch yesterday NAVs and pass to calculation.

**Step 4: Commit**

```bash
git add src/services/fund.ts src/app/page.tsx
git commit -m "fix: implement today profit calculation"
```

---

## 任务组 3: 排行榜真实数据接入

### Task 3.1: 研究天天基金排行榜 API

**Files:**
- Create: `src/lib/eastmoney-ranking-api.ts`

**Step 1: 研究 API 接口**

通过浏览器开发者工具分析天天基金排行榜页面。

**Step 2: 创建排行榜 API 模块**

Create ranking API client with functions for:
- getDailyRisingRanking()
- getDailyDeclineRanking()
- getHotRanking()

**Step 3: Commit**

```bash
git add src/lib/eastmoney-ranking-api.ts
git commit -m "feat: add ranking API client"
```

---

### Task 3.2: 更新排行榜页面使用真实数据

**Files:**
- Modify: `src/app/rankings/page.tsx`

**Step 1: 替换模拟数据**

Replace mockRankings with API calls.

**Step 2: 添加加载状态**

Add loading spinner while fetching data.

**Step 3: 添加错误处理**

Show error message if API fails.

**Step 4: Commit**

```bash
git add src/app/rankings/page.tsx
git commit -m "feat: integrate real ranking data"
```

---

## 总结

完成以上任务后，系统将具备：
1. 完整的净值走势图功能
2. 准确的今日收益计算
3. 真实的排行榜数据

预计总工期：2-3天
