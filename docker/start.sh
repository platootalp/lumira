#!/bin/bash
set -e

# Change to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Enable Docker BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_and_free_port() {
    local port=$1
    local name=$2
    log_info "检查 $name 端口 $port..."
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        log_warn "$name 端口 $port 被进程 $pid 占用，正在释放..."
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null || true
        fi
        log_success "端口 $port 已释放"
    else
        log_info "端口 $port 可用"
    fi
}

check_docker() {
    log_info "检查 Docker 状态..."
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
    log_success "Docker 运行正常"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 基金管理系统启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

log_info "步骤 1/3: 检查并释放端口..."
check_and_free_port 3000 "前端"
check_and_free_port 3001 "后端"
check_and_free_port 5432 "PostgreSQL"
check_and_free_port 6379 "Redis"
echo ""

log_info "步骤 2/3: 检查 Docker..."
check_docker
echo ""

log_info "步骤 3/3: 启动所有服务..."
docker-compose up -d --build
echo ""

log_info "等待服务就绪..."
sleep 5

until docker-compose exec -T postgres pg_isready -U user >/dev/null 2>&1; do
    log_info "等待 PostgreSQL..."
    sleep 2
done
log_success "PostgreSQL 已就绪"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已启动！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 ${BLUE}前端访问地址:${NC} http://localhost:3000"
echo -e "🔌 ${BLUE}后端 API 地址:${NC} http://localhost:3001"
echo -e "📊 ${BLUE}API Health:${NC} http://localhost:3001/health"
echo ""
echo -e "🛑 ${YELLOW}停止服务:${NC} ./stop.sh"
echo -e "📋 ${YELLOW}查看日志:${NC} docker-compose logs -f"
echo ""
echo -e "${GREEN}========================================${NC}"
