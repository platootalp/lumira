#!/bin/bash

# 基金管理系统停止脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "正在停止服务..."

# 停止前端
if [ -f .frontend.pid ]; then
    PID=$(cat .frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill -TERM $PID 2>/dev/null || true
        sleep 2
        if kill -0 $PID 2>/dev/null; then
            kill -9 $PID 2>/dev/null || true
        fi
        log_success "前端服务已停止 (PID: $PID)"
    fi
    rm -f .frontend.pid
fi

# 停止后端
if [ -f .backend.pid ]; then
    PID=$(cat .backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill -TERM $PID 2>/dev/null || true
        sleep 2
        if kill -0 $PID 2>/dev/null; then
            kill -9 $PID 2>/dev/null || true
        fi
        log_success "后端服务已停止 (PID: $PID)"
    fi
    rm -f .backend.pid
fi

# 停止 Docker 服务
log_info "停止 Docker 服务..."
cd fund-manager-backend
docker-compose down
log_success "Docker 服务已停止"

echo ""
log_success "所有服务已停止"
