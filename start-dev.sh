#!/bin/bash
# ============================================
# Lumira Development Startup Script
# 本地开发一键启动脚本
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 本地开发环境启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Start infrastructure
print_info "步骤 1/2: 启动基础设施 (PostgreSQL/Redis)..."
cd docker/local
./start.sh
cd "$SCRIPT_DIR"
echo ""

# Step 2: Check if npm dependencies are installed
print_info "步骤 2/2: 检查依赖..."

if [ ! -d "node_modules" ]; then
    print_warning "前端依赖未安装，正在安装..."
    npm install
fi

if [ ! -d "lumira-backend/node_modules" ]; then
    print_warning "后端依赖未安装，正在安装..."
    cd lumira-backend && npm install && cd "$SCRIPT_DIR"
fi

print_success "依赖检查完成"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  基础设施已就绪！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 服务状态:"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis:       localhost:6379"
echo ""
echo "💻 现在请在其他终端启动应用:"
echo ""
echo -e "${BLUE}终端 1 - 后端:${NC}"
echo "  cd lumira-backend && npm run dev"
echo ""
echo -e "${BLUE}终端 2 - 前端:${NC}"
echo "  npm run dev"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo ""
echo "🛑 停止基础设施: ./stop-dev.sh"
echo "📜 查看日志: cd docker/local && docker-compose logs -f"
echo ""
echo -e "${GREEN}========================================${NC}"
