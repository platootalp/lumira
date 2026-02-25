#!/bin/bash
# ============================================
# Lumira Development Stop Script
# 本地开发一键停止脚本
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 本地开发环境停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

print_info "正在停止基础设施..."
cd docker/local
./stop.sh
cd "$SCRIPT_DIR"

print_success "基础设施已停止"
echo ""

print_warning "提示:"
echo "  前端/后端开发服务器需要手动停止 (Ctrl+C)"
echo ""
echo "💡 如需完全重置（删除数据）:"
echo "  cd docker/local && docker-compose down -v"
echo ""
echo -e "${GREEN}========================================${NC}"
