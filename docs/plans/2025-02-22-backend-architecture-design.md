# Fund Manager Backend Architecture Design & Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Design and implement a complete Node.js + Express + PostgreSQL backend to replace the current IndexedDB-based frontend-only architecture, enabling persistent data storage, multi-device synchronization, and user authentication.

**Architecture:** Three-layer architecture with Controllers → Services → Repositories (Prisma). RESTful API design with JWT authentication, Redis caching for external API data, and comprehensive error handling. Financial calculations use Decimal.js for precision.

**Tech Stack:** Node.js 20, Express 4, TypeScript 5, Prisma ORM, PostgreSQL 15, Redis 7, JWT, bcrypt, Decimal.js, Winston

---

## Overview

### Current State
- Pure frontend architecture using IndexedDB (Dexie.js)
- Data lost when browser cache cleared
- No multi-device sync capability
- External API calls from frontend (CORS issues, rate limiting)

### Target State
- Full backend with PostgreSQL persistence
- JWT-based user authentication
- Redis caching for external fund data
- RESTful API for all operations
- Docker Compose for local development

### Data Model Mapping

| Frontend Type | Backend Model | Notes |
|--------------|---------------|-------|
| `Fund` | `Fund` | Synced from Eastmoney API |
| `Holding` | `Holding` | User-specific, with cost basis |
| `Transaction` | `Transaction` | Linked to Holding |
| `FundNavHistory` | `FundNavHistory` | Time-series data |
| `AppSettings` | `UserSettings` | Per-user configuration |
| - | `User` | New: authentication |
| - | `RefreshToken` | New: JWT refresh token storage |

---

## Part 1: Project Structure

```
fund-manager-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client singleton
│   │   ├── redis.ts           # Redis client
│   │   └── env.ts             # Environment validation
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── fund.controller.ts
│   │   ├── holding.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── portfolio.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── fund.service.ts
│   │   ├── holding.service.ts
│   │   ├── transaction.service.ts
│   │   ├── portfolio.service.ts
│   │   └── external/
│   │       └── eastmoney.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── fund.routes.ts
│   │   ├── holding.routes.ts
│   │   ├── transaction.routes.ts
│   │   └── portfolio.routes.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   ├── validators.ts
│   │   └── calculations.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .env
├── package.json
└── tsconfig.json
```

---

## Part 2: Database Schema (Prisma)

### Task 1: Initialize Backend Project

**Files:**
- Create: `fund-manager-backend/package.json`
- Create: `fund-manager-backend/tsconfig.json`
- Create: `fund-manager-backend/.env.example`
- Create: `fund-manager-backend/.gitignore`

**Step 1: Create package.json**

See implementation for full package.json with all dependencies.

**Step 2: Create tsconfig.json**

TypeScript configuration with strict mode enabled and path aliases.

**Step 3: Create .env.example**

Environment variables for database, Redis, JWT, and external APIs.

**Step 4: Install dependencies and commit**

---

### Task 2: Create Prisma Schema

**Files:**
- Create: `fund-manager-backend/prisma/schema.prisma`

**Key Models:**

1. **User** - Authentication and user data
2. **RefreshToken** - JWT refresh token storage
3. **UserSettings** - Per-user application settings
4. **Fund** - Fund basic information from Eastmoney
5. **FundNavHistory** - Historical NAV data
6. **Holding** - User holdings with cost basis
7. **Transaction** - Buy/Sell/Dividend records

**Step 1-3:** Initialize schema, generate client, commit.

---

## Part 3: Core Configuration

### Task 3: Create Configuration Files

**Files:**
- Create: `fund-manager-backend/src/config/env.ts` - Environment validation with Zod
- Create: `fund-manager-backend/src/config/database.ts` - Prisma client singleton
- Create: `fund-manager-backend/src/config/redis.ts` - Redis client with cache TTL constants

---

## Part 4: Utility Modules

### Task 4: Create Utility Functions

**Files:**
- Create: `fund-manager-backend/src/utils/logger.ts` - Winston logger configuration
- Create: `fund-manager-backend/src/utils/response.ts` - Standardized API response helpers
- Create: `fund-manager-backend/src/utils/validators.ts` - Zod validation schemas
- Create: `fund-manager-backend/src/utils/calculations.ts` - Financial calculations (XIRR, Sharpe, etc.)

---

## Part 5: Services Layer

### Task 5: Create AuthService

**Files:**
- Create: `fund-manager-backend/src/services/auth.service.ts`

**Methods:**
- `register(email, password, name)` - User registration with bcrypt hashing
- `login(email, password)` - Authentication with JWT tokens
- `generateTokens(userId)` - Create access and refresh tokens
- `refreshToken(token)` - Refresh access token
- `logout(userId, token)` - Invalidate refresh token

### Task 6: Create FundService

**Files:**
- Create: `fund-manager-backend/src/services/fund.service.ts`
- Create: `fund-manager-backend/src/services/external/eastmoney.service.ts`

**Methods:**
- `searchFunds(query)` - Search with Redis caching
- `getFundDetail(fundId)` - Get fund with NAV history
- `syncFundFromEastmoney(fundId)` - Sync fund data from external API
- `getFundEstimate(fundId)` - Get real-time estimate with caching
- `getFundNavHistory(fundId, timeRange)` - Get historical NAV data

### Task 7: Create HoldingService

**Files:**
- Create: `fund-manager-backend/src/services/holding.service.ts`

