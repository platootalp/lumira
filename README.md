# Lumira - 基金投资助手

面向散户投资者的基金持仓管理应用。

## 技术栈

- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: TailwindCSS + Radix UI
- **状态**: Zustand + React Query
- **存储**: IndexedDB (Dexie.js)
- **图表**: ECharts 5
- **API**: 天天基金数据接口

## 核心功能

### 已实现功能

| 功能 | 描述 | 路径 |
|------|------|------|
| 资产总览 | 展示总资产、累计收益、今日收益 | `/` |
| 基金搜索 | 实时搜索基金名称和代码 | 弹窗 |
| 添加持仓 | 两步流程：搜索基金 → 填写持仓 | 弹窗 |
| 实时估值 | 从天天基金获取实时估值数据 | API |
| 收益图表 | 资产配置饼图/收益分布/走势 | `/` |
| 基金详情 | 净值、估值、收益分析、交易记录 | `/fund/[code]` |
| 交易记录 | 买入/卖出交易管理 | `/fund/[code]` |
| 定投计算 | 定期定额投资收益计算器 | `/` |
| 基金对比 | 最多5只基金对比分析 | `/compare` |
| 基金排行 | 涨幅榜/跌幅榜/热门榜 | `/rankings` |
| 数据导入导出 | JSON/CSV 格式导入导出 | 弹窗 |

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── funds/
│   ├── fund/[code]/       # 基金详情页
│   ├── compare/           # 基金对比页
│   ├── rankings/          # 基金排行榜
│   ├── page.tsx           # 首页(资产总览)
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 组件
│   ├── ui/               # 基础UI组件
│   ├── add-holding-modal.tsx
│   ├── fund-card.tsx
│   ├── portfolio-chart.tsx
│   ├── transaction-form.tsx
│   ├── sip-calculator.tsx
│   ├── data-import-export.tsx
│   ├── loading.tsx
│   └── error-boundary.tsx
├── lib/                  # 工具库
│   ├── calculate.ts      # XIRR/夏普/回撤计算
│   ├── db.ts             # IndexedDB数据库
│   ├── eastmoney-api.ts  # 天天基金API
│   └── utils.ts          # 通用工具
├── services/             # 服务层
│   └── fund.ts           # 基金数据服务
├── stores/              # 状态管理
│   └── portfolio.ts     # 投资组合状态
└── types/               # TypeScript类型
    └── index.ts
```

## 开发模式

本项目采用 OpenCode Agentic 开发模式，定义了三个核心 Agent:

- **fund-analyst**: 基金数据分析，负责收益计算和投资分析
- **ui-architect**: UI架构设计，负责 React 组件和页面
- **backend-engineer**: 后端开发，负责 API 和数据库

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run typecheck

# 构建
npm run build

# 运行测试
npm run test
```

访问 http://localhost:3000

## API 接口

| 接口 | 描述 | 来源 |
|------|------|------|
| `/api/funds/search` | 搜索基金 | 天天基金 |
| `/api/funds/[code]/estimate` | 实时估值 | 天天基金 |

## 数据存储

- **IndexedDB**: 本地离线存储，支持 Holdings/Transactions/Funds/Settings
- **缓存策略**: 估值数据 30 秒 TTL

## 环境要求

- Node.js 18+
- npm 10+

## 免责声明

本应用数据仅供参考，不构成投资建议。市场有风险，投资需谨慎。

## License

MIT
