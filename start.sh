#!/bin/bash

# 基金管理系统一键启动脚本
# 自动检查端口占用并释放，启动所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 端口配置
FRONTEND_PORT=3000
BACKEND_PORT=3001

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查并释放端口
check_and_free_port() {
    local port=$1
    local name=$2
    
    log_info "检查 $name 端口 $port..."
    
    # 检查端口是否被占用
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        log_warn "$name 端口 $port 被进程 $pid 占用，正在释放..."
        
        # 尝试优雅终止
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        
        # 如果还在运行，强制终止
        if kill -0 $pid 2>/dev/null; then
            log_warn "进程 $pid 未响应，强制终止..."
            kill -9 $pid 2>/dev/null || true
            sleep 1
        fi
        
        log_success "端口 $port 已释放"
    else
        log_info "端口 $port 可用"
    fi
}

# 检查 Docker 是否运行
check_docker() {
    log_info "检查 Docker 状态..."
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
    log_success "Docker 运行正常"
}

# 启动 Docker 服务
start_docker_services() {
    log_info "启动 Docker 服务 (PostgreSQL + Redis)..."
    cd fund-manager-backend
    
    if docker-compose ps | grep -q "Up"; then
        log_warn "Docker 服务已在运行，跳过启动"
    else
        docker-compose up -d
        log_success "Docker 服务已启动"
        
        # 等待服务就绪
        log_info "等待数据库就绪..."
        sleep 5
        
        # 检查 PostgreSQL 是否就绪
        until docker-compose exec -T postgres pg_isready -U user >/dev/null 2>&1; do
            log_info "等待 PostgreSQL..."
            sleep 2
        done
        log_success "PostgreSQL 已就绪"
    fi
    
    cd ..
}

# 运行数据库迁移
run_migrations() {
    log_info "检查数据库迁移..."
    cd fund-manager-backend
    
    # 检查是否需要迁移
    if npx prisma migrate status 2>/dev/null | grep -q "Database schema is up to date"; then
        log_success "数据库已是最新状态"
    else
        log_info "运行数据库迁移..."
        npx prisma migrate dev --name init --skip-generate || true
        log_success "数据库迁移完成"
    fi
    
    # 生成 Prisma Client
    log_info "生成 Prisma Client..."
    npx prisma generate
    
    cd ..
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    cd fund-manager-backend
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        log_warn "后端 .env 文件不存在，从示例复制..."
        cp .env.example .env
        log_warn "请检查 fund-manager-backend/.env 配置是否正确"
    fi
    
    # 在后台启动后端
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    
    cd ..
    log_success "后端服务已启动 (PID: $BACKEND_PID)"
    log_info "后端日志: logs/backend.log"
    
    # 等待后端就绪
    log_info "等待后端服务就绪..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1 || curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
            log_success "后端服务已就绪"
            return 0
        fi
        sleep 1
    done
    
    log_warn "后端服务启动中，可能需要更多时间..."
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    
    # 检查 .env.local 文件
    if [ ! -f .env.local ]; then
        log_warn "前端 .env.local 文件不存在，从示例复制..."
        cp .env.local.example .env.local
    fi
    
    # 确保前端指向正确的后端地址
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3001/api" .env.local; then
        log_warn "检测到后端端口冲突，修改前端 API 地址为 http://localhost:$BACKEND_PORT/api"
        sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT/api|" .env.local
    fi
    
    # 在后台启动前端
    npm run dev -- --port $FRONTEND_PORT > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    
    log_success "前端服务已启动 (PID: $FRONTEND_PID)"
    log_info "前端日志: logs/frontend.log"
    
    # 等待前端就绪
    log_info "等待前端服务就绪..."
    for i in {1..30}; do
        if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            log_success "前端服务已就绪"
            return 0
        fi
        sleep 1
    done
    
    log_warn "前端服务启动中，可能需要更多时间..."
}

# 创建日志目录
mkdir -p logs

# 显示启动信息
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  基金管理系统一键启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 步骤 1: 释放端口
log_info "步骤 1/6: 检查并释放端口..."
check_and_free_port $FRONTEND_PORT "前端"
check_and_free_port $BACKEND_PORT "后端"
echo ""

# 步骤 2: 检查 Docker
log_info "步骤 2/6: 检查 Docker..."
check_docker
echo ""

# 步骤 3: 启动 Docker 服务
log_info "步骤 3/6: 启动数据库服务..."
start_docker_services
echo ""

# 步骤 4: 数据库迁移
log_info "步骤 4/6: 数据库迁移..."
run_migrations
echo ""

# 步骤 5: 启动后端
log_info "步骤 5/6: 启动后端服务..."
start_backend
echo ""

# 步骤 6: 启动前端
log_info "步骤 6/6: 启动前端服务..."
start_frontend
echo ""

# 显示访问信息
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已启动！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 ${BLUE}前端访问地址:${NC} http://localhost:$FRONTEND_PORT"
echo -e "🔌 ${BLUE}后端 API 地址:${NC} http://localhost:$BACKEND_PORT/api"
echo -e "📊 ${BLUE}API 文档:${NC} http://localhost:$BACKEND_PORT/api/docs"
echo ""
echo -e "📁 ${YELLOW}日志文件:${NC}"
echo -e "   - 后端: logs/backend.log"
echo -e "   - 前端: logs/frontend.log"
echo ""
echo -e "🛑 ${YELLOW}停止服务:${NC}"
echo -e "   运行: ./stop.sh"
echo ""
echo -e "${GREEN}========================================${NC}"

# 保持脚本运行，显示日志
log_info "显示服务日志 (按 Ctrl+C 停止)..."
tail -f logs/backend.log logs/frontend.log 2>/dev/null || true