**Methods:**
- `getUserHoldings(userId)` - Get all holdings with fund data
- `getHoldingById(holdingId, userId)` - Get single holding
- `createHolding(userId, data)` - Create new holding
- `updateHolding(holdingId, userId, data)` - Update holding
- `deleteHolding(holdingId, userId)` - Delete holding
- `updateHoldingAfterTransaction(holdingId, transaction)` - Recalculate cost basis

### Task 8: Create TransactionService

**Files:**
- Create: `fund-manager-backend/src/services/transaction.service.ts`

**Methods:**
- `getHoldingTransactions(holdingId, userId)` - Get transactions for a holding
- `getUserTransactions(userId, options)` - Get all user transactions with filtering
- `createTransaction(userId, data)` - Create transaction and update holding
- `updateTransaction(transactionId, userId, data)` - Update transaction
- `deleteTransaction(transactionId, userId)` - Delete and revert holding changes

### Task 9: Create PortfolioService

**Files:**
- Create: `fund-manager-backend/src/services/portfolio.service.ts`

**Methods:**
- `getPortfolioSummary(userId)` - Calculate total assets, cost, profit
- `getAssetAllocation(userId)` - Allocation by type, risk, channel, group
- `getPerformanceMetrics(userId)` - XIRR, volatility, Sharpe ratio
- `getTopHoldings(userId, limit)` - Best performing holdings
- `getBottomHoldings(userId, limit)` - Worst performing holdings
- `getProfitCalendar(userId, year, month)` - Daily profit calendar

---

## Part 6: Controllers Layer

### Task 10: Create Controllers

**Files:**
- Create: `fund-manager-backend/src/controllers/auth.controller.ts`
- Create: `fund-manager-backend/src/controllers/fund.controller.ts`
- Create: `fund-manager-backend/src/controllers/holding.controller.ts`
- Create: `fund-manager-backend/src/controllers/transaction.controller.ts`
- Create: `fund-manager-backend/src/controllers/portfolio.controller.ts`

Each controller handles HTTP requests, calls services, and returns standardized responses.

---

## Part 7: Middleware

### Task 11: Create Middleware

**Files:**
- Create: `fund-manager-backend/src/middleware/auth.middleware.ts` - JWT verification
- Create: `fund-manager-backend/src/middleware/error.middleware.ts` - Global error handling
- Create: `fund-manager-backend/src/middleware/rateLimit.middleware.ts` - Rate limiting
- Create: `fund-manager-backend/src/middleware/validate.middleware.ts` - Request validation

---

## Part 8: Routes

### Task 12: Create Routes

**Files:**
- Create: `fund-manager-backend/src/routes/index.ts` - Route aggregator
- Create: `fund-manager-backend/src/routes/auth.routes.ts`
- Create: `fund-manager-backend/src/routes/fund.routes.ts`
- Create: `fund-manager-backend/src/routes/holding.routes.ts`
- Create: `fund-manager-backend/src/routes/transaction.routes.ts`
- Create: `fund-manager-backend/src/routes/portfolio.routes.ts`

**API Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | User login | No |
| POST | /api/auth/refresh | Refresh token | No |
| POST | /api/auth/logout | Logout | Yes |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/funds/search | Search funds | Yes |
| GET | /api/funds/:id | Get fund detail | Yes |
| GET | /api/funds/:id/estimate | Get fund estimate | Yes |
| GET | /api/funds/:id/history | Get NAV history | Yes |
| GET | /api/holdings | List holdings | Yes |
| POST | /api/holdings | Create holding | Yes |
| GET | /api/holdings/:id | Get holding | Yes |
| PUT | /api/holdings/:id | Update holding | Yes |
| DELETE | /api/holdings/:id | Delete holding | Yes |
| GET | /api/transactions | List transactions | Yes |
| POST | /api/transactions | Create transaction | Yes |
| GET | /api/transactions/:id | Get transaction | Yes |
| PUT | /api/transactions/:id | Update transaction | Yes |
| DELETE | /api/transactions/:id | Delete transaction | Yes |
| GET | /api/portfolio/summary | Portfolio summary | Yes |
| GET | /api/portfolio/allocation | Asset allocation | Yes |
| GET | /api/portfolio/performance | Performance metrics | Yes |
| GET | /api/portfolio/top-holdings | Top performers | Yes |
| GET | /api/portfolio/profit-calendar | Profit calendar | Yes |

---

## Part 9: Application Entry Point

### Task 13: Create App Entry

**Files:**
- Create: `fund-manager-backend/src/app.ts`

**Features:**
- Express app setup
- Middleware registration (helmet, cors, morgan, rate limit)
- Route mounting
- Error handling middleware
- Server start

---

## Part 10: Docker Configuration

### Task 14: Create Docker Setup

**Files:**
- Create: `fund-manager-backend/docker-compose.yml`
- Create: `fund-manager-backend/Dockerfile`

**Services:**
- PostgreSQL 15 with persistent volume
- Redis 7 with persistent volume
- Backend API server

---

## Implementation Order

1. **Phase 1: Foundation** (Tasks 1-4)
   - Project setup, database schema, configuration, utilities

2. **Phase 2: Core Services** (Tasks 5-9)
   - Auth, Fund, Holding, Transaction, Portfolio services

3. **Phase 3: API Layer** (Tasks 10-13)
   - Controllers, middleware, routes, app entry

4. **Phase 4: Infrastructure** (Task 14)
   - Docker setup for development

5. **Phase 5: Testing & Documentation**
   - Unit tests, integration tests, API documentation

---

## Next Steps

**Two execution options:**

**1. Subagent-Driven (this session)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Plan saved to: `docs/plans/2025-02-22-backend-architecture-design.md`
