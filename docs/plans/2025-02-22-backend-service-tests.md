# Backend Service Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive unit and integration tests for all backend services to ensure data integrity, business logic correctness, and API reliability.

**Architecture:** Use Jest for testing framework with in-memory SQLite for unit tests and testcontainers for integration tests. Mock external APIs (Eastmoney) and Redis cache. Test each service layer independently with mocked dependencies.

**Tech Stack:** Jest, ts-jest, @prisma/client (mocked), jest-mock-extended, testcontainers (optional for integration), SQLite in-memory

---

## Prerequisites

Before starting:
1. Backend dependencies installed: `cd fund-manager-backend && npm install`
2. Jest configured in `package.json`

---

## Task 1: Setup Test Infrastructure

**Files:**
- Create: `fund-manager-backend/jest.config.js`
- Create: `fund-manager-backend/tests/setup.ts`
- Create: `fund-manager-backend/tests/utils/test-db.ts`
- Modify: `fund-manager-backend/package.json`

**Step 1: Install test dependencies**

Run:
```bash
cd fund-manager-backend
npm install --save-dev jest ts-jest @types/jest jest-mock-extended
```

**Step 2: Create Jest configuration**

Create `fund-manager-backend/jest.config.js` with TypeScript support and test environment setup.

**Step 3: Create test database utility**

Create `fund-manager-backend/tests/utils/test-db.ts` with Prisma client setup for testing using SQLite in-memory or test database.

**Step 4: Create test setup file**

Create `fund-manager-backend/tests/setup.ts` to initialize test environment, clear database between tests.

**Step 5: Add test script to package.json**

Modify `fund-manager-backend/package.json` to add test scripts.

**Step 6: Verify setup**

Run: `npm test -- --listTests`
Expected: Jest runs without errors, lists test files

**Step 7: Commit**

```bash
git add fund-manager-backend/jest.config.js fund-manager-backend/tests/ fund-manager-backend/package.json
git commit -m "test: setup Jest testing infrastructure"
```

---

## Task 2: Test AuthService

**Files:**
- Create: `fund-manager-backend/tests/services/auth.service.test.ts`

**Step 1: Write tests for register method**

Test cases:
- Valid registration creates user with hashed password
- Duplicate email throws error
- Settings are auto-created for new user
- Password is not returned in response

**Step 2: Write tests for login method**

Test cases:
- Valid login returns user and tokens
- Invalid email throws error
- Invalid password throws error
- Refresh token is stored in database

**Step 3: Write tests for token methods**

Test cases:
- generateTokens creates valid JWT tokens
- refreshToken validates and rotates tokens
- Invalid refresh token throws error
- Expired refresh token throws error
- logout deletes refresh token
- logoutAll deletes all user tokens

**Step 4: Run tests**

Run: `npm test -- auth.service.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add fund-manager-backend/tests/services/auth.service.test.ts
git commit -m "test: add AuthService unit tests"
```

---

## Task 3: Test HoldingService

**Files:**
- Create: `fund-manager-backend/tests/services/holding.service.test.ts`

**Step 1: Write tests for getUserHoldings**

Test cases:
- Returns holdings with fund data for user
- Decimal values are properly converted to numbers
- Returns empty array when user has no holdings
- Does not return other users' holdings

**Step 2: Write tests for getHoldingById**

Test cases:
- Returns holding with fund data when found
- Returns null when holding not found
- Returns null when holding belongs to different user

**Step 3: Write tests for createHolding**

Test cases:
- Creates holding with valid data
- Throws error when fund not found
- Throws error when duplicate holding exists
- Populates fund data after creation
- Sets initial version to 1

**Step 4: Write tests for updateHolding**

Test cases:
- Updates holding with valid data
- Increments version on update
- Throws error when holding not found
- Does not update other users' holdings

**Step 5: Write tests for deleteHolding**

Test cases:
- Deletes holding when found
- Throws error when holding not found
- Does not delete other users' holdings

**Step 6: Write tests for updateHoldingAfterTransaction**

Test cases:
- BUY transaction increases shares and cost
- BUY transaction updates avgCost correctly
- SELL transaction decreases shares and cost
- SELL all shares sets avgCost to 0
- Throws error when holding not found
- Increments version after update

**Step 7: Run tests**

Run: `npm test -- holding.service.test.ts`
Expected: All tests pass

**Step 8: Commit**

```bash
git add fund-manager-backend/tests/services/holding.service.test.ts
git commit -m "test: add HoldingService unit tests"
```

---

## Task 4: Test TransactionService

**Files:**
- Create: `fund-manager-backend/tests/services/transaction.service.test.ts`

