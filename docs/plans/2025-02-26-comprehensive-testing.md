# Comprehensive Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Achieve 85%+ test coverage for all financial calculations, backend services, frontend hooks, and API controllers in the Lumira fund investment application.

**Architecture:** Test suite organized in 4 phases following TDD principles - financial calculations (pure logic), backend services (database layer), frontend hooks (React Query), and integration tests (API layer).

**Tech Stack:** Jest + ts-jest + @testing-library/react + jest-mock-extended (Prisma) + MSW (API mocking) + supertest (HTTP testing)

---

## Executive Summary

### Current State (CRITICAL GAPS)
- **Frontend:** Only 1 test file (`src/lib/__tests__/utils.test.ts` - 348 lines, excellent quality)
- **Backend:** Only 1 test file (`lumira-backend/src/services/__tests__/fund.service.test.ts` - 151 lines)
- **Total Coverage:** ~5% of codebase

### Target Coverage
- Phase 1 (Week 1): Core Financial Calculations - 95% coverage
- Phase 2 (Week 2): Backend Services - 85% coverage  
- Phase 3 (Week 3): Frontend Hooks & Stores - 80% coverage
- Phase 4 (Week 4): Integration & Controllers - 75% coverage

---

## Testing Strategy

### Tools & Libraries

**Frontend:**
- Jest + ts-jest for TypeScript support
- @testing-library/react for component testing
- @testing-library/react-hooks for hook testing
- MSW (Mock Service Worker) for API mocking
- jest-environment-jsdom for DOM simulation

**Backend:**
- Jest + ts-jest
- jest-mock-extended for Prisma mocking
- supertest for HTTP endpoint testing

### Test Patterns
- **TDD Approach:** Write failing test -> Run -> Implement -> Run -> Commit
- **Pure Functions:** Test edge cases, boundary conditions, error scenarios
- **Services:** Mock external dependencies (Prisma, Redis, APIs)
- **Hooks:** Use React Query provider wrapper, mock API responses
- **Controllers:** Test HTTP status codes, request/response validation

---

## Phase 1: Core Financial Calculations (Week 1)

