# Docker Deployment

This folder contains all Docker-related files for deploying Lumira with Docker Compose.

## Files

### Main Compose Configuration
- `docker-compose.yml` - Docker Compose configuration for all services (postgres, redis, api, frontend)

### Dockerfiles
- `Dockerfile.frontend` - Dockerfile for building the Next.js frontend
- `Dockerfile.backend` - Dockerfile for building the Express backend API

### Scripts
- `start.sh` - Script to start all Docker services
- `stop.sh` - Script to stop all Docker services

### Configuration
- `.dockerignore.backend` - Docker ignore rules for backend builds

## Quick Start

```bash
# Start all services
./start.sh

# Stop all services
./stop.sh

# Or use docker-compose directly
docker-compose up -d --build
docker-compose down -v
```

## Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| PostgreSQL | lumira-postgres | 5432 | Database |
| Redis | lumira-redis | 6379 | Cache & Sessions |
| Backend API | lumira-api | 3001 | Express API |
| Frontend | lumira-frontend | 3000 | Next.js App |

## Access Points

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health Check: http://localhost:3001/health
