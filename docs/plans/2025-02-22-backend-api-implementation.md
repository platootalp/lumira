# Backend API Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the complete API layer for the Fund Manager backend including Controllers, Middleware, Routes, and Docker configuration.

**Architecture:** Express.js controllers handle HTTP requests and delegate to services. Middleware provides authentication, validation, error handling, and rate limiting.

**Tech Stack:** Express 4, TypeScript, JWT, Zod, Docker, Docker Compose

---

## Implementation Tasks

### Task 1: Create Auth Controller
**File:** `fund-manager-backend/src/controllers/auth.controller.ts`
**Methods:** register, login, refresh, logout, me

### Task 2: Create Fund Controller
**File:** `fund-manager-backend/src/controllers/fund.controller.ts`
**Methods:** search, getById, getEstimate, getHistory, sync

### Task 3: Create Holding Controller
**File:** `fund-manager-backend/src/controllers/holding.controller.ts`
**Methods:** list, getById, create, update, delete

### Task 4: Create Transaction Controller
**File:** `fund-manager-backend/src/controllers/transaction.controller.ts`
**Methods:** list, getByHolding, create, update, delete

### Task 5: Create Portfolio Controller
**File:** `fund-manager-backend/src/controllers/portfolio.controller.ts`
**Methods:** getSummary, getAllocation, getTopHoldings, getBottomHoldings, getProfitCalendar

### Task 6: Create Auth Middleware
**File:** `fund-manager-backend/src/middleware/auth.middleware.ts`
**Features:** JWT verification, user attachment to request

### Task 7: Create Error Middleware
**File:** `fund-manager-backend/src/middleware/error.middleware.ts`
**Features:** Global error handling, Zod validation errors, custom error responses

### Task 8: Create Rate Limit Middleware
**File:** `fund-manager-backend/src/middleware/rateLimit.middleware.ts`
**Features:** Express rate limiting configuration

### Task 9: Create Routes
**Files:**
- `fund-manager-backend/src/routes/index.ts` - Route aggregator
- `fund-manager-backend/src/routes/auth.routes.ts`
- `fund-manager-backend/src/routes/fund.routes.ts`
- `fund-manager-backend/src/routes/holding.routes.ts`
- `fund-manager-backend/src/routes/transaction.routes.ts`
- `fund-manager-backend/src/routes/portfolio.routes.ts`

### Task 10: Create App Entry Point
**File:** `fund-manager-backend/src/app.ts`
**Features:** Express setup, middleware registration, route mounting, server start

### Task 11: Create Docker Configuration
**Files:**
- `fund-manager-backend/docker-compose.yml` - PostgreSQL + Redis + API services
- `fund-manager-backend/Dockerfile` - Node.js application image

---

## API Endpoints Summary

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
| POST | /api/funds/:id/sync | Sync fund data | Yes |
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
| GET | /api/portfolio/top-holdings | Top performers | Yes |
| GET | /api/portfolio/bottom-holdings | Bottom performers | Yes |
| GET | /api/portfolio/profit-calendar | Profit calendar | Yes |

---

## Execution Order

1. Controllers (Tasks 1-5)
2. Middleware (Tasks 6-8)
3. Routes (Task 9)
4. App Entry (Task 10)
5. Docker (Task 11)
