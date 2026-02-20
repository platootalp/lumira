# Skill: Calculate XIRR

计算投资组合的扩展内部收益率(XIRR)。

## Purpose
精确计算基金投资的年化收益率，考虑不规则现金流和时间价值。

## Input
```typescript
{
  cashflows: Array<{
    date: string;      // ISO日期 (YYYY-MM-DD)
    amount: number;    // 正数=投入, 负数=赎回/分红
  }>;
  currentValue: number; // 当前持仓市值
  currentDate?: string; // 默认今天
}
```

## Output
```typescript
{
  xirr: number;       // 年化收益率 (%)
  irr: number;        // 内部收益率 (每期)
  days: number;       // 投资天数
  totalInvested: number;
  totalRedeemed: number;
  profit: number;
}
```

## Algorithm
使用牛顿迭代法求解XIRR方程：
```
Σ(CF_i / (1 + r)^((d_i - d_0) / 365)) = 0
```

## Implementation
```typescript
function calculateXIRR(cashflows: CashFlow[], guess = 0.1): number {
  const maxIterations = 100;
  const epsilon = 1e-7;
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    const { npv, derivative } = calculateNPVAndDerivative(cashflows, rate);
    
    if (Math.abs(npv) < epsilon) {
      return rate;
    }
    
    const newRate = rate - npv / derivative;
    if (Math.abs(newRate - rate) < epsilon) {
      return newRate;
    }
    rate = newRate;
  }
  
  return rate;
}
```

## Examples

### 例1: 定投场景
```
投入: 2024-01-01 +1000
投入: 2024-02-01 +1000
投入: 2024-03-01 +1000
当前: 2024-04-01 市值3150

XIRR = 17.8%
```

### 例2: 分红再投入
```
投入: 2023-06-01 +10000
分红: 2023-12-01 -200 (负=收入)
当前: 2024-06-01 市值11200

XIRR = 14.2%
```

## Notes
- 至少需要2笔现金流（一正一负）
- 首笔现金流日期作为基准
- 当前市值作为最后一笔负现金流
- 无法计算时返回 null
