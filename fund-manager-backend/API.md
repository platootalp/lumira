# Fund Manager API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### POST /auth/login

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### POST /auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### POST /auth/logout

Logout user (requires auth).

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

#### GET /auth/me

Get current user info (requires auth).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Funds

#### GET /funds/search

Search funds by name or code.

**Query Parameters:**
- `query` (required): Search query
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "000001",
      "name": "华夏成长",
      "type": "混合型"
    }
  ]
}
```

#### GET /funds/:id

Get fund details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "000001",
    "name": "华夏成长",
    "type": "MIX",
    "riskLevel": "MEDIUM",
    "company": "华夏基金",
    "nav": "1.2345",
    "accumNav": "2.3456",
    "navDate": "2024-01-01"
  }
}
```

#### GET /funds/:id/estimate

Get real-time fund estimate.

**Response:**
```json
{
  "success": true,
  "data": {
    "fundId": "000001",
    "fundName": "华夏成长",
    "estimateNav": 1.2456,
    "estimateTime": "2024-01-01 15:00:00",
    "estimateChange": 0.0111,
    "estimateChangePercent": 0.90,
    "lastNav": 1.2345,
    "lastNavDate": "2024-01-01"
  },
  "meta": {
    "cached": false,
    "source": "eastmoney"
  }
}
```

#### GET /funds/:id/history

Get NAV history.

**Query Parameters:**
- `range` (optional): Time range (1m, 3m, 6m, 1y, ytd, all) - default: 1y

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "nav": 1.2345,
      "accumNav": 2.3456
    }
  ]
}
```

### Holdings

#### GET /holdings

List all user holdings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "fundId": "000001",
      "fundName": "华夏成长",
      "fundType": "MIX",
      "totalShares": 1000,
      "avgCost": 1.2000,
      "totalCost": 1200.00,
      "channel": "支付宝",
      "group": "核心持仓",
      "tags": ["长期持有"],
      "fund": {
        "id": "000001",
        "name": "华夏成长",
        "nav": 1.2345,
        "accumNav": 2.3456,
        "navDate": "2024-01-01"
      }
    }
  ]
}
```

#### POST /holdings

Create a new holding.

**Request Body:**
```json
{
  "fundId": "000001",
  "totalShares": 1000,
  "avgCost": 1.2000,
  "channel": "支付宝",
  "group": "核心持仓",
  "tags": ["长期持有"]
}
```

#### GET /holdings/:id

Get holding by ID.

#### PUT /holdings/:id

Update holding.

**Request Body:**
```json
{
  "totalShares": 1500,
  "avgCost": 1.2500,
  "totalCost": 1875.00,
  "channel": "支付宝",
  "group": "核心持仓",
  "tags": ["长期持有"]
}
```

#### DELETE /holdings/:id

Delete holding.

### Transactions

#### GET /transactions

List user transactions.

**Query Parameters:**
- `fundId` (optional): Filter by fund
- `type` (optional): Filter by type (BUY, SELL, DIVIDEND)
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Page size (default: 50)
- `offset` (optional): Page offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "...",
        "holdingId": "...",
        "fundId": "000001",
        "fundName": "华夏成长",
        "type": "BUY",
        "date": "2024-01-01",
        "shares": 1000,
        "price": 1.2000,
        "amount": 1200.00,
        "fee": 12.00,
        "notes": "首次买入"
      }
    ],
    "total": 100
  }
}
```

#### POST /transactions

Create a transaction.

**Request Body:**
```json
{
  "holdingId": "...",
  "fundId": "000001",
  "type": "BUY",
  "date": "2024-01-01",
  "shares": 1000,
  "price": 1.2000,
  "amount": 1200.00,
  "fee": 12.00,
  "notes": "首次买入"
}
```

#### GET /transactions/holding/:holdingId

Get transactions for a specific holding.

#### PUT /transactions/:id

Update transaction.

#### DELETE /transactions/:id

Delete transaction.

### Portfolio

#### GET /portfolio/summary

Get portfolio summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAssets": 15000.00,
    "totalCost": 12000.00,
    "totalProfit": 3000.00,
    "totalProfitRate": 25.00,
    "todayProfit": 150.00,
    "todayProfitRate": 1.00,
    "holdingCount": 5
  }
}
```

#### GET /portfolio/allocation

Get asset allocation.

**Response:**
```json
{
  "success": true,
  "data": {
    "byType": [
      {
        "key": "MIX",
        "name": "混合型",
        "amount": 8000.00,
        "percentage": 53.33,
        "count": 2
      }
    ],
    "byRisk": [...],
    "byChannel": [...],
    "byGroup": [...]
  }
}
```

#### GET /portfolio/top-holdings

Get top performing holdings.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fundId": "000001",
      "fundName": "华夏成长",
      "profit": 2000.00,
      "profitRate": 33.33,
      "contribution": 66.67,
      "marketValue": 8000.00,
      "percentage": 53.33
    }
  ]
}
```

#### GET /portfolio/bottom-holdings

Get worst performing holdings.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

#### GET /portfolio/profit-calendar

Get profit calendar for a month.

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month (default: current month)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "profit": 500.00,
      "profitRate": 0
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| BAD_REQUEST | Invalid request parameters |
| UNAUTHORIZED | Missing or invalid token |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| CONFLICT | Resource already exists |
| VALIDATION_ERROR | Request validation failed |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Server error |

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## Health Check

```
GET /health
```

Returns server status.