### Task 1.1: Setup MSW for Frontend Testing

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/test/server.ts`
- Create: `src/test/handlers.ts`
- Create: `src/test/utils.tsx`
- Modify: `jest.setup.ts`

**Implementation Steps:**

1. Install MSW: `npm install --save-dev msw@2.0.0`

2. Create `src/test/server.ts`
3. Create `src/test/handlers.ts` with mock API responses for holdings, transactions, auth
4. Create `src/test/utils.tsx` with React Query provider wrapper
5. Update `jest.setup.ts` to integrate MSW lifecycle

**Verification Command:**
```bash
npm test -- --testPathPattern="utils.test.ts" --verbose
```

---

### Task 1.2: XIRR Calculation Tests

**File:** Create `src/lib/__tests__/calculate.xirr.test.ts`

**Test Cases - Basic:**
- Input validation (less than 2 cashflows, empty array)
- Basic calculation (simple buy/sell, multiple purchases, partial redemption)

**Test Cases - Edge Cases (CRITICAL):**
- Division by zero in Newton-Raphson (derivative approaches zero)
- Non-convergence within 100 iterations
- Rate becomes Infinity or -1 during iteration
- All positive cashflows (mathematically undefined)
- All negative cashflows (mathematically undefined)
- Same-day transactions (days = 0, potential division issues)
- Very small amounts (< 0.01) - floating point precision
- Very large amounts (> 1 billion) - Math.pow() overflow

**Expected Coverage:** 98%+ of calculateXIRR function

---

### Task 1.3: Holding Profit Tests

**File:** Create `src/lib/__tests__/calculate.holding.test.ts`

**Test Cases:**
- calculateHoldingProfit with various share/cost/NAV combinations
- Zero shares handling
- Zero cost handling
- calculateRegularInvestReturn with different scenarios
- Decimal.js precision with fractional shares
- Cost basis calculation with average cost method

---

### Task 1.4: Risk Metrics Tests

**File:** Create `src/lib/__tests__/calculate.risk.test.ts`

**Test Cases:**
- calculateVolatility with various return arrays
- calculateSharpeRatio with different risk-free rates
- calculateMaxDrawdown with peak/valley scenarios
- Edge cases: single value, empty arrays, zero volatility

---

---

### Task 1.5: API Client Tests

**File:** Create `src/lib/__tests__/api-client.test.ts`

**Test Coverage:**
- Constructor initialization
- setTokens: Saves to localStorage and cookies
- loadTokens: Loads from localStorage
- clearTokens: Removes from localStorage and cookies
- isAuthenticated: Returns correct boolean
- Request interceptors: Adds Authorization header when authenticated
- Response interceptors: Handles 401, triggers token refresh
- Token refresh on 401: Automatic retry with new token
- Concurrent requests during refresh: Queue and retry all
- Network errors: Proper error handling and message

**Edge Cases:**
- Refresh token expired during request
- Cookie parsing edge cases
- localStorage not available (SSR)

---

### Task 1.6: IndexedDB Tests

**File:** Create `src/lib/__tests__/db.test.ts`

**Test Coverage:**
- Database initialization and versioning
- fundDb operations: get, put, bulkPut, search, getByType
- holdingDb operations: get, getByFund, add, update, delete
- transactionDb operations: getByHolding, add, update, delete
- settingsDb operations: get, set, delete
- Hooks: updatedAt auto-set, version increment on update
- Bulk operations: bulkPut with 100+ records
- Data export: exportAllData JSON serialization
- Data import: importAllData with validation
- Clear operations: clearAllData

**Edge Cases:**
- IndexedDB quota exceeded
- Database upgrade/migration
- Compound index queries
- Empty result handling

---

### Task 1.7: Frontend API Module Tests

**File:** Create `src/lib/__tests__/api.test.ts`

**Test Coverage:**
- authApi: login, register, refresh, logout, me
- holdingsApi: getAll, getById, create, update, delete
- transactionsApi: getAll, getByHoldingId, create, update, delete
- portfolioApi: getSummary, getAllocation, getTopHoldings, getBottomHoldings

**Mock Strategy:**
- Mock api-client methods
- Verify correct endpoints called
- Verify error handling


## Phase 2: Backend Services (Week 2)

### Task 2.1: Setup jest-mock-extended

**Command:**
```bash
cd lumira-backend && npm install --save-dev jest-mock-extended
```

**Files:**
- Create: `lumira-backend/src/test/setup.ts`
- Create: `lumira-backend/src/test/mocks/prisma.mock.ts`

---

### Task 2.2: Holding Service Tests

**File:** Create `lumira-backend/src/services/__tests__/holding.service.test.ts`

**Test Coverage:**
- getUserHoldings: Returns holdings with fund data, handles empty results
- getHoldingById: Returns single holding, returns null for not found
- createHolding: Creates new holding, throws if fund not found, throws if duplicate
- updateHolding: Updates fields, throws if not found
- deleteHolding: Deletes holding, throws if not found
- updateHoldingAfterTransaction: BUY updates shares/cost, SELL updates shares/cost

---

### Task 2.3: Transaction Service Tests

**File:** Create `lumira-backend/src/services/__tests__/transaction.service.test.ts`

**Test Coverage:**
- getHoldingTransactions: Returns transactions for holding
- getUserTransactions: Filters by fundId, type, date range, pagination
- createTransaction: Creates transaction, updates holding, uses prisma.$transaction
- updateTransaction: Updates fields, throws if not found
- deleteTransaction: Deletes transaction, reverses holding updates

---

### Task 2.4: Portfolio Service Tests

**File:** Create `lumira-backend/src/services/__tests__/portfolio.service.test.ts`

**Test Coverage:**
- getPortfolioSummary: Calculates totals, uses Redis cache, handles empty portfolio
- getAssetAllocation: Groups by type/risk/channel/group, calculates percentages
- getTopHoldings: Returns sorted by profit, respects limit
- getBottomHoldings: Returns sorted by profit ascending
- getProfitCalendar: Aggregates daily profits from transactions

---

### Task 2.5: Auth Service Tests

**File:** Create `lumira-backend/src/services/__tests__/auth.service.test.ts`

**Test Coverage:**
- register: Creates user, hashes password, throws if email exists
- login: Validates credentials, returns tokens, throws if invalid
- refreshToken: Validates refresh token, returns new access token
- logout: Invalidates refresh token

**Edge Cases:**
- Refresh token reuse detection (should invalidate all tokens)
- Concurrent token refresh (first succeeds, second fails)
- Token collision (same user multiple tokens)
- Clock skew in expiresAt calculation
- Timing attack prevention (constant-time comparison)
- Null password handling

---

### Task 2.6: Concurrent Transaction Tests (NEW)

**File:** Create `lumira-backend/src/services/__tests__/transaction.concurrent.test.ts`

**Test Coverage:**
- Concurrent BUY transactions for same holding
- Concurrent SELL transactions (race condition prevention)
- Interleaved BUY and SELL operations
- Transaction isolation with prisma.$transaction

**Method:**
- Use Promise.all() to simulate concurrency
- Verify final holding state is consistent
- Verify no negative shares

**Edge Cases:**
- SELL more shares than owned (validation must prevent)
- Transaction type change not allowed (BUY to SELL)
- Reverse transaction type logic for DIVIDEND

## Phase 3: Frontend Hooks & Stores (Week 3)

### Task 3.1: useHoldings Hook Tests

**File:** Create `src/hooks/__tests__/use-holdings.test.tsx`

**Test Coverage:**
- useHoldings: Fetches holdings, handles loading/error states
- useHolding: Fetches single holding, respects enabled option
- useCreateHolding: Creates holding, invalidates queries on success
- useUpdateHolding: Updates holding, invalidates relevant queries
- useDeleteHolding: Deletes holding, removes queries on success

---

### Task 3.2: useTransactions Hook Tests

**File:** Create `src/hooks/__tests__/use-transactions.test.tsx`

**Test Coverage:**
- useTransactions: Fetches with params, handles pagination
- useTransactionsByHolding: Fetches by holding ID
- useCreateTransaction: Creates transaction, invalidates queries
- useUpdateTransaction: Updates transaction
- useDeleteTransaction: Deletes transaction

---

### Task 3.3: useAuth Hook Tests

**File:** Create `src/hooks/__tests__/use-auth.test.tsx`

**Test Coverage:**
- useAuth: Fetches current user when token exists
- login: Authenticates, stores tokens, updates state
- register: Registers user, updates state
- logout: Clears tokens, resets queries
- Token persistence: Handles localStorage interactions

---

### Task 3.4: Portfolio Store Tests

**File:** Create `src/stores/__tests__/portfolio.store.test.ts`

**Test Coverage:**
- Initial state verification
- setLoading: Updates loading state
- setError: Updates error state
- setAnalysis: Updates analysis data
- clearAnalysis: Resets analysis
- Persistence: Verify only analysis is persisted
- Selectors: selectTotalAssets, selectTotalProfit, selectTodayProfit

---

---

### Task 3.5: usePortfolio Hook Tests (NEW)

**File:** Create `src/hooks/__tests__/use-portfolio.test.tsx`

**Test Coverage:**
- usePortfolioSummary: Fetches summary with caching
- usePortfolioAllocation: Groups data correctly
- useTopHoldings: Returns sorted by profit, respects limit
- useBottomHoldings: Returns sorted ascending

## Phase 4: Integration & Controllers (Week 4)

### Task 4.1: Holding Controller Tests

**File:** Create `lumira-backend/src/controllers/__tests__/holding.controller.test.ts`

**Test Coverage:**
- GET /api/holdings: Returns holdings, 200 status
- GET /api/holdings/:id: Returns holding, 404 if not found
- POST /api/holdings: Creates holding, 201 status, validates input
- PUT /api/holdings/:id: Updates holding, validates input
- DELETE /api/holdings/:id: Deletes holding, 200 status
- Error handling: Passes errors to next()

---

### Task 4.2: Transaction Controller Tests

**File:** Create `lumira-backend/src/controllers/__tests__/transaction.controller.test.ts`

**Test Coverage:**
- GET /api/transactions: Returns transactions with filters
- GET /api/transactions/holding/:holdingId: Returns by holding
- POST /api/transactions: Creates transaction, 201 status
- PUT /api/transactions/:id: Updates transaction
- DELETE /api/transactions/:id: Deletes transaction

---

### Task 4.3: Auth Controller Tests

**File:** Create `lumira-backend/src/controllers/__tests__/auth.controller.test.ts`

**Test Coverage:**
- POST /api/auth/register: Creates user, 201 status
- POST /api/auth/login: Authenticates, returns tokens
- POST /api/auth/refresh: Returns new access token
- POST /api/auth/logout: Logs out user
- GET /api/auth/me: Returns current user

---

### Task 4.4: Middleware Tests

**Files:**
- Create: `lumira-backend/src/middleware/__tests__/auth.middleware.test.ts`
- Create: `lumira-backend/src/middleware/__tests__/error.middleware.test.ts`

**Test Coverage:**
- Auth middleware: Validates JWT, sets req.user, 401 if invalid
- Error middleware: Formats errors, handles different error types

---

---

### Task 4.5: Fund Controller Tests (NEW)

**File:** Create `lumira-backend/src/controllers/__tests__/fund.controller.test.ts`

**Test Coverage:**
- GET /api/funds/search: Search with query params
- GET /api/funds/:id: Get fund with sync from external API
- GET /api/funds/:id/estimate: Get real-time estimate
- POST /api/funds/:id/sync: Sync fund data

**Edge Cases:**
- External API failure fallback
- Cache hit vs miss scenarios

## Task Dependency Graph

| Task ID | Task Name | Depends On | Reason |
|---------|-----------|------------|--------|
| 1.1 | Setup MSW | None | Infrastructure |
| 1.2 | XIRR Tests | None | Pure function |
| 1.3 | Holding Tests | None | Pure function |
| 1.4 | Risk Tests | None | Pure function |
| 1.5 | API Client Tests | None | Pure class |
| 1.6 | IndexedDB Tests | None | Self-contained |
| 1.7 | Frontend API Tests | 1.5 | Uses api-client |
| 2.1 | Setup jest-mock-extended | None | Infrastructure |
| 2.2 | Holding Service | 2.1 | Needs Prisma mock |
| 2.3 | Transaction Service | 2.1, 2.2 | Needs Prisma + holding service |
| 2.4 | Portfolio Service | 2.1 | Needs Prisma + Redis |
| 2.5 | Auth Service | 2.1 | Needs Prisma |
| 2.6 | Concurrent Tests | 2.2, 2.3 | Needs transaction service |
| 3.1 | useHoldings | 1.1 | Needs MSW |
| 3.2 | useTransactions | 1.1 | Needs MSW |
| 3.3 | useAuth | 1.1 | Needs MSW |
| 3.4 | Portfolio Store | None | Zustand only |
| 3.5 | usePortfolio | 1.1 | Needs MSW |
| 4.1 | Holding Controller | 2.2 | Needs service tests |
| 4.2 | Transaction Controller | 2.3 | Needs service tests |
| 4.3 | Auth Controller | 2.5 | Needs service tests |
| 4.4 | Middleware | 2.1 | Needs Prisma mock |
| 4.5 | Fund Controller | 2.4 | Needs portfolio service |

---

## Parallel Execution Waves

**Wave 1 (Can Start Immediately)**
- Task 1.1: Setup MSW
- Task 1.2: XIRR Tests
- Task 1.3: Holding Profit Tests
- Task 1.4: Risk Metrics Tests
- Task 1.5: API Client Tests
- Task 1.6: IndexedDB Tests
- Task 2.1: Setup jest-mock-extended
- Task 3.4: Portfolio Store Tests

**Wave 2 (After Wave 1)**
- Task 1.7: Frontend API Tests
- Task 2.2: Holding Service Tests
- Task 2.3: Transaction Service Tests
- Task 2.4: Portfolio Service Tests
- Task 2.5: Auth Service Tests

**Wave 3 (After Wave 2)**
- Task 2.6: Concurrent Transaction Tests
- Task 3.1: useHoldings Tests
- Task 3.2: useTransactions Tests
- Task 3.3: useAuth Tests
- Task 3.5: usePortfolio Tests

**Wave 4 (After Wave 3)**
- Task 4.1: Holding Controller Tests
- Task 4.2: Transaction Controller Tests
- Task 4.3: Auth Controller Tests
- Task 4.4: Middleware Tests
- Task 4.5: Fund Controller Tests
**Wave 3 (After Wave 2)**
- Task 3.1: useHoldings Tests
- Task 3.2: useTransactions Tests
- Task 3.3: useAuth Tests

**Wave 4 (After Wave 3)**
- Task 4.1: Holding Controller Tests
- Task 4.2: Transaction Controller Tests
- Task 4.3: Auth Controller Tests
- Task 4.4: Middleware Tests

---

## Running Tests

### Frontend Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- calculate.xirr.test.ts

# Watch mode
npm run test:watch
```

### Backend Tests
```bash
cd lumira-backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- holding.service.test.ts
```

---

## Dependencies to Install

### Frontend
```bash
npm install --save-dev msw@2.0.0 @testing-library/react-hooks
```

### Backend
```bash
cd lumira-backend && npm install --save-dev supertest @types/supertest jest-mock-extended
```

---

## Success Criteria

- [ ] All new test files created with >70% coverage
- [ ] No breaking changes to existing functionality
- [ ] All tests passing in CI/CD
- [ ] Coverage reports generated
- [ ] Documentation updated

---

## Next Steps

This plan can be implemented using `superpowers:executing-plans` skill:

1. Review and approve this plan
2. Use executing-plans skill to implement Wave 1 tasks in parallel
3. Verify coverage and progress
4. Continue with subsequent waves
