#!/bin/bash

# ========================================
# ShopBot 多平台電商系統 - 日誌查看腳本
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

# 顯示幫助信息
show_help() {
    echo "========================================"
    echo "📋 ShopBot 日誌查看工具"
    echo "========================================"
    echo ""
    echo "用法: $0 [選項] [服務名]"
    echo ""
    echo "選項:"
    echo "  -f, --follow    實時跟蹤日誌更新"
    echo "  -n, --lines     顯示指定行數 (默認: 50)"
    echo "  -a, --all       顯示所有服務的日誌"
    echo "  -c, --clear     清理日誌文件"
    echo "  -h, --help      顯示此幫助信息"
    echo ""
    echo "服務名:"
    echo "  admin           管理後台日誌"
    echo "  web             MiniWeb 日誌"
    echo "  functions       後端服務日誌"
    echo ""
    echo "示例:"
    echo "  $0 admin              # 查看管理後台日誌"
    echo "  $0 -f admin           # 實時跟蹤管理後台日誌"
    echo "  $0 -n 100 admin       # 查看管理後台最後100行日誌"
    echo "  $0 -a                 # 查看所有服務日誌"
    echo "  $0 -c                 # 清理所有日誌文件"
    echo ""
}

# 檢查日誌文件是否存在
check_log_file() {
    local service=$1
    local log_file="logs/${service}.log"
    
    if [ ! -f "$log_file" ]; then
        log_warning "$service 日誌文件不存在: $log_file"
        return 1
    fi
    
    return 0
}

# 顯示單個服務的日誌
show_service_log() {
    local service=$1
    local lines=${2:-50}
    local follow=${3:-false}
    
    local log_file="logs/${service}.log"
    
    if ! check_log_file "$service"; then
        return 1
    fi
    
    local file_size=$(du -h "$log_file" | cut -f1)
    local line_count=$(wc -l < "$log_file")
    
    echo ""
    echo "========================================"
    echo "📋 $service 日誌 (大小: $file_size, 總行數: $line_count)"
    echo "========================================"
    echo ""
    
    if [ "$follow" = true ]; then
        log_info "實時跟蹤 $service 日誌 (按 Ctrl+C 停止)..."
        echo ""
        tail -f -n "$lines" "$log_file"
    else
        log_info "顯示 $service 最後 $lines 行日誌..."
        echo ""
        tail -n "$lines" "$log_file"
    fi
}

# 顯示所有服務的日誌
show_all_logs() {
    local lines=${1:-50}
    local follow=${2:-false}
    
    echo ""
    echo "========================================"
    echo "📋 所有服務日誌"
    echo "========================================"
    echo ""
    
    local services=("admin" "web" "functions")
    local has_logs=false
    
    for service in "${services[@]}"; do
        if check_log_file "$service"; then
            has_logs=true
            local log_file="logs/${service}.log"
            local file_size=$(du -h "$log_file" | cut -f1)
            local line_count=$(wc -l < "$log_file")
            
            echo "🏷️  $service 日誌 (大小: $file_size, 總行數: $line_count)"
            echo "----------------------------------------"
            
            if [ "$follow" = true ]; then
                # 實時跟蹤時，只顯示最後幾行
                tail -n "$lines" "$log_file" | sed 's/^/   /'
                echo ""
            else
                tail -n "$lines" "$log_file" | sed 's/^/   /'
                echo ""
            fi
        fi
    done
    
    if [ "$has_logs" = false ]; then
        log_warning "沒有找到任何日誌文件"
    fi
}

# 清理日誌文件
clear_logs() {
    echo ""
    echo "========================================"
    echo "🧹 清理日誌文件"
    echo "========================================"
    echo ""
    
    if [ ! -d "logs" ]; then
        log_info "日誌目錄不存在，無需清理"
        return
    fi
    
    local log_files=()
    local pid_files=()
    
    # 收集日誌文件
    for file in logs/*.log; do
        if [ -f "$file" ]; then
            log_files+=("$file")
        fi
    done
    
    # 收集進程 ID 文件
    for file in logs/*.pid; do
        if [ -f "$file" ]; then
            pid_files+=("$file")
        fi
    done
    
    if [ ${#log_files[@]} -eq 0 ] && [ ${#pid_files[@]} -eq 0 ]; then
        log_info "沒有找到需要清理的文件"
        return
    fi
    
    # 清理日誌文件
    if [ ${#log_files[@]} -gt 0 ]; then
        log_info "清理日誌文件..."
        for file in "${log_files[@]}"; do
            local size=$(du -h "$file" | cut -f1)
            rm -f "$file"
            log_success "已清理: $(basename "$file") (大小: $size)"
        done
    fi
    
    # 清理進程 ID 文件
    if [ ${#pid_files[@]} -gt 0 ]; then
        log_info "清理進程 ID 文件..."
        for file in "${pid_files[@]}"; do
            rm -f "$file"
            log_success "已清理: $(basename "$file")"
        done
    fi
    
    log_success "日誌清理完成！"
}

# 實時跟蹤所有服務日誌
follow_all_logs() {
    local lines=${1:-50}
    
    echo ""
    echo "========================================"
    echo "📋 實時跟蹤所有服務日誌"
    echo "========================================"
    echo ""
    
    log_info "實時跟蹤所有服務日誌 (按 Ctrl+C 停止)..."
    echo ""
    
    # 使用 multitail 如果可用，否則使用簡單的方法
    if command -v multitail &> /dev/null; then
        local log_files=()
        for service in "admin" "web" "functions"; do
            if [ -f "logs/${service}.log" ]; then
                log_files+=("logs/${service}.log")
            fi
        done
        
        if [ ${#log_files[@]} -gt 0 ]; then
            multitail -e "$service" "${log_files[@]}"
        else
            log_warning "沒有找到任何日誌文件"
        fi
    else
        log_info "multitail 未安裝，使用簡單的跟蹤方法..."
        log_info "建議安裝 multitail 以獲得更好的日誌跟蹤體驗"
        echo ""
        
        # 簡單的跟蹤方法
        for service in "admin" "web" "functions"; do
            if [ -f "logs/${service}.log" ]; then
                echo "📋 跟蹤 $service 日誌..."
                tail -f "logs/${service}.log" &
            fi
        done
        
        # 等待用戶中斷
        wait
    fi
}

# 主函數
main() {
    local service=""
    local lines=50
    local follow=false
    local show_all=false
    local clear_logs=false
    
    # 解析命令行參數
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                follow=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            -a|--all)
                show_all=true
                shift
                ;;
            -c|--clear)
                clear_logs=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            admin|web|functions)
                service="$1"
                shift
                ;;
            *)
                log_error "未知參數: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 檢查日誌目錄
    if [ ! -d "logs" ]; then
        log_warning "日誌目錄不存在，創建中..."
        mkdir -p logs
    fi
    
    # 執行相應操作
    if [ "$clear_logs" = true ]; then
        clear_logs
    elif [ "$show_all" = true ]; then
        if [ "$follow" = true ]; then
            follow_all_logs "$lines"
        else
            show_all_logs "$lines"
        fi
    elif [ -n "$service" ]; then
        show_service_log "$service" "$lines" "$follow"
    else
        show_help
    fi
}

# 執行主函數
main "$@"
