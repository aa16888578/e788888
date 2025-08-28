#!/bin/bash

# ========================================
# ShopBot 多平台電商系統 - 統一構建腳本
# ========================================

set -e  # 遇到錯誤時退出

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

# 檢查 Node.js 版本
check_node_version() {
    log_info "檢查 Node.js 版本..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_error "Node.js 版本過低，需要 18+，當前版本: $NODE_VERSION"
        exit 1
    fi
    
    log_success "Node.js 版本檢查通過: $NODE_VERSION"
}

# 檢查 npm 版本
check_npm_version() {
    log_info "檢查 npm 版本..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝，請先安裝 npm 8+"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
    
    if [ "$NPM_MAJOR" -lt 8 ]; then
        log_error "npm 版本過低，需要 8+，當前版本: $NPM_VERSION"
        exit 1
    fi
    
    log_success "npm 版本檢查通過: $NPM_VERSION"
}

# 清理構建文件
clean_build_files() {
    log_info "清理構建文件..."
    
    # 清理管理後台
    if [ -d "admin/.next" ]; then
        rm -rf admin/.next
        log_info "已清理 admin/.next"
    fi
    
    if [ -d "admin/out" ]; then
        rm -rf admin/out
        log_info "已清理 admin/out"
    fi
    
    if [ -d "admin/dist" ]; then
        rm -rf admin/dist
        log_info "已清理 admin/dist"
    fi
    
    # 清理 MiniWeb
    if [ -d "web/.next" ]; then
        rm -rf web/.next
        log_info "已清理 web/.next"
    fi
    
    if [ -d "web/out" ]; then
        rm -rf web/out
        log_info "已清理 web/out"
    fi
    
    if [ -d "web/dist" ]; then
        rm -rf web/dist
        log_info "已清理 web/dist"
    fi
    
    # 清理後端服務
    if [ -d "functions/dist" ]; then
        rm -rf functions/dist
        log_info "已清理 functions/dist"
    fi
    
    log_success "構建文件清理完成"
}

# 安裝依賴
install_dependencies() {
    log_info "安裝項目依賴..."
    
    # 安裝根目錄依賴
    if [ -f "package.json" ]; then
        log_info "安裝根目錄依賴..."
        npm install
    fi
    
    # 安裝管理後台依賴
    if [ -d "admin" ] && [ -f "admin/package.json" ]; then
        log_info "安裝管理後台依賴..."
        cd admin
        npm install
        cd ..
    fi
    
    # 安裝 MiniWeb 依賴
    if [ -d "web" ] && [ -f "web/package.json" ]; then
        log_info "安裝 MiniWeb 依賴..."
        cd web
        npm install
        cd ..
    fi
    
    # 安裝後端服務依賴
    if [ -d "functions" ] && [ -f "functions/package.json" ]; then
        log_info "安裝後端服務依賴..."
        cd functions
        npm install
        cd ..
    fi
    
    log_success "所有依賴安裝完成"
}

# 構建管理後台
build_admin() {
    log_info "構建管理後台..."
    
    if [ -d "admin" ] && [ -f "admin/package.json" ]; then
        cd admin
        
        # 檢查是否有構建腳本
        if npm run | grep -q "build"; then
            npm run build
            log_success "管理後台構建完成"
        else
            log_warning "管理後台沒有構建腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "管理後台目錄不存在，跳過"
    fi
}

# 構建 MiniWeb
build_web() {
    log_info "構建 MiniWeb..."
    
    if [ -d "web" ] && [ -f "web/package.json" ]; then
        cd web
        
        # 檢查是否有構建腳本
        if npm run | grep -q "build"; then
            npm run build
            log_success "MiniWeb 構建完成"
        else
            log_warning "MiniWeb 沒有構建腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "MiniWeb 目錄不存在，跳過"
    fi
}

# 構建後端服務
build_functions() {
    log_info "構建後端服務..."
    
    if [ -d "functions" ] && [ -f "functions/package.json" ]; then
        cd functions
        
        # 檢查是否有構建腳本
        if npm run | grep -q "build"; then
            npm run build
            log_success "後端服務構建完成"
        else
            log_warning "後端服務沒有構建腳本，跳過"
        fi
        
        cd ..
    else
        log_warning "後端服務目錄不存在，跳過"
    fi
}

# 檢查構建結果
check_build_results() {
    log_info "檢查構建結果..."
    
    local build_success=true
    
    # 檢查管理後台
    if [ -d "admin" ]; then
        if [ -d "admin/.next" ] || [ -d "admin/out" ] || [ -d "admin/dist" ]; then
            log_success "管理後台構建成功"
        else
            log_warning "管理後台構建可能失敗"
            build_success=false
        fi
    fi
    
    # 檢查 MiniWeb
    if [ -d "web" ]; then
        if [ -d "web/.next" ] || [ -d "web/out" ] || [ -d "web/dist" ]; then
            log_success "MiniWeb 構建成功"
        else
            log_warning "MiniWeb 構建可能失敗"
            build_success=false
        fi
    fi
    
    # 檢查後端服務
    if [ -d "functions" ]; then
        if [ -d "functions/dist" ]; then
            log_success "後端服務構建成功"
        else
            log_warning "後端服務構建可能失敗"
            build_success=false
        fi
    fi
    
    if [ "$build_success" = true ]; then
        log_success "所有項目構建完成！"
    else
        log_warning "部分項目構建可能失敗，請檢查日誌"
    fi
}

# 顯示構建信息
show_build_info() {
    echo ""
    echo "========================================"
    echo "🏗️  構建完成！"
    echo "========================================"
    echo ""
    echo "📁 構建輸出目錄："
    
    if [ -d "admin/.next" ]; then
        echo "   • 管理後台: admin/.next/"
    fi
    
    if [ -d "admin/out" ]; then
        echo "   • 管理後台: admin/out/"
    fi
    
    if [ -d "admin/dist" ]; then
        echo "   • 管理後台: admin/dist/"
    fi
    
    if [ -d "web/.next" ]; then
        echo "   • MiniWeb: web/.next/"
    fi
    
    if [ -d "web/out" ]; then
        echo "   • MiniWeb: web/out/"
    fi
    
    if [ -d "web/dist" ]; then
        echo "   • MiniWeb: web/dist/"
    fi
    
    if [ -d "functions/dist" ]; then
        echo "   • 後端服務: functions/dist/"
    fi
    
    echo ""
    echo "🚀 下一步："
    echo "   • 開發模式: npm run dev"
    echo "   • 部署: npm run deploy"
    echo "   • 清理: npm run clean"
    echo ""
}

# 主函數
main() {
    echo "========================================"
    echo "🚀 ShopBot 多平台電商系統 - 統一構建"
    echo "========================================"
    echo ""
    
    # 檢查環境
    check_node_version
    check_npm_version
    
    # 清理舊的構建文件
    clean_build_files
    
    # 安裝依賴
    install_dependencies
    
    # 構建各個項目
    build_admin
    build_web
    build_functions
    
    # 檢查構建結果
    check_build_results
    
    # 顯示構建信息
    show_build_info
}

# 執行主函數
main "$@"