**Step 1: Setup mocks**

Mock HoldingService for transaction tests.

**Step 2: Write tests for getHoldingTransactions**

Test cases:
- Returns transactions ordered by date desc
- Returns empty array when no transactions
- Converts Decimal to number

**Step 3: Write tests for getUserTransactions**

Test cases:
- Returns all transactions for user
- Filters by fundId when provided
- Filters by type when provided
- Filters by date range when provided
- Supports pagination with limit/offset
- Returns total count

**Step 4: Write tests for createTransaction**

Test cases:
- Creates BUY transaction successfully
- Creates SELL transaction successfully
- Updates holding after transaction creation
- Uses database transaction for atomicity
- Throws error when holding not found
- Throws error when insufficient shares for SELL

**Step 5: Write tests for updateTransaction**

Test cases:
- Updates transaction fields
- Throws error when transaction not found
- Does not update other users' transactions

**Step 6: Write tests for deleteTransaction**

Test cases:
- Deletes transaction successfully
- Reverses holding update (BUY becomes SELL, SELL becomes BUY)
- Uses database transaction for atomicity
- Throws error when transaction not found

**Step 7: Run tests**

Run: `npm test -- transaction.service.test.ts`
Expected: All tests pass

**Step 8: Commit**

```bash
git add fund-manager-backend/tests/services/transaction.service.test.ts
git commit -m "test: add TransactionService unit tests"
```

---

## Task 5: Test PortfolioService

**Files:**
- Create: `fund-manager-backend/tests/services/portfolio.service.test.ts`

**Step 1: Setup mocks**

Mock Redis cache and EastmoneyService.

**Step 2: Write tests for getPortfolioSummary**

Test cases:
- Returns cached data when cache hit
- Calculates fresh data when cache miss
- Calculates total assets correctly
- Calculates total cost correctly
- Calculates total profit and profitRate correctly
- Calculates todayProfit from estimates
- Handles empty holdings
- Stores result in cache
- Cache expires after TTL

**Step 3: Write tests for getAssetAllocation**

Test cases:
- Aggregates by type correctly
- Aggregates by risk correctly
- Aggregates by channel correctly
- Aggregates by group correctly
- Calculates percentages correctly
- Handles empty holdings

**Step 4: Write tests for getTopHoldings**

Test cases:
- Returns holdings sorted by profit desc
- Respects limit parameter
- Calculates contribution correctly
- Calculates percentage of total assets
- Handles empty holdings

**Step 5: Write tests for getBottomHoldings**

Test cases:
- Returns holdings sorted by profit asc
- Respects limit parameter
- Same calculations as top holdings

**Step 6: Write tests for getProfitCalendar**

Test cases:
- Filters by year and month
- Calculates SELL profit correctly (amount - fee)
- Aggregates by date
- Returns empty array when no transactions

**Step 7: Run tests**

Run: `npm test -- portfolio.service.test.ts`
Expected: All tests pass

**Step 8: Commit**

```bash
git add fund-manager-backend/tests/services/portfolio.service.test.ts
git commit -m "test: add PortfolioService unit tests"
```

---

## Task 6: Test FundService

**Files:**
- Create: `fund-manager-backend/tests/services/fund.service.test.ts`

**Step 1: Setup mocks**

Mock EastmoneyService and Redis cache.

**Step 2: Write tests for searchFunds**

Test cases:
- Delegates to EastmoneyService
- Returns search results

**Step 3: Write tests for getFund**

Test cases:
- Returns fund from database when found
- Triggers sync when not found
- Returns null if sync fails
- Includes NAV history

**Step 4: Write tests for getFundEstimate**

Test cases:
- Delegates to EastmoneyService
- Returns estimate data

**Step 5: Write tests for getFundNavHistory**

Test cases:
- Returns cached data when cache hit
- Fetches from API when cache miss
- Stores result in cache
- Returns empty array on error

**Step 6: Write tests for syncFundFromEastmoney**

Test cases:
- Successfully syncs fund data
- Upserts fund record
- Maps fund type correctly
- Maps risk level correctly
- Stores NAV history
- Returns null when API returns null

**Step 7: Write tests for syncNavHistory**

Test cases:
- Upserts NAV history records
- Respects days limit
- Handles empty history

**Step 8: Run tests**

Run: `npm test -- fund.service.test.ts`
Expected: All tests pass

**Step 9: Commit**

```bash
git add fund-manager-backend/tests/services/fund.service.test.ts
git commit -m "test: add FundService unit tests"
```

---

## Task 7: Test EastmoneyService

