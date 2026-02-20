# Command: /add-holding

添加基金持仓记录。

## Usage
```
/add-holding <fund-code> <shares> <avg-cost> [options]
```

## Arguments
- `fund-code` (required): 6位基金代码
- `shares` (required): 持有份额
- `avg-cost` (required): 平均成本价

## Options
- `--channel, -c`: 购买渠道 (蚂蚁财富/天天基金/银行等)
- `--group, -g`: 分组名称
- `--date, -d`: 买入日期 (YYYY-MM-DD)
- `--tag, -t`: 标签 (可多次使用)

## Examples
```
/add-holding 519674 1000 5.2345
/add-holding 000001 2000 3.15 --channel "蚂蚁财富" --group "核心持仓" --tag "科技"
```

## Handler
```typescript
export default async function handler(args: string[]) {
  const { code, shares, cost, channel, group, date, tags } = parseArgs(args);
  
  // 验证基金代码
  const fund = await fetchFundBasic(code);
  if (!fund) {
    return { error: `基金 ${code} 不存在` };
  }
  
  // 创建持仓记录
  const holding = await db.holdings.create({
    id: generateId(),
    fundId: code,
    fundName: fund.name,
    shares: parseFloat(shares),
    avgCost: parseFloat(cost),
    channel,
    group: group || '默认分组',
    tags: tags || [],
    createdAt: date ? new Date(date) : new Date(),
  });
  
  // 创建初始交易记录
  await db.transactions.create({
    holdingId: holding.id,
    type: 'BUY',
    date: date || new Date().toISOString().split('T')[0],
    shares: parseFloat(shares),
    price: parseFloat(cost),
    amount: parseFloat(shares) * parseFloat(cost),
  });
  
  return {
    success: true,
    holding,
    message: `成功添加 ${fund.name} (${code}) 持仓`
  };
}
```

## Validation
- 基金代码: 6位数字
- 份额: > 0
- 成本: > 0, 最多4位小数
- 日期: 不能是未来日期
