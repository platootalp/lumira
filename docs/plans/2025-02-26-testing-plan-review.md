# Test Plan Coverage Review

## Executive Summary

**Current Test Plan Coverage:** ~60% comprehensive
**Major Gaps Identified:** 3 critical, 5 high-priority, 8 medium-priority modules missing
**Critical Finding:** Several severe edge cases not covered that could cause financial calculation errors

---

## Coverage Analysis

### What's Well Covered in Current Plan

| Category | Modules | Coverage Level |
|----------|---------|----------------|
| Financial Calculations | calculateXIRR, calculateHoldingProfit, calculateVolatility, calculateSharpeRatio, calculateMaxDrawdown | Good - basic cases |
| Backend Services | holding.service, transaction.service, portfolio.service, auth.service | Good - CRUD operations |
| Frontend Hooks | useHoldings, useTransactions, useAuth | Good - basic functionality |
| Controllers | holding, transaction, auth controllers | Good - HTTP endpoints |
| Portfolio Store | portfolio.ts | Good - state management |

### Critical Gaps (Missing from Plan)

#### 1. **API Client Testing** (CRITICAL)
**File:** `src/lib/api-client.ts`
**Why Critical:** All API communication flows through this. Token refresh, 401 handling, request/response interceptors.

**Missing Test Cases:**
- Token refresh on 401 response
- Automatic retry with new token
- Request/response interceptors
- Error handling for network failures
- Cookie management (access_token)
- Concurrent request handling during token refresh

**Recommendation:** Add Task 1.5 to Phase 1

---

#### 2. **IndexedDB Layer Testing** (CRITICAL)
**File:** `src/lib/db.ts`
**Why Critical:** Offline-first data layer. Data loss here = lost user holdings.

**Missing Test Cases:**
- CRUD operations for all tables (funds, holdings, transactions, settings)
- Database versioning and migrations
- Hook behaviors (updatedAt, version increment)
- Bulk operations (bulkPut)
- Data export/import with JSON serialization
- Query operations with compound indexes
- Error handling for quota exceeded

**Recommendation:** Add Task 1.6 to Phase 1

---

#### 3. **Frontend API Modules** (CRITICAL)
**File:** `src/lib/api.ts`
**Why Critical:** Domain-specific API calls. Testing ensures correct endpoint usage.

**Missing Modules:**
- `authApi` - login, register, refresh, logout, me
- `holdingsApi` - getAll, getById, create, update, delete
- `transactionsApi` - getAll, getByHoldingId, create, update, delete
- `portfolioApi` - summary, allocation, topHoldings, bottomHoldings

**Recommendation:** Add Task 1.7 to Phase 1

---

#### 4. **usePortfolio Hook** (HIGH)
**File:** `src/hooks/use-portfolio.ts`
**Why High:** Missing from Phase 3. Critical for portfolio analytics.

**Missing Test Cases:**
- usePortfolioSummary with caching
- usePortfolioAllocation with grouping
- useTopHoldings/useBottomHoldings with limits

**Recommendation:** Add to Task 3.1 or create Task 3.5

---

#### 5. **Fund Controller** (HIGH)
**File:** `lumira-backend/src/controllers/fund.controller.ts`
**Why High:** Missing from Phase 4. Handles fund search and data sync.

**Missing Test Cases:**
- GET /api/funds/search with query params
- GET /api/funds/:id with sync from external API
- GET /api/funds/:id/estimate
- POST /api/funds/:id/sync

**Recommendation:** Add Task 4.5 to Phase 4

---

#### 6. **Frontend Services** (MEDIUM)
**File:** `src/services/fund.ts`
**Why Medium:** Business logic with caching. calculateEstimateProfit is used in UI.

**Missing Test Cases:**
- searchFunds with local + API fallback
- getFundEstimate with cache TTL
- getBatchEstimates optimization
- calculateEstimateProfit with various scenarios

