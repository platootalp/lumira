# Deployment Guide

This document provides comprehensive instructions for deploying Lumira to Vercel using GitHub Actions CI/CD.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Variables](#environment-variables)
- [Deployment Workflows](#deployment-workflows)
- [Local Testing](#local-testing)
- [Troubleshooting](#troubleshooting)

## Overview

Lumira uses a fully automated CI/CD pipeline with:

- **Vercel** for hosting and serverless functions
- **GitHub Actions** for continuous integration and deployment
- **Preview deployments** for every pull request
- **Production deployments** on merge to main

### Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│GitHub Actions│────▶│   Vercel    │
│   (Source)  │     │   (CI/CD)   │     │  (Hosting)  │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    Tests    │
                     │  - Unit     │
                     │  - E2E      │
                     │  - Lint     │
                     └─────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Project pushed to GitHub
3. **Node.js 20+**: For local testing
4. **Vercel CLI** (optional): For manual deployments

## Initial Setup

### 1. Create Vercel Project

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link project (from project root)
vercel link
```

Or use the Vercel Dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select "Next.js" as framework preset
4. Deploy

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Project Settings > General |
| `VERCEL_PROJECT_ID` | Vercel project ID | Project Settings > General |

**Steps to add secrets:**

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from the table above

### 3. Get Vercel IDs

```bash
# Get organization and project IDs
vercel env ls

# Or check .vercel/project.json after linking
cat .vercel/project.json
```

## Environment Variables

### Local Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_APP_NAME=Lumira
NEXT_PUBLIC_APP_VERSION=0.1.0
NODE_ENV=development
```

### Vercel Environment Variables

Set environment variables in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables for each environment:
   - Production
   - Preview
   - Development

Or use Vercel CLI:

```bash
# Add production variable
vercel env add NEXT_PUBLIC_APP_NAME production

# Add preview variable
vercel env add NEXT_PUBLIC_DEBUG_MODE preview
```

### Required Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_NAME` | Yes | Application display name |
| `NEXT_PUBLIC_APP_VERSION` | Yes | Application version |
| `NODE_ENV` | Yes | Environment mode |
| `NEXT_PUBLIC_API_URL` | No | API base URL (defaults to same-origin) |

### CI/CD Variables

These are configured in GitHub Secrets:

| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | Yes | Vercel API authentication |
| `VERCEL_ORG_ID` | Yes | Vercel organization identifier |
| `VERCEL_PROJECT_ID` | Yes | Vercel project identifier |

## Deployment Workflows

### Automatic Deployments

The project includes three GitHub Actions workflows:

#### 1. CI/CD (`ci.yml`)

Runs on every push and PR:

- Type checking
- Linting
- Unit tests
- E2E tests
- Build verification

#### 2. Deploy (`deploy.yml`)

Runs on push to `main`:

- Runs all tests
- Deploys to Vercel production
- Runs E2E tests against production
- Posts deployment status

#### 3. PR Check (`pr-check.yml`)

Runs on every PR:

- Lint and type check
- Unit tests
- Build
- Deploy preview to Vercel
- Run E2E tests against preview
- Comment preview URL on PR

### Workflow Triggers

```yaml
# Production deployment
on:
  push:
    branches: [main]

# Preview deployment
on:
  pull_request:
    branches: [main]
```

### Manual Deployment

Trigger deployment manually from GitHub:

1. Go to Actions → Deploy to Vercel
2. Click "Run workflow"
3. Select environment (production/preview)
4. Run workflow

Or use Vercel CLI:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Local Testing

### Test Production Build Locally

```bash
# Build production version
npm run build

# Start production server
npm start

# Or combine both
npm run build && npm start
```

### Verify Build Output

```bash
# Check build output
ls -la .next/

# Analyze bundle size
npm run analyze
```

### Test API Routes

```bash
# Start dev server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/funds/search?q=沪深300
```

## Vercel Configuration

### `vercel.json`

The project includes comprehensive Vercel configuration:

```json
{
  "framework": "nextjs",
  "regions": ["hkg1"],
  "headers": [...],
  "redirects": [...],
  "rewrites": [...]
}
```

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `regions` | `hkg1` | Hong Kong region (low latency for China) |
| `headers` | Security headers | HSTS, CSP, XSS protection |
| `redirects` | URL redirects | Clean URL handling |
| `rewrites` | API routes | Fund API endpoints |

### Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue**: Type errors during build

```bash
# Run type check locally
npm run typecheck

# Fix errors before pushing
```

### Deployment Failures

**Issue**: "VERCEL_TOKEN not found"

- Verify GitHub secrets are set correctly
- Check secret names match exactly (case-sensitive)

**Issue**: "Project not found"

- Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Ensure project is linked: `vercel link`

### Runtime Errors

**Issue**: API routes return 404

- Check `vercel.json` rewrites configuration
- Verify API routes exist in `app/api/`

**Issue**: Static files not loading

- Check `next.config.js` output settings
- Verify files are in `public/` directory

### Performance Issues

**Issue**: Slow initial load

```bash
# Analyze bundle size
npm run analyze

# Check for large dependencies
npm run analyze:quick
```

**Issue**: API timeout

- Increase function duration in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Common Commands

```bash
# Check Vercel logs
vercel logs --all

# Check deployment status
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# Remove deployment
vercel remove <deployment-url>
```

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] GitHub secrets configured
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in build output
- [ ] Security headers configured
- [ ] HTTPS enforced

## Support

For deployment issues:

1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Check GitHub Actions logs
4. Run `vercel logs` for runtime errors

## Related Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
