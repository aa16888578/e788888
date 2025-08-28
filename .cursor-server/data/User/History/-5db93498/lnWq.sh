#!/bin/bash

# ========================================
# ShopBot 多平台電商系統 - 服務狀態檢查
# ========================================

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

# 檢查端口是否被佔用
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
        log_success "$service_name 正在運行 (端口: $port, PID: $pid)"
        return 0
    else
        log_warning "$service_name 未運行 (端口: $port)"
        return 1
    fi
}

# 檢查進程狀態
check_process() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            log_success "$service_name 進程正在運行 (PID: $pid)"
            return 0
        else
            log_warning "$service_name 進程文件存在但進程已停止 (PID: $pid)"
            rm -f "$pid_file"
            return 1
        fi
    else
        log_info "$service_name 進程文件不存在"
        return 1
    fi
}

# 檢查日誌文件
check_logs() {
    local service_name=$1
    local log_file="logs/${service_name}.log"
    
    if [ -f "$log_file" ]; then
        local size=$(du -h "$log_file" | cut -f1)
        local lines=$(wc -l < "$log_file")
        log_info "$service_name 日誌文件: $log_file (大小: $size, 行數: $lines)"
        
        # 顯示最後幾行日誌
        echo "   📋 最後 5 行日誌："
        tail -n 5 "$log_file" | sed 's/^/   /'
    else
        log_warning "$service_name 日誌文件不存在"
    fi
}

# 檢查管理後台狀態
check_admin_status() {
    echo ""
    log_service "檢查管理後台狀態..."
    
    # 檢查進程
    check_process "admin"
    admin_running=$?
    
    # 檢查端口
    check_port 3001 "管理後台"
    admin_port=$?
    
    # 檢查日誌
    check_logs "admin"
    
    # 檢查構建文件
    if [ -d "admin/.next" ] || [ -d "admin/out" ] || [ -d "admin/dist" ]; then
        log_success "管理後台構建文件存在"
    else
        log_warning "管理後台構建文件不存在"
    fi
    
    return $((admin_running && admin_port))
}

# 檢查 MiniWeb 狀態
check_web_status() {
    echo ""
    log_service "檢查 MiniWeb 狀態..."
    
    # 檢查進程
    check_process "web"
    web_running=$?
    
    # 檢查端口
    check_port 3002 "MiniWeb"
    web_port=$?
    
    # 檢查日誌
    check_logs "web"
    
    # 檢查構建文件
    if [ -d "web/.next" ] || [ -d "web/out" ] || [ -d "web/dist" ]; then
        log_success "MiniWeb 構建文件存在"
    else
        log_warning "MiniWeb 構建文件不存在"
    fi
    
    return $((web_running && web_port))
}

# 檢查後端服務狀態
check_functions_status() {
    echo ""
    log_service "檢查後端服務狀態..."
    
    # 檢查進程
    check_process "functions"
    functions_running=$?
    
    # 檢查端口
    check_port 5001 "後端服務"
    functions_port=$?
    
    # 檢查日誌
    check_logs "functions"
    
    # 檢查構建文件
    if [ -d "functions/dist" ]; then
        log_success "後端服務構建文件存在"
    else
        log_warning "後端服務構建文件不存在"
    fi
    
    return $((functions_running && functions_port))
}

# 檢查系統資源
check_system_resources() {
    echo ""
    log_service "檢查系統資源..."
    
    # 檢查磁盤空間
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}')
    local disk_available=$(df -h . | tail -1 | awk '{print $4}')
    log_info "磁盤使用率: $disk_usage, 可用空間: $disk_available"
    
    # 檢查內存使用
    local mem_total=$(free -h | grep Mem | awk '{print $2}')
    local mem_used=$(free -h | grep Mem | awk '{print $3}')
    local mem_available=$(free -h | grep Mem | awk '{print $7}')
    log_info "內存總量: $mem_total, 已使用: $mem_used, 可用: $mem_available"
    
    # 檢查 Node.js 進程
    local node_processes=$(ps aux | grep "node.*dev" | grep -v grep | wc -l)
    log_info "運行中的 Node.js 進程數: $node_processes"
}

# 檢查網絡連接
check_network() {
    echo ""
    log_service "檢查網絡連接..."
    
    # 檢查本地端口
    local ports=(3001 3002 5001)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_success "端口 $port 正在監聽"
        else
            log_warning "端口 $port 未監聽"
        fi
    done
    
    # 檢查外部連接
    if command -v curl &> /dev/null; then
        if curl -s --connect-timeout 5 https://api.telegram.org > /dev/null; then
            log_success "Telegram API 連接正常"
        else
            log_warning "Telegram API 連接失敗"
        fi
    fi
}

# 顯示總體狀態
show_overall_status() {
    echo ""
    echo "========================================"
    echo "📊 服務狀態總覽"
    echo "========================================"
    echo ""
    
    local total_services=3
    local running_services=0
    
    # 統計運行中的服務
    if [ $admin_status -eq 0 ]; then
        running_services=$((running_services + 1))
    fi
    
    if [ $web_status -eq 0 ]; then
        running_services=$((running_services + 1))
    fi
    
    if [ $functions_status -eq 0 ]; then
        running_services=$((running_services + 1))
    fi
    
    echo "🏗️  服務狀態: $running_services/$total_services 個服務正在運行"
    echo ""
    
    if [ $running_services -eq $total_services ]; then
        log_success "所有服務運行正常！"
    elif [ $running_services -gt 0 ]; then
        log_warning "部分服務運行異常"
    else
        log_error "所有服務都未運行"
    fi
    
    echo ""
    echo "💡 常用命令："
    echo "   • 啟動所有服務: npm run dev"
    echo "   • 停止所有服務: npm run stop"
    echo "   • 重啟服務: npm run restart"
    echo "   • 查看日誌: npm run logs"
    echo ""
}

# 主函數
main() {
    echo "========================================"
    echo "📊 ShopBot 多平台電商系統 - 狀態檢查"
    echo "========================================"
    echo ""
    
    # 檢查各個服務狀態
    check_admin_status
    admin_status=$?
    
    check_web_status
    web_status=$?
    
    check_functions_status
    functions_status=$?
    
    # 檢查系統資源
    check_system_resources
    
    # 檢查網絡連接
    check_network
    
    # 顯示總體狀態
    show_overall_status
}

# 執行主函數
main "$@"