**Recommendation:** Add new task to Phase 3 or Phase 4

---

#### 7. **External API Integration** (MEDIUM)
**Files:** `src/lib/eastmoney-api.ts`, `src/lib/eastmoney-ranking-api.ts`
**Why Medium:** External dependencies with parsing logic.

**Missing Test Cases:**
- searchFundsFromEastMoney response parsing
- getFundEstimateFromEastMoney with malformed data
- batchGetEstimates with partial failures
- getDailyRising/Decline/HotRankings

**Recommendation:** Add integration test tasks

---

#### 8. **Backend Utilities** (MEDIUM)
**Files:** `lumira-backend/src/utils/validators.ts`, `lumira-backend/src/utils/logger.ts`
**Why Medium:** Input validation schemas need testing for security.

**Missing Test Cases:**
- All Zod schema validations (register, login, holding, transaction)
- Schema error message formatting
- Logger configuration and transports

**Recommendation:** Add to Phase 4 or separate utility testing phase

---

## Edge Cases Not Covered in Current Plan

Based on analysis of actual code, these critical edge cases are missing:

### XIRR Calculation (src/lib/calculate.ts)

| Edge Case | Current Plan | Risk Level |
|-----------|--------------|------------|
| Division by zero in Newton-Raphson | Not mentioned | **CRITICAL** |
| Non-convergence within 100 iterations | Partial (error case) | **HIGH** |
| Rate becomes Infinity during iteration | Not mentioned | **HIGH** |
| All positive cashflows (no outflows) | Not mentioned | **HIGH** |
| All negative cashflows (no inflows) | Not mentioned | **HIGH** |
| Same-day transactions (days = 0) | Not mentioned | **HIGH** |
| Very small amounts (< 0.01) | Not mentioned | MEDIUM |
| Very large amounts (> 1 billion) | Not mentioned | MEDIUM |

### Transaction Service (lumira-backend/src/services/transaction.service.ts)

| Edge Case | Current Plan | Risk Level |
|-----------|--------------|------------|
| SELL more shares than owned | Not mentioned | **CRITICAL** |
| Concurrent BUY transactions (race condition) | Not mentioned | **HIGH** |
| Concurrent SELL transactions | Not mentioned | **HIGH** |
| Transaction delete with DIVIDEND type | Not mentioned | **HIGH** |
| Reverse transaction cost basis calculation | Not mentioned | HIGH |

### Authentication (lumira-backend/src/services/auth.service.ts)

| Edge Case | Current Plan | Risk Level |
|-----------|--------------|------------|
| Refresh token reuse detection | Not mentioned | **CRITICAL** |
| Concurrent token refresh | Not mentioned | **HIGH** |
| Token generation collision | Not mentioned | MEDIUM |
| Timing attack on user enumeration | Not mentioned | MEDIUM |

### External API (eastmoney.service.ts)

| Edge Case | Current Plan | Risk Level |
|-----------|--------------|------------|
| HTML format change breaking regex | Not mentioned | **HIGH** |
| API rate limiting (429) | Not mentioned | **HIGH** |
| Partial/malformed JSON response | Not mentioned | **HIGH** |
| Empty fund list caching | Not mentioned | MEDIUM |
| Network timeout handling | Not mentioned | MEDIUM |

---

## Updated Test Plan Recommendations

### Phase 1 Additions (Week 1)

**New Task 1.5: API Client Tests**
- File: `src/lib/__tests__/api-client.test.ts`
- Coverage: Token management, 401 handling, request/response interceptors
- Edge Cases: Concurrent refresh, cookie management

**New Task 1.6: IndexedDB Tests**
- File: `src/lib/__tests__/db.test.ts`
- Coverage: All CRUD operations, hooks, bulk operations, export/import
- Edge Cases: Quota exceeded, version migrations

