# Skill: Fetch Fund Data

获取基金基础数据和实时估值。

## Purpose
从多个数据源获取基金信息，自动失败转移。

## Input
```typescript
{
  fundCode: string;     // 6位基金代码
  dataType: 'basic' | 'estimate' | 'nav_history' | 'detail';
  source?: 'auto' | 'eastmoney' | 'sina'; // 默认 auto
}
```

## Output
```typescript
{
  success: boolean;
  fundCode: string;
  data: FundData;
  source: string;
  cached: boolean;
  timestamp: string;
}
```

## Supported Data Types

### 1. basic - 基础信息
```typescript
{
  name: string;
  type: FundType;
  company: string;
  manager: string;
  establishedDate: string;
  riskLevel: RiskLevel;
}
```

### 2. estimate - 实时估值
```typescript
{
  estimateNav: number;
  estimateTime: string;
  estimateChange: number;  // 涨跌额
  estimateChangePercent: number;
  lastNav: number;
  lastNavDate: string;
}
```

### 3. nav_history - 净值历史
```typescript
{
  history: Array<{
    date: string;
    nav: number;
    accumNav: number;
    change?: number;
  }>;
}
```

### 4. detail - 完整详情
包含 basic + 最新净值 + 规模 + 费率等

## Data Sources

### Primary: EastMoney (天天基金)
```
估值: https://fundmobapi.eastmoney.com/FundMApi/FundBase.ashx?FCODE={code}
历史: https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz&code={code}
```

### Fallback: Sina Finance
```
https://hq.sinajs.cn/list=f_{code}
```

### Data Parsing
```typescript
// EastMoney 估值响应解析
function parseEstimate(data: string): EstimateData {
  const json = JSON.parse(data.replace(/^var\s+\w+=/, ''));
  return {
    estimateNav: parseFloat(json.gz),
    estimateTime: json.gztime,
    estimateChangePercent: parseFloat(json.gszzl)
  };
}
```

## Caching Strategy
| Type | TTL |
|------|-----|
| basic | 24h |
| estimate | 30s (交易日) |
| nav_history | 1h |
| detail | 1h |

## Error Handling
- 超时: 3s，重试2次
- 失败转移: Source1 → Source2 → Cache → Error
- 非交易日返回 last known data

## Compliance
- 添加"估值仅供参考，以官方披露为准"
- 遵守robots.txt
- 控制请求频率 (<10 req/s)
