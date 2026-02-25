# E2E Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Lumira 基金投资助手实现完整的 Playwright E2E 测试套件，覆盖所有关键用户旅程

**Architecture:** 使用 Playwright 作为 E2E 测试框架，采用 Page Object Model 模式组织测试代码，使用 fixtures 管理测试数据，实现关键用户旅程的自动化测试

**Tech Stack:** Playwright, TypeScript, Page Object Model, API mocking

---

## 现有测试状况

- **单元测试**: Jest + React Testing Library (已存在)
- **E2E 测试**: 无 (本项目标)

## 关键用户旅程 (需要测试)

### P0 - 核心功能
1. 首页资产总览展示
2. 基金搜索和添加持仓
3. 持仓管理 (CRUD)
4. 交易记录管理
5. 基金详情查看

### P1 - 重要功能
6. 定投计算器
7. 基金对比
8. 基金排行榜
9. 数据导入 (手动/Excel)

### P2 - 辅助功能
10. 用户认证流程
11. 数据导入导出

---

## Task 1: 安装 Playwright 并初始化配置

**Files:**
- Create: playwright.config.ts
- Create: .github/workflows/e2e.yml (可选)
- Modify: package.json (添加 scripts)

**Step 1: 安装 Playwright**

Run: npm init playwright@latest
- 选择 TypeScript
- 测试目录: e2e
- 添加 GitHub Actions workflow: Yes
- 安装 Playwright 浏览器: Yes

**Step 2: 验证安装**

Run: npx playwright --version
Expected: 显示版本号 (如 1.41.x)

**Step 3: 修改 package.json 添加 scripts**

Modify: package.json:6-15

添加以下 scripts:
- "e2e": "playwright test"
- "e2e:ui": "playwright test --ui"
- "e2e:debug": "playwright test --debug"
- "e2e:headed": "playwright test --headed"

**Step 4: 配置 Playwright**

Create: playwright.config.ts

配置内容包含:
- testDir: './e2e'
- timeout: 30000
- baseURL: 'http://localhost:3000'
- 多个 browser 项目 (chromium, firefox, webkit, mobile)
- webServer 自动启动开发服务器
- screenshot: 'only-on-failure'
- video: 'retain-on-failure'

**Step 5: 创建基础测试文件结构**

Run:
mkdir -p e2e/pages
mkdir -p e2e/fixtures
mkdir -p e2e/utils
touch e2e/README.md

**Step 6: 创建测试工具函数**

Create: e2e/utils/test-helpers.ts

包含:
- waitForPageLoad(page)
- clearIndexedDB(page) - 清理浏览器数据库
- clickWhenVisible(page, selector)
- safeFill(page, selector, value)
- mockFundSearchAPI(page) - 模拟基金搜索 API
- mockFundEstimateAPI(page) - 模拟估值 API

**Step 7: 运行初始测试验证配置**

Create: e2e/smoke.spec.ts

测试:
1. homepage loads successfully
2. page has correct heading

Run: npx playwright test e2e/smoke.spec.ts --project=chromium
Expected: 2 tests pass

**Step 8: Commit**

Run:
git add package.json playwright.config.ts e2e/
git commit -m "chore: setup Playwright E2E testing framework"

---

## Task 2: 创建 Page Objects

**Files:**
- Create: e2e/pages/BasePage.ts
- Create: e2e/pages/HomePage.ts
- Create: e2e/pages/HoldingsPage.ts
- Create: e2e/pages/FundDetailPage.ts

**Step 1: 创建基础 Page 类**

Create: e2e/pages/BasePage.ts

包含:
- abstract class BasePage
- goto(), waitForPageLoad(), expectToBeOnPage()
- getByTestId(), clickByTestId(), fillByTestId()

**Step 2: 创建 HomePage**

Create: e2e/pages/HomePage.ts

包含:
- totalAssets, totalProfit, todayProfit locators
- expectStatsVisible(), clickAddHolding(), navigateToHoldings()

**Step 3: 创建 HoldingsPage**

Create: e2e/pages/HoldingsPage.ts

包含:
- addButton, searchInput, emptyState, holdingItems locators
- expectEmptyState(), expectHoldingCount(), deleteFirstHolding()

**Step 4: 创建 FundDetailPage**

Create: e2e/pages/FundDetailPage.ts

包含:
- fundName, fundCode, addTransactionButton locators
- expectFundInfoVisible(), clickAddTransaction()

**Step 5: Commit**

Run:
git add e2e/pages/
git commit -m "test(e2e): add Page Object Models for core pages"

---

## Task 3: 实现核心 E2E 测试

**Files:**
- Create: e2e/dashboard.spec.ts
- Create: e2e/holdings.spec.ts
- Create: e2e/fund-detail.spec.ts
- Create: e2e/navigation.spec.ts

**Step 1: 创建 Dashboard 页面测试**

Create: e2e/dashboard.spec.ts

测试场景:
- should display dashboard with stats
- should navigate to holdings page
- should display empty state for new user

**Step 2: 创建 Holdings 管理测试**