**New Task 1.7: Frontend API Module Tests**
- File: `src/lib/__tests__/api.test.ts`
- Coverage: authApi, holdingsApi, transactionsApi, portfolioApi
- Mock: MSW or jest.mock

### Phase 3 Addition (Week 3)

**New Task 3.5: usePortfolio Hook Tests**
- File: `src/hooks/__tests__/use-portfolio.test.tsx`
- Coverage: usePortfolioSummary, usePortfolioAllocation, useTopHoldings, useBottomHoldings
- Mock: MSW for API responses

### Phase 4 Additions (Week 4)

**New Task 4.5: Fund Controller Tests**
- File: `lumira-backend/src/controllers/__tests__/fund.controller.test.ts`
- Coverage: search, getById, getEstimate, sync endpoints

**New Task 4.6: Utility Tests**
- Files: 
  - `lumira-backend/src/utils/__tests__/validators.test.ts`
  - `lumira-backend/src/utils/__tests__/logger.test.ts`
- Coverage: All Zod schemas, validation error formatting

### Additional Phase: Integration Tests (Week 5)

**New Phase 5: External API & Integration**
- Task 5.1: EastMoney API integration tests with mocked responses
- Task 5.2: Frontend service tests (fund.ts) with caching logic
- Task 5.3: End-to-end transaction flow (BUY -> check holding -> SELL)
- Task 5.4: Authentication flow (register -> login -> refresh -> logout)

---

## Test Data Requirements

The plan should specify test data fixtures:

### Financial Calculation Fixtures
```typescript
// XIRR test cases
const xirrTestCases = [
  { cashflows: [...], expected: 15.23 }, // Normal case
  { cashflows: [...], expected: null, error: 'non-converging' }, // Edge case
  { cashflows: [...], expected: null, error: 'single-cashflow' }, // Error case
];
```

### Transaction Fixtures
```typescript
const transactionFixtures = {
  validBuy: { type: 'BUY', shares: 100, price: 1.5 },
  validSell: { type: 'SELL', shares: 50, price: 1.6 },
  invalidSell: { type: 'SELL', shares: 200, price: 1.6 }, // Exceeds holdings
};
```

---

## Priority Recommendations

### Immediate Action Required (Before Implementation)
1. **Add edge case specifications** to Tasks 1.2, 1.3, 1.4 (XIRR, holding, risk)
2. **Add Task 1.5** (API client) - Critical for all API interactions
3. **Add Task 1.6** (IndexedDB) - Critical for data integrity
4. **Specify concurrent transaction testing** in Task 2.3

### High Priority (Phase 1-2)
5. Add validation test for "sell more than owned" in Task 2.2
6. Add refresh token reuse detection to Task 2.5
7. Add Task 1.7 (Frontend API modules)

### Medium Priority (Phase 3-4)
8. Add Task 3.5 (usePortfolio hook)
9. Add Task 4.5 (Fund controller)
10. Add external API error handling tests

---

## Coverage Targets Review

### Current Plan Targets
- Phase 1: 95% coverage
- Phase 2: 85% coverage  
- Phase 3: 80% coverage
- Phase 4: 75% coverage

### Recommended Adjustments
- **calculate.ts**: Target 98%+ (financial calculations must be bulletproof)
- **api-client.ts**: Target 95%+ (security-critical)
- **db.ts**: Target 90%+ (data integrity)
- **transaction.service.ts**: Target 90%+ (financial transactions)
- **auth.service.ts**: Target 95%+ (security)

---

## Conclusion

The current test plan is **solid but incomplete**. It covers the main functionality well but misses:

1. **3 Critical modules** (API client, IndexedDB, Frontend APIs)
2. **Multiple severe edge cases** (XIRR convergence, transaction validation, auth security)
3. **Integration testing** between services
4. **Concurrency testing** for race conditions

**Recommendation:** Update the plan with the additions outlined above before beginning implementation. The identified gaps could lead to production bugs, particularly around financial calculations and data consistency.
