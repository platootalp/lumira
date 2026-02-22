# AGENTS.md - Fund Manager Project Guidelines

## Build & Development Commands

```bash
# Development (runs both frontend and backend)
npm run dev

# Individual development
npm run dev:frontend  # Next.js on port 3000
npm run dev:backend   # Express API on port 3002

# Build
npm run build         # Build both
npm run build:frontend
npm run build:backend

# Linting
npm run lint          # Lint all
npm run lint:frontend
npm run lint:backend

# Clean
npm run clean         # Remove all node_modules and build dirs
```

## Code Style Guidelines

### TypeScript & Types
- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer interface over type for object definitions
- Use explicit return types on exported functions
- Use `Readonly<T>` for immutable props
- Avoid `any` - use `unknown` with type guards

### Imports & Exports
- Use `@/` path aliases for imports (configured in tsconfig)
- Group imports: React/Next → Third-party → Internal → Types
- Use named exports for utilities, default exports for pages/components
- Import types with `import type { ... }`

### Naming Conventions
- **Components**: PascalCase (e.g., `ConfirmDialog.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useTheme.ts`)
- **Utilities**: camelCase (e.g., `formatNumber.ts`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for true constants

### Component Patterns
- Use `'use client'` directive for client components only when needed
- Prefer Server Components by default
- Props interface named with `Props` suffix (e.g., `ConfirmDialogProps`)
- Destructure props in function parameters
- Use Tailwind for styling with custom CSS variables for theming

### Error Handling
- Use try/catch with specific error types
- Log errors to console with context
- Return user-friendly error messages
- Use early returns to reduce nesting

### Backend (Express)
- Use async/await for async operations
- Return consistent JSON response format: `{ data?, error?, message? }`
- Use middleware for cross-cutting concerns
- Validate input with type guards

### Frontend State Management
- Use React Query for server state
- Use Dexie (IndexedDB) for local persistence
- Lift state up only when necessary
- Prefer composition over prop drilling

### Styling (Tailwind v4)
- Use custom theme variables: `bg-background`, `text-foreground`
- Mobile-first responsive design
- Use `cn()` utility for conditional classes
- Dark mode support via `dark:` variants

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/description`
- Commit message format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### Testing (when implemented)
```bash
# Unit tests (to be configured)
npm test

# Run single test file
npm test -- ComponentName.test.tsx

# E2E tests (to be configured)
npm run test:e2e
```

## Project Structure

```
frontend/           # Next.js 16 app
  app/             # App router pages
  components/      # React components
    charts/        # Data visualization
    forms/         # Form components
    layout/        # Layout wrappers
    settings/      # Settings UI
    ui/            # Base UI components
  hooks/           # Custom React hooks
  lib/             # Utilities

backend/           # Express API
  src/
    routes/        # API routes
    services/      # Business logic
    types/         # TypeScript types
    utils/         # Utilities

src/               # Work-in-progress (legacy)
```

## Environment Variables

Frontend (`.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

Backend (`.env`):
- `PORT` - Server port (default: 3002)
- Fund data API credentials

## Key Dependencies

Frontend:
- Next.js 16 + React 19
- Tailwind CSS 4
- TanStack Query (React Query)
- Recharts (charts)
- Dexie (IndexedDB)
- Lucide React (icons)

Backend:
- Express 4
- TypeScript 5
- Helmet, CORS, Morgan
