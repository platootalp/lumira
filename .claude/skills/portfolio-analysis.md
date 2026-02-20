# Skill: Portfolio Analysis

投资组合综合分析，生成资产总览和收益报表。

## Purpose
聚合多平台持仓，分析资产配置和收益表现。

## Input
```typescript
{
  holdings: Holding[];
  fundData: Map<string, FundEstimate>; // 实时估值数据
  dateRange?: '1m' | '3m' | '6m' | '1y' | 'all'; // 默认 all
}
```

## Output
```typescript
{
  summary: PortfolioSummary;
  allocation: AssetAllocation;
  performance: PerformanceMetrics;
  topHoldings: TopHolding[];
  riskMetrics: RiskMetrics;
}
```

## Key Metrics

### 1. Portfolio Summary
```typescript
{
  totalAssets: number;        // 总资产（基于估算净值）
  totalCost: number;          // 总成本
  totalProfit: number;        // 总收益
  totalProfitRate: number;    // 总收益率
  todayProfit: number;        // 今日预估收益
  availableFunds: number;     // 可用资金
}
```

### 2. Asset Allocation
```typescript
{
  byType: Array<{ type: FundType; amount: number; percentage: number }>;
  byRisk: Array<{ risk: RiskLevel; amount: number; percentage: number }>;
  byChannel: Array<{ channel: string; amount: number; percentage: number }>;
  byGroup: Array<{ group: string; amount: number; percentage: number }>;
}
```

### 3. Performance Metrics
```typescript
{
  totalReturn: number;        // 累计收益
  annualizedReturn: number;   // 年化收益 (XIRR)
  volatility: number;         // 波动率
  sharpeRatio: number;        // 夏普比率
  maxDrawdown: number;        // 最大回撤
  winRate: number;            // 胜率
}
```

## Algorithms

### 资产分类计算
```typescript
function calculateAllocation(holdings: Holding[]): Allocation {
  const total = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  
  const byType = groupBy(holdings, 'fund.type')
    .map(([type, items]) => ({
      type,
      amount: items.reduce((s, i) => s + i.marketValue, 0),
      percentage: items.reduce((s, i) => s + i.marketValue, 0) / total * 100
    }));
  
  return { byType, /* ... */ };
}
```

### 收益归因
```typescript
// 找出贡献最大的持仓
function calculateContribution(holdings: Holding[]): TopHolding[] {
  return holdings
    .map(h => ({
      ...h,
      profit: h.marketValue - h.totalCost,
      contribution: (h.marketValue - h.totalCost) / totalProfit * 100
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);
}
```

## Visualization Data

### 收益走势 (Time Series)
```typescript
{
  dates: string[];
  values: number[];    // 每日资产总值
  profits: number[];   // 累计收益
  benchmark?: number[]; // 基准对比 (如沪深300)
}
```

### 收益日历 (Heatmap)
```typescript
{
  year: number;
  month: number;
  data: Array<{
    date: string;
    profit: number;     // 当日收益
    profitRate: number; // 当日收益率
  }>;
}
```

## Performance Optimization
- 增量计算：只计算变动部分
- Memoization：缓存计算结果
- Web Worker：大数据量异步处理

## Compliance
- 展示"投资有风险"提示
- 收益数据标注时间范围
- 不展示未来预测