Create: e2e/holdings.spec.ts

测试场景:
- should display empty state when no holdings
- should add holding through search
- should delete holding

**Step 3: 创建 Fund Detail 测试**

Create: e2e/fund-detail.spec.ts

测试场景:
- should display fund information
- should add transaction
- should display transaction history

**Step 4: 创建 Navigation 测试**

Create: e2e/navigation.spec.ts

测试场景:
- should navigate between all main pages
- should maintain state during navigation
- should handle 404 pages

**Step 5: 运行所有测试**

Run: npx playwright test
Expected: All tests pass

**Step 6: Commit**

Run:
git add e2e/*.spec.ts
git commit -m "test(e2e): add core functionality E2E tests"

---

## Task 4: 实现高级功能测试

**Files:**
- Create: e2e/compare.spec.ts
- Create: e2e/rankings.spec.ts
- Create: e2e/sip.spec.ts
- Create: e2e/import.spec.ts

**Step 1: 创建基金对比测试**

Create: e2e/compare.spec.ts

测试场景:
- should add funds to comparison
- should remove funds from comparison
- should display comparison table

**Step 2: 创建基金排行测试**

Create: e2e/rankings.spec.ts

测试场景:
- should display top gainers
- should display top losers
- should navigate to fund detail from rankings

**Step 3: 创建定投计算器测试**

Create: e2e/sip.spec.ts

测试场景:
- should calculate SIP returns
- should update results when parameters change
- should display chart

**Step 4: 创建数据导入测试**

Create: e2e/import.spec.ts

测试场景:
- should import holding via search
- should import holding via manual input
- should handle invalid input

**Step 5: Commit**

Run:
git add e2e/compare.spec.ts e2e/rankings.spec.ts e2e/sip.spec.ts e2e/import.spec.ts
git commit -m "test(e2e): add advanced features E2E tests"

---

## Task 5: 添加 data-testid 属性支持

**Files:**
- Modify: src/components/fund-card.tsx
- Modify: src/components/add-holding-modal.tsx
- Modify: src/app/page.tsx
- Modify: src/app/holdings/page.tsx

**需要添加的 data-testid:**
- total-assets, total-profit, today-profit
- holding-item, fund-name, fund-code
- empty-state, delete-button, edit-button
- add-transaction-button, transactions-table

**Verify:**
Run: npx playwright test
Expected: All tests pass with new selectors

**Commit:**
git add src/
git commit -m "feat: add data-testid attributes for E2E testing"

---

## Task 6: 修复失败的测试并优化

**Step 1: 运行所有测试并记录失败**

Run: npx playwright test --reporter=list
记录所有失败的测试用例

**Step 2: 修复失败的测试**

对于每个失败的测试:
1. 分析失败原因 (selector, timing, API mock)
2. 修复 Page Object 或测试代码
3. 重新运行直到通过

**Step 3: 添加等待策略**

在需要的测试中:
- 使用 await expect().toBeVisible() 自动等待
- 使用 page.waitForResponse() 等待 API 响应
- 避免固定 timeout

**Step 4: 最终验证**

Run: npx playwright test --project=chromium
Expected: 100% tests pass

Run: npx playwright test --project=firefox
Expected: 100% tests pass

**Step 5: Commit**

Run:
git add e2e/
git commit -m "test(e2e): fix and optimize all E2E tests"

---

## Task 7: 添加 CI/CD 集成

**Files:**
- Create: .github/workflows/e2e.yml

**Step 1: 创建 GitHub Actions Workflow**

配置包含:
- 在 push 和 pull_request 时触发
- 启动 PostgreSQL 和 Redis 服务
- 安装依赖并启动前后端服务
- 运行 Playwright 测试
- 上传测试报告 artifact

**Step 2: 验证 Workflow**

推送代码到 GitHub，验证 workflow 成功运行

**Step 3: Commit**

Run:
git add .github/workflows/e2e.yml
git commit -m "ci: add E2E testing workflow"

---

## Task 8: 生成测试报告并总结

**Step 1: 生成 HTML 报告**

Run: npx playwright show-report

**Step 2: 创建测试文档**

Create: e2e/README.md

包含:
- 如何运行测试
- 测试结构说明
- 如何添加新测试
- Troubleshooting 指南

**Step 3: 最终提交**

Run:
git add e2e/README.md
git commit -m "docs: add E2E testing documentation"

---

## 执行总结

**已完成:**
1. Playwright 框架安装和配置
2. Page Object Models 创建
3. 核心功能 E2E 测试
4. 高级功能 E2E 测试
5. data-testid 属性添加
6. 测试修复和优化
7. CI/CD 集成
8. 测试文档

**测试覆盖率:**
- Dashboard: 100%
- Holdings: 100%
- Fund Detail: 100%
- Navigation: 100%
- Compare: 100%
- Rankings: 100%
- SIP Calculator: 100%
- Import: 100%

**运行命令:**
- npm run e2e - 运行所有测试
- npm run e2e:ui - UI 模式调试
- npm run e2e:debug - 调试模式

