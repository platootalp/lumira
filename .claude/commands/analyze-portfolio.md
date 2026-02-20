# Command: /analyze-portfolio

分析投资组合，生成完整报表。

## Usage
```
/analyze-portfolio [options]
```

## Options
- `--range, -r`: 时间范围 (1m/3m/6m/1y/ytd/all), 默认 all
- `--group, -g`: 按分组筛选
- `--export, -e`: 导出格式 (json/csv/pdf)

## Examples
```
/analyze-portfolio
/analyze-portfolio --range 1y --group "核心持仓"
/analyze-portfolio --export csv
```

## Output
```
📊 投资组合分析报告
━━━━━━━━━━━━━━━━━━━━

💰 资产概览:
总资产: ¥128,450.32
总成本: ¥100,000.00
总收益: ¥28,450.32 (+28.45%)
今日预估: +¥1,234.56

📈 收益表现:
累计收益: +28.45%
年化收益(XIRR): +31.2%
夏普比率: 1.85
最大回撤: -12.3%
胜率: 68.5%

📊 资产配置:
按类型:
  • 混合型: 45% (¥57,802)
  • 股票型: 35% (¥44,957)
  • 债券型: 15% (¥19,267)
  • 货币型: 5% (¥6,424)

按风险等级:
  • 中高风险: 55%
  • 中等风险: 25%
  • 中低风险: 20%

🏆 收益贡献 TOP 5:
1. 银河创新成长混合A: +¥8,234 (28.9%)
2. 诺安成长混合: +¥6,543 (23.0%)
3. 易方达蓝筹精选: +¥5,123 (18.0%)
...

⚠️ 风险提示:
当前组合偏股型比例较高(80%)，建议适当配置债券型
基金平衡风险。

━━━━━━━━━━━━━━━━━━━━
数据时间: 2026-02-20 15:30:00
⚠️ 以上数据仅供参考，以基金公司披露为准
```

## Implementation
```typescript
export default async function handler(args: string[]) {
  const { range, group, exportFormat } = parseArgs(args);
  
  // 获取持仓
  let holdings = await getHoldings();
  if (group) {
    holdings = holdings.filter(h => h.group === group);
  }
  
  // 获取实时估值
  const estimates = await fetchEstimates(holdings.map(h => h.fundId));
  
  // 计算分析
  const analysis = await analyzePortfolio(holdings, estimates, range);
  
  // 导出或打印
  if (exportFormat) {
    return await exportReport(analysis, exportFormat);
  }
  
  return formatAnalysisReport(analysis);
}
```