**Files:**
- Create: `fund-manager-backend/tests/services/external/eastmoney.service.test.ts`

**Step 1: Setup mocks**

Mock fetch/axios and Redis cache.

**Step 2: Write tests for searchFunds**

Test cases:
- Returns cached data when cache hit
- Calls API when cache miss
- Parses response correctly
- Handles API errors gracefully
- Returns empty array on error
- Stores result in cache

**Step 3: Write tests for getFundEstimate**

Test cases:
- Returns cached data when cache hit
- Calls API when cache miss
- Parses estimate response correctly
- Returns null on API error
- Stores result in cache

**Step 4: Write tests for getFundDetail**

Test cases:
- Returns cached data when cache hit
- Calls API when cache miss
- Parses detail response correctly
- Converts fee rate (/100)
- Returns null on API error
- Stores result in cache

**Step 5: Write tests for getFundNavHistory**

Test cases:
- Returns cached data when cache hit
- Calls API when cache miss
- Parses history response correctly
- Returns empty array on error
- Stores result in cache

**Step 6: Run tests**

Run: `npm test -- eastmoney.service.test.ts`
Expected: All tests pass

**Step 7: Commit**

```bash
git add fund-manager-backend/tests/services/external/eastmoney.service.test.ts
git commit -m "test: add EastmoneyService unit tests"
```

---

## Task 8: Add Integration Tests

**Files:**
- Create: `fund-manager-backend/tests/integration/holding-transaction.test.ts`
- Create: `fund-manager-backend/tests/integration/portfolio.test.ts`

**Step 1: Create integration test setup**

Create test utilities for integration tests with real database.

**Step 2: Write holding-transaction integration tests**

Test cases:
- Create holding → create transaction → verify holding updated
- Create transaction → delete transaction → verify holding reversed
- Multiple BUY transactions → correct avgCost calculation
- SELL partial shares → correct remaining shares and cost
- SELL all shares → avgCost becomes 0

**Step 3: Write portfolio integration tests**

Test cases:
- Create holdings → get portfolio summary → verify calculations
- Create transactions → get profit calendar → verify profits
- Multiple holdings → get asset allocation → verify percentages

**Step 4: Run integration tests**

Run: `npm test -- integration/`
Expected: All tests pass

**Step 5: Commit**

```bash
git add fund-manager-backend/tests/integration/
git commit -m "test: add integration tests for core workflows"
```

---

## Task 9: Add Test Coverage Reporting

**Files:**
- Modify: `fund-manager-backend/jest.config.js`
- Modify: `fund-manager-backend/package.json`

**Step 1: Configure coverage**

Update Jest config to collect coverage from service files.

**Step 2: Add coverage script**

Add `test:coverage` script to package.json.

**Step 3: Run coverage report**

Run: `npm run test:coverage`
Expected: Coverage report generated, target >80% for services

**Step 4: Commit**

```bash
git add fund-manager-backend/jest.config.js fund-manager-backend/package.json
git commit -m "test: add coverage reporting configuration"
```

---

## Task 10: Run Full Test Suite

**Files:**
- All test files

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Verify coverage**

Run: `npm run test:coverage`
Expected: Coverage >80% for all services

**Step 3: Fix any remaining issues**

Address any failing tests or coverage gaps.

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: complete backend service test suite"
```

---

## Summary

After completing all tasks:
- All 6 services have comprehensive unit tests
- Integration tests verify core workflows
- Test coverage >80% for service layer
- External APIs are properly mocked
- Database transactions are tested
- Cache behavior is verified

**Files Created:**
- `fund-manager-backend/jest.config.js`
- `fund-manager-backend/tests/setup.ts`
- `fund-manager-backend/tests/utils/test-db.ts`
- `fund-manager-backend/tests/services/auth.service.test.ts`
- `fund-manager-backend/tests/services/holding.service.test.ts`
- `fund-manager-backend/tests/services/transaction.service.test.ts`
- `fund-manager-backend/tests/services/portfolio.service.test.ts`
- `fund-manager-backend/tests/services/fund.service.test.ts`
- `fund-manager-backend/tests/services/external/eastmoney.service.test.ts`
- `fund-manager-backend/tests/integration/holding-transaction.test.ts`
- `fund-manager-backend/tests/integration/portfolio.test.ts`

**Test Count:**
- AuthService: ~15 tests
- HoldingService: ~20 tests
- TransactionService: ~18 tests
- PortfolioService: ~22 tests
- FundService: ~16 tests
- EastmoneyService: ~16 tests
- Integration: ~10 tests
- **Total: ~117 tests**
