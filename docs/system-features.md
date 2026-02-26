# Lumira 系统功能清单

> 最后更新: 2025-02-26

## 📊 系统概述

Lumira 是一个面向散户投资者的基金持仓管理应用，采用 Next.js 前端 + Express 后端架构，提供实时基金追踪、投资组合分析和投资规划工具。

---

## 🔐 认证功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **用户注册** | 使用姓名、邮箱、密码创建新账户 | `src/app/register/page.tsx` |
| **用户登录** | 邮箱/密码认证，支持 JWT | `src/app/login/page.tsx` |
| **JWT Token 管理** | Access token + Refresh token 自动续期 | `src/lib/api-client.ts` |
| **路由守卫** | 未登录自动跳转登录页 | `middleware.ts` |
| **登录后重定向** | 支持 redirect 参数返回原页面 | `src/hooks/use-auth.ts` |
| **用户登出** | 清除 Token 和会话数据 | `src/hooks/use-auth.ts` |

**后端 API:**
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

---

## 💰 基金管理功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **基金搜索** | 按名称或6位代码实时搜索 | `src/services/fund.ts` |
| **实时估值** | 从天天基金获取实时净值估算 | `src/services/fund.ts` |
| **批量估值** | 同时获取多只基金的估值 | `src/services/fund.ts` |
| **净值历史** | 历史净值数据查询 | `src/lib/eastmoney-api.ts` |
| **基金详情** | 基金类型、公司、费率、经理等完整信息 | `src/lib/eastmoney-api.ts` |

**前端 API 路由:**
- `GET /api/funds/search?q={query}` - 搜索基金
- `GET /api/funds/[code]/estimate` - 获取实时估值

**后端 API:**
- `GET /api/funds/search` - 搜索基金
- `GET /api/funds/:id` - 获取基金详情
- `GET /api/funds/:id/estimate` - 获取实时估值
- `GET /api/funds/:id/history` - 获取净值历史

---

## 📈 持仓/投资组合功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **资产总览** | 总资产、累计收益、今日预估收益 | `src/app/page.tsx` |
| **持仓列表** | 基金持仓网格展示，支持搜索排序 | `src/app/holdings/page.tsx` |
| **基金卡片** | 可视化卡片展示市值、收益、今日涨跌 | `src/components/fund-card.tsx` |
| **添加持仓** | 两步流程：搜索基金 → 填写持仓详情 | `src/components/add-holding-modal.tsx` |
| **创建持仓** | 添加新基金仓位（份额、成本、渠道） | `src/hooks/use-holdings.ts` |
| **更新持仓** | 修改持仓信息 | `src/hooks/use-holdings.ts` |
| **删除持仓** | 从投资组合移除持仓 | `src/hooks/use-holdings.ts` |
| **渠道追踪** | 记录购买渠道（蚂蚁财富、天天基金等） | `src/components/import/ManualTab.tsx` |

**后端 API:**
- `GET /api/holdings` - 获取所有持仓
- `POST /api/holdings` - 创建持仓
- `GET /api/holdings/:id` - 获取持仓详情
- `PUT /api/holdings/:id` - 更新持仓
- `DELETE /api/holdings/:id` - 删除持仓

---

## 💱 交易功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **交易表单** | 添加买入/卖出交易（日期、份额、价格、手续费） | `src/components/transaction-form.tsx` |
| **交易列表** | 查看某只基金的所有交易记录 | `src/app/fund/[code]/page.tsx` |
| **买入交易** | 记录基金购买 | `src/components/transaction-form.tsx` |
| **卖出交易** | 记录基金赎回 | `src/components/transaction-form.tsx` |
| **自动更新持仓** | 自动重新计算份额、成本、总成本 | `src/components/transaction-form.tsx` |

**后端 API:**
- `GET /api/transactions` - 获取所有交易
- `POST /api/transactions` - 创建交易
- `GET /api/transactions/holding/:holdingId` - 按持仓获取交易
- `PUT /api/transactions/:id` - 更新交易
- `DELETE /api/transactions/:id` - 删除交易

