#!/bin/bash

# ========================================
# ShopBot 多平台電商系統 - 統一開發腳本
# ========================================

set -e  # 遇到錯誤時退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_service() {
    echo -e "${PURPLE}[SERVICE]${NC} $1"
}

# 檢查環境
check_environment() {
    log_info "檢查開發環境..."
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝，請先安裝 npm 8+"
        exit 1
    fi
    
    # 檢查環境配置文件
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        log_warning "未找到環境配置文件，請先配置 .env.local"
        log_info "可以複製 .env.example 為 .env.local 並填入實際值"
    fi
    
    log_success "環境檢查完成"
}

# 檢查依賴
check_dependencies() {
    log_info "檢查項目依賴..."
    
    local missing_deps=false
    
    # 檢查管理後台依賴
    if [ -d "admin" ] && [ ! -d "admin/node_modules" ]; then
        log_warning "管理後台依賴未安裝"
        missing_deps=true
    fi
    
    # 檢查 MiniWeb 依賴
    if [ -d "web" ] && [ ! -d "web/node_modules" ]; then
        log_warning "MiniWeb 依賴未安裝"
        missing_deps=true
    fi
    
    # 檢查後端服務依賴
    if [ -d "functions" ] && [ ! -d "functions/node_modules" ]; then
        log_warning "後端服務依賴未安裝"
        missing_deps=true
    fi
    
    if [ "$missing_deps" = true ]; then
        log_info "正在安裝缺失的依賴..."
        npm run install:all
    fi
    
    log_success "依賴檢查完成"
}

# 啟動管理後台
start_admin() {
    log_service "啟動管理後台..."
    
    if [ -d "admin" ] && [ -f "admin/package.json" ]; then
        cd admin
        
        # 檢查是否有開發腳本
        if npm run | grep -q "dev"; then
            # 在後台啟動管理後台
            nohup npm run dev > ../logs/admin.log 2>&1 &
            ADMIN_PID=$!
            echo $ADMIN_PID > ../logs/admin.pid
            log_success "管理後台已啟動 (PID: $ADMIN_PID, 端口: 3001)"
        else
            log_warning "管理後台沒有開發腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "管理後台目錄不存在，跳過"
    fi
}

# 啟動 MiniWeb
start_web() {
    log_service "啟動 MiniWeb..."
    
    if [ -d "web" ] && [ -f "web/package.json" ]; then
        cd web
        
        # 檢查是否有開發腳本
        if npm run | grep -q "dev"; then
            # 在後台啟動 MiniWeb
            nohup npm run dev > ../logs/web.log 2>&1 &
            WEB_PID=$!
            echo $WEB_PID > ../logs/web.pid
            log_success "MiniWeb 已啟動 (PID: $WEB_PID, 端口: 3002)"
        else
            log_warning "MiniWeb 沒有開發腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "MiniWeb 目錄不存在，跳過"
    fi
}

# 啟動後端服務
start_functions() {
    log_service "啟動後端服務..."
    
    if [ -d "functions" ] && [ -f "functions/package.json" ]; then
        cd functions
        
        # 檢查是否有開發腳本
        if npm run | grep -q "dev"; then
            # 在後台啟動後端服務
            nohup npm run dev > ../logs/functions.log 2>&1 &
            FUNCTIONS_PID=$!
            echo $FUNCTIONS_PID > ../logs/functions.pid
            log_success "後端服務已啟動 (PID: $FUNCTIONS_PID, 端口: 5001)"
        else
            log_warning "後端服務沒有開發腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "後端服務目錄不存在，跳過"
    fi
}

# 創建日誌目錄
create_logs_directory() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_info "創建日誌目錄: logs/"
    fi
}

# 顯示服務狀態
show_service_status() {
    echo ""
    echo "========================================"
    echo "🚀 開發服務啟動完成！"
    echo "========================================"
    echo ""
    echo "📱 服務地址："
    echo "   • 管理後台: http://localhost:3001"
    echo "   • MiniWeb:   http://localhost:3002"
    echo "   • 後端服務:  http://localhost:5001"
    echo ""
    echo "📋 日誌文件："
    echo "   • 管理後台: logs/admin.log"
    echo "   • MiniWeb:   logs/web.log"
    echo "   • 後端服務:  logs/functions.log"
    echo ""
    echo "🛑 停止服務："
    echo "   • 停止所有: npm run stop"
    echo "   • 查看進程: npm run status"
    echo ""
    echo "💡 提示："
    echo "   • 按 Ctrl+C 停止所有服務"
    echo "   • 查看日誌: tail -f logs/*.log"
    echo "   • 重啟服務: npm run restart"
    echo ""
}

# 清理函數
cleanup() {
    log_info "正在停止所有服務..."
    
    # 停止管理後台
    if [ -f "logs/admin.pid" ]; then
        ADMIN_PID=$(cat logs/admin.pid)
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            log_info "已停止管理後台 (PID: $ADMIN_PID)"
        fi
        rm -f logs/admin.pid
    fi
    
    # 停止 MiniWeb
    if [ -f "logs/web.pid" ]; then
        WEB_PID=$(cat logs/web.pid)
        if kill -0 $WEB_PID 2>/dev/null; then
            kill $WEB_PID
            log_info "已停止 MiniWeb (PID: $WEB_PID)"
        fi
        rm -f logs/web.pid
    fi
    
    # 停止後端服務
    if [ -f "logs/functions.pid" ]; then
        FUNCTIONS_PID=$(cat logs/functions.pid)
        if kill -0 $FUNCTIONS_PID 2>/dev/null; then
            kill $FUNCTIONS_PID
            log_info "已停止後端服務 (PID: $FUNCTIONS_PID)"
        fi
        rm -f logs/functions.pid
    fi
    
    log_success "所有服務已停止"
    exit 0
}

# 設置信號處理
trap cleanup SIGINT SIGTERM

# 主函數
main() {
    echo "========================================"
    echo "🚀 ShopBot 多平台電商系統 - 開發模式"
    echo "========================================"
    echo ""
    
    # 檢查環境
    check_environment
    
    # 檢查依賴
    check_dependencies
    
    # 創建日誌目錄
    create_logs_directory
    
    # 啟動各個服務
    start_admin
    start_web
    start_functions
    
    # 顯示服務狀態
    show_service_status
    
    # 等待用戶中斷
    log_info "所有服務正在運行中... 按 Ctrl+C 停止"
    
    # 保持腳本運行
    while true; do
        sleep 1
    done
}

# 執行主函數
main "$@"
