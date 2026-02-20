# TypeScript Rules

基金投资助手项目的 TypeScript 代码规范。

## Type Safety
- 所有函数参数和返回值必须显式类型
- 禁止使用 `any`，使用 `unknown` + 类型守卫
- 接口命名使用 PascalCase，前缀 I 可选

```typescript
// ✅ Good
interface FundHolding {
  id: string;
  fundCode: string;
  shares: Decimal; // 使用 Decimal 处理金额
  avgCost: Decimal;
}

function calculateProfit(holding: FundHolding): ProfitResult {
  // ...
}

// ❌ Bad
function calculateProfit(holding: any) {
  // ...
}
```

## Strict Null Checks
```typescript
// ✅ Good
function findHolding(id: string): FundHolding | undefined {
  return holdings.find(h => h.id === id);
}

const holding = findHolding(id);
if (holding) {
  // safe to use
}

// ❌ Bad
function findHolding(id: string): FundHolding {
  return holdings.find(h => h.id === id)!; // 禁止非空断言
}
```

## Decimal for Money
```typescript
import Decimal from 'decimal.js';

// ✅ Good
const profit = new Decimal(marketValue).minus(cost);
return profit.toFixed(4); // 金额保留4位小数

// ❌ Bad
const profit = marketValue - cost; // 浮点数精度问题
```

## Enums vs Union Types
```typescript
// ✅ Good - Union types
 type FundType = 'STOCK' | 'BOND' | 'MIX' | 'INDEX' | 'QDII' | 'MONEY';

// ❌ Bad - Enums
enum FundType {
  STOCK = 'STOCK',
  BOND = 'BOND',
  // ...
}
```

## Async/Await
```typescript
// ✅ Good
async function fetchFundData(code: string): Promise<FundData> {
  const response = await fetch(`/api/funds/${code}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// ❌ Bad
function fetchFundData(code: string): Promise<FundData> {
  return fetch(`/api/funds/${code}`)
    .then(r => r.json());
}
```

## Error Handling
```typescript
// ✅ Good
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

async function safeCalculate(data: Input): Promise<Result<Output>> {
  try {
    const result = await calculate(data);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 使用
const result = await safeCalculate(input);
if (result.success) {
  showData(result.data);
} else {
  showError(result.error);
}
```

## Naming Conventions
- 变量/函数: camelCase
- 常量: UPPER_SNAKE_CASE
- 类型/接口: PascalCase
- 文件: kebab-case.ts
- 布尔变量前缀: is, has, should

```typescript
const MAX_RETRY_COUNT = 3;
const isMarketOpen = checkMarketStatus();
const hasHoldings = holdings.length > 0;
```