---

## 📊 分析/报表功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **资产配置图表** | 按基金类型展示投资组合分布饼图 | `src/components/charts/AssetDistribution.tsx` |
| **收益分布图表** | 各持仓收益率对比柱状图 | `src/components/portfolio-chart.tsx` |
| **趋势图表** | 投资组合价值走势折线图 | `src/components/portfolio-chart.tsx` |
| **净值历史图表** | 带时间范围选择器的交互式图表 | `src/components/charts/NavHistoryChart.tsx` |
| **实时估值标记** | 在净值图表上标记当前估值 | `src/components/charts/NavHistoryChart.tsx` |
| **投资组合摘要** | 汇总投资组合指标 | `src/hooks/use-portfolio.ts` |
| **最佳持仓** | 收益最高的持仓 | `src/hooks/use-portfolio.ts` |
| **最差持仓** | 收益最低的持仓 | `src/hooks/use-portfolio.ts` |

**后端 API:**
- `GET /api/portfolio/summary` - 投资组合摘要
- `GET /api/portfolio/allocation` - 资产配置
- `GET /api/portfolio/top-holdings` - 收益最高持仓
- `GET /api/portfolio/bottom-holdings` - 收益最低持仓

---

## 📥 数据导入/导出功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **搜索导入** | 直接搜索添加基金 | `src/components/import/SearchTab.tsx` |
| **手动录入** | 表单方式手动输入，带验证 | `src/components/import/ManualTab.tsx` |
| **Excel 导入** | 拖拽上传 Excel 文件 | `src/components/import/ExcelTab.tsx` |
| **平台识别** | 自动识别支付宝、微信、蚂蚁财富格式 | `src/components/import/ExcelTab.tsx` |
| **OCR 截图导入** | 从截图提取基金数据 | `src/components/import/OcrTab.tsx` |
| **本地 OCR** | 使用 Tesseract.js 客户端 OCR | `src/components/import/OcrTab.tsx` |
| **导入预览** | 导入前预览和编辑 | `src/components/import/ImportPreview.tsx` |
| **JSON 导出** | 导出完整数据为 JSON | `src/components/data-import-export.tsx` |
| **CSV 导出** | 导出持仓为 CSV | `src/components/data-import-export.tsx` |

**支持的导入格式:**
- 支付宝
- 微信理财通
- 蚂蚁财富
- 自定义 CSV/Excel

---

## 🔄 基金对比与排行

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **基金对比** | 最多对比 5 只基金 | `src/app/compare/page.tsx` |
| **对比指标** | 净值、估值、涨跌幅、类型、公司、费率 | `src/app/compare/page.tsx` |
| **涨幅榜** | 当日涨幅排行 | `src/app/rankings/page.tsx` |
| **跌幅榜** | 当日跌幅排行 | `src/app/rankings/page.tsx` |
| **热门榜** | 最受欢迎基金排行 | `src/app/rankings/page.tsx` |

**外部 API:**
- `src/lib/eastmoney-ranking-api.ts` - 天天基金排行数据

---

## 🧮 投资规划工具

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **定投计算器** | 定期定额投资收益计算器 | `src/app/sip/page.tsx` |
| **月投金额输入** | 设置每月投入金额 | `src/app/sip/page.tsx` |
| **投资期限选择** | 1/3/5/10 年预设 | `src/app/sip/page.tsx` |
| **预期收益率** | 5%/8%/10%/15% 预设 | `src/app/sip/page.tsx` |
| **未来价值计算** | 复利计算 | `src/app/sip/page.tsx` |
| **总收益预估** | 预估时间段内收益 | `src/app/sip/page.tsx` |

---

