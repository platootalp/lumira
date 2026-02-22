# Frontend API Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the Next.js frontend from IndexedDB (Dexie) to use the new REST API backend for data persistence and multi-device sync.

**Architecture:** Create a new API client layer (`src/lib/api.ts`) that wraps fetch calls to the backend. Refactor Zustand stores to use API client instead of IndexedDB. Maintain backward compatibility during migration. Use React Query for server state caching.

**Tech Stack:** Next.js 14, React 18, TypeScript, Zustand (persist only UI state), React Query (server state), native fetch API

---

## Prerequisites

Before starting, ensure:
1. Backend is running on `http://localhost:3001`
2. Environment variable `NEXT_PUBLIC_API_URL=http://localhost:3001/api` is set

---

## Task 1: Create API Client Foundation

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/api-client.ts`
- Create: `src/types/api.ts`

**Step 1: Create API types**

Create `src/types/api.ts` with API response types, authentication types, and error types.

**Step 2: Create base API client with auth handling**

Create `src/lib/api-client.ts` with ApiClient class that handles JWT tokens, request/response, and authentication headers.

**Step 3: Create domain-specific API functions**

Create `src/lib/api.ts` with functions for auth, holdings, transactions, and portfolio endpoints.

**Step 4: Verify files compile**

Run: `npm run typecheck`
Expected: No errors in new files

**Step 5: Commit**

```bash
git add src/lib/api.ts src/lib/api-client.ts src/types/api.ts
git commit -m "feat: add API client layer for backend integration"
```

---

## Task 2: Create React Query Hooks

**Files:**
- Create: `src/hooks/use-holdings.ts`
- Create: `src/hooks/use-transactions.ts`
- Create: `src/hooks/use-portfolio.ts`
- Create: `src/hooks/use-auth.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Install React Query**

Run: `npm install @tanstack/react-query`

**Step 2: Create QueryClient provider**

Modify `src/app/layout.tsx` to wrap children with QueryClientProvider.

**Step 3: Create useAuth hook**

Create `src/hooks/use-auth.ts` with authentication state management using React Query.

**Step 4: Create useHoldings hook**

Create `src/hooks/use-holdings.ts` with queries and mutations for holdings CRUD operations.

**Step 5: Create useTransactions hook**

Create `src/hooks/use-transactions.ts` with queries and mutations for transactions.

**Step 6: Create usePortfolio hook**

Create `src/hooks/use-portfolio.ts` with queries for portfolio summary and allocation.

**Step 7: Verify compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 8: Commit**

```bash
git add src/hooks/ src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add React Query hooks for API integration"
```

---

## Task 3: Refactor Portfolio Store

**Files:**
- Modify: `src/stores/portfolio.ts`

**Step 1: Update store to use API**

Modify `src/stores/portfolio.ts` to:
- Replace `holdingDb` calls with API functions from `src/lib/api.ts`
- Keep local state for `analysis` (persisted)
- Update all action methods to use async/await with API

**Step 2: Update page components**

Modify `src/app/page.tsx` and `src/app/holdings/page.tsx` to use the updated store.

**Step 3: Verify functionality**

Test that holdings load from API and display correctly.

**Step 4: Commit**

```bash
git add src/stores/portfolio.ts src/app/page.tsx src/app/holdings/page.tsx
git commit -m "refactor: update portfolio store to use backend API"
```

---

## Task 4: Update Fund Detail Page

**Files:**
- Modify: `src/app/fund/[code]/page.tsx`
- Modify: `src/components/transaction-form.tsx`

**Step 1: Replace IndexedDB calls in fund page**

Modify `src/app/fund/[code]/page.tsx` to:
- Replace `holdingDb` and `transactionDb` calls with API hooks
- Use `useHoldings` and `useTransactionsByHolding` hooks

**Step 2: Update transaction form**

Modify `src/components/transaction-form.tsx` to:
- Replace `transactionDb.create` with `useCreateTransaction` mutation
- Replace `holdingDb.update` with `useUpdateHolding` mutation

**Step 3: Verify functionality**

Test viewing fund details and creating transactions.

**Step 4: Commit**

```bash
git add src/app/fund/[code]/page.tsx src/components/transaction-form.tsx
git commit -m "refactor: update fund detail page to use API"
```

---

## Task 5: Update Import Components

**Files:**
- Modify: `src/components/import/SearchTab.tsx`
- Modify: `src/components/import/ManualTab.tsx`
- Modify: `src/components/data-import-export.tsx`

**Step 1: Update SearchTab**

Modify `src/components/import/SearchTab.tsx` to use `useCreateHolding` mutation instead of `holdingDb.create`.

**Step 2: Update ManualTab**

Modify `src/components/import/ManualTab.tsx` to use API mutations instead of direct DB calls.

**Step 3: Update data import/export**

Modify `src/components/data-import-export.tsx` to:
- Replace `exportAllData` with API call
- Replace `importAllData` with API call
- Replace `clearAllData` with API call

**Step 4: Verify functionality**

Test import and export functionality.

**Step 5: Commit**

```bash
git add src/components/import/ src/components/data-import-export.tsx
git commit -m "refactor: update import components to use API"
```

---

## Task 6: Add Environment Configuration

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore`

**Step 1: Create environment example**

Create `.env.local.example` with required environment variables.

**Step 2: Update gitignore**

Ensure `.env.local` is in `.gitignore`.

**Step 3: Commit**

```bash
git add .env.local.example .gitignore
git commit -m "chore: add environment configuration for API"
```

---

## Task 7: Add Auth UI Components

**Files:**
- Create: `src/components/auth/login-modal.tsx`
- Create: `src/components/auth/register-modal.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create login modal**

Create `src/components/auth/login-modal.tsx` with form for email/password login.

**Step 2: Create register modal**

Create `src/components/auth/register-modal.tsx` with registration form.

**Step 3: Add auth provider to layout**

Modify `src/app/layout.tsx` to initialize auth state on app load.

**Step 4: Commit**

```bash
git add src/components/auth/ src/app/layout.tsx
git commit -m "feat: add authentication UI components"
```

---

## Task 8: Testing and Validation

**Files:**
- All modified files

**Step 1: Run type checking**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 2: Run linting**

Run: `npm run lint`
Expected: No linting errors

**Step 3: Test core flows**

Manually test:
- Login/registration
- Viewing holdings
- Adding a holding
- Creating a transaction
- Viewing portfolio summary
- Import/export data

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve issues from integration testing"
```

---

## Summary

After completing all tasks:
- Frontend uses REST API instead of IndexedDB
- React Query handles server state caching
- Zustand persists only UI state
- Authentication flow is complete
- All CRUD operations work through API

**Files Created:**
- `src/lib/api.ts`
- `src/lib/api-client.ts`
- `src/types/api.ts`
- `src/hooks/use-auth.ts`
- `src/hooks/use-holdings.ts`
- `src/hooks/use-transactions.ts`
- `src/hooks/use-portfolio.ts`
- `src/components/auth/login-modal.tsx`
- `src/components/auth/register-modal.tsx`
- `.env.local.example`

**Files Modified:**
- `src/stores/portfolio.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/holdings/page.tsx`
- `src/app/fund/[code]/page.tsx`
- `src/components/transaction-form.tsx`
- `src/components/import/SearchTab.tsx`
- `src/components/import/ManualTab.tsx`
- `src/components/data-import-export.tsx`
- `.gitignore`
