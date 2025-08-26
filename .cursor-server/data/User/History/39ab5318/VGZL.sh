#!/bin/bash

# ========================================
# ShopBot 多平台電商系統 - 停止服務腳本
# ========================================

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 停止管理後台
stop_admin() {
    if [ -f "logs/admin.pid" ]; then
        ADMIN_PID=$(cat logs/admin.pid)
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            log_success "已停止管理後台 (PID: $ADMIN_PID)"
        else
            log_warning "管理後台進程不存在 (PID: $ADMIN_PID)"
        fi
        rm -f logs/admin.pid
    else
        log_info "管理後台未運行"
    fi
}

# 停止 MiniWeb
stop_web() {
    if [ -f "logs/web.pid" ]; then
        WEB_PID=$(cat logs/web.pid)
        if kill -0 $WEB_PID 2>/dev/null; then
            kill $WEB_PID
            log_success "已停止 MiniWeb (PID: $WEB_PID)"
        else
            log_warning "MiniWeb 進程不存在 (PID: $WEB_PID)"
        fi
        rm -f logs/web.pid
    else
        log_info "MiniWeb 未運行"
    fi
}

# 停止後端服務
stop_functions() {
    if [ -f "logs/functions.pid" ]; then
        FUNCTIONS_PID=$(cat logs/functions.pid)
        if kill -0 $FUNCTIONS_PID 2>/dev/null; then
            kill $FUNCTIONS_PID
            log_success "已停止後端服務 (PID: $FUNCTIONS_PID)"
        else
            log_warning "後端服務進程不存在 (PID: $FUNCTIONS_PID)"
        fi
        rm -f logs/functions.pid
    else
        log_info "後端服務未運行"
    fi
}

# 強制停止所有 Node.js 進程
force_stop_all() {
    log_info "強制停止所有 Node.js 進程..."
    
    # 查找並停止所有在項目目錄下運行的 Node.js 進程
    pids=$(ps aux | grep "node.*dev" | grep -v grep | awk '{print $2}')
    
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9
        log_success "已強制停止所有 Node.js 進程"
    else
        log_info "沒有找到運行中的 Node.js 進程"
    fi
}

# 清理日誌文件
cleanup_logs() {
    log_info "清理日誌文件..."
    
    if [ -d "logs" ]; then
        rm -f logs/*.pid
        log_success "已清理進程 ID 文件"
    fi
}

# 主函數
main() {
    echo "========================================"
    echo "🛑 ShopBot 多平台電商系統 - 停止服務"
    echo "========================================"
    echo ""
    
    # 停止各個服務
    stop_admin
    stop_web
    stop_functions
    
    # 強制停止所有進程
    force_stop_all
    
    # 清理日誌
    cleanup_logs
    
    echo ""
    log_success "所有服務已停止！"
    echo ""
    echo "💡 提示："
    echo "   • 重新啟動: npm run dev"
    echo "   • 查看狀態: npm run status"
    echo "   • 查看日誌: npm run logs"
    echo ""
}

# 執行主函數
main "$@"