## 🎨 UI/UX 功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **响应式侧边栏** | 可折叠导航，带工具提示 | `src/components/layout/Sidebar.tsx` |
| **移动端侧边栏** | 基于 Sheet 的移动端导航 | `src/components/layout/Sidebar.tsx` |
| **暗黑/亮色主题** | 主题切换，支持系统偏好 | `src/app/settings/page.tsx` |
| **Toast 通知** | 成功/错误/警告通知 | `src/components/ui/toast.tsx` |
| **加载状态** | 骨架屏和加载动画 | `src/components/loading.tsx` |
| **错误边界** | 优雅的错误处理 | `src/components/error-boundary.tsx` |
| **空状态** | 空数据状态插图 | `src/components/ui/EmptyState.tsx` |
| **确认对话框** | 操作确认弹窗 | `src/components/ui/ConfirmDialog.tsx` |
| **面包屑导航** | 页面层级指示器 | `src/components/breadcrumb.tsx` |
| **用户菜单** | 带登出的账户下拉菜单 | `src/components/user-menu.tsx` |

---

## 🗄️ 数据存储

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **IndexedDB (前端)** | 本地离线存储持仓/交易 | `src/lib/db.ts` |
| **基金缓存** | 带 TTL 的基金信息缓存 | `src/services/fund.ts` |
| **估值缓存** | 30 秒 TTL 的实时估值缓存 | `src/services/fund.ts` |
| **搜索缓存** | 5 分钟 TTL 的搜索结果缓存 | `src/services/fund.ts` |
| **PostgreSQL (后端)** | 持久化数据存储 | `lumira-backend/prisma/schema.prisma` |
| **Redis 缓存** | 后端缓存层 | `lumira-backend/src/config/redis.ts` |

---

## 🔒 安全功能

| 功能 | 描述 | 实现位置 |
|------|------|----------|
| **JWT 认证** | 安全 Token 认证 | `lumira-backend/src/middleware/auth.middleware.ts` |
| **密码哈希** | Bcrypt 加密 | `lumira-backend/src/services/auth.service.ts` |
| **速率限制** | API 请求限流 | `lumira-backend/src/middleware/rateLimit.middleware.ts` |
| **CORS 保护** | 跨域请求处理 | `lumira-backend/src/app.ts` |
| **Helmet 安全头** | 安全头中间件 | `lumira-backend/src/app.ts` |

---

## 📱 页面路由

| 路由 | 组件 | 描述 |
|------|------|------|
| `/` | `src/app/page.tsx` | 首页（资产总览） |
| `/login` | `src/app/login/page.tsx` | 用户登录 |
| `/register` | `src/app/register/page.tsx` | 用户注册 |
| `/holdings` | `src/app/holdings/page.tsx` | 持仓列表 |
| `/fund/[code]` | `src/app/fund/[code]/page.tsx` | 基金详情 |
| `/compare` | `src/app/compare/page.tsx` | 基金对比 |
| `/rankings` | `src/app/rankings/page.tsx` | 基金排行 |
| `/sip` | `src/app/sip/page.tsx` | 定投计算器 |
| `/import` | `src/app/import/page.tsx` | 数据导入 |
| `/settings` | `src/app/settings/page.tsx` | 应用设置 |

---

## 🔌 外部集成

| 服务 | 用途 | 实现位置 |
|------|------|----------|
| **天天基金 API** | 基金搜索、估值、净值历史 | `src/lib/eastmoney-api.ts` |
| **天天基金排行** | 每日基金排行 | `src/lib/eastmoney-ranking-api.ts` |
| **Tesseract.js** | 客户端 OCR | `src/components/import/OcrTab.tsx` |

---

## 🛠️ 技术栈

**前端:**
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS 3.4 + Radix UI
- TanStack Query (React Query) 状态管理
- Zustand 客户端状态
- Dexie.js IndexedDB 封装
- ECharts + Recharts 图表
- Tesseract.js OCR

**后端:**
- Express 4 + TypeScript
- Prisma ORM + PostgreSQL
- Redis 缓存
- JWT 认证
- Winston 日志

---

*本文档自动生成功能清单，供功能验收参考。*
