#!/bin/bash

# USDT-TRC20 支付系統部署腳本
# 作者: ShopBot Team
# 版本: 1.0.0

set -e

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

# 檢查依賴
check_dependencies() {
    log_info "檢查系統依賴..."
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝，請先安裝 npm"
        exit 1
    fi
    
    # 檢查 Docker (可選)
    if command -v docker &> /dev/null; then
        log_info "Docker 已安裝"
    else
        log_warning "Docker 未安裝，將使用本地部署"
    fi
    
    log_success "依賴檢查完成"
}

# 環境檢查
check_environment() {
    log_info "檢查環境配置..."
    
    if [ ! -f ".env" ]; then
        log_error ".env 文件不存在，請先複製 env.example 並配置"
        exit 1
    fi
    
    # 檢查必要的環境變數
    source .env
    
    required_vars=(
        "TRON_NETWORK"
        "TRON_API_KEY"
        "USDT_CONTRACT_ADDRESS"
        "JWT_SECRET"
        "FIREBASE_PROJECT_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "環境變數 $var 未設置"
            exit 1
        fi
    done
    
    log_success "環境配置檢查完成"
}

# 安裝依賴
install_dependencies() {
    log_info "安裝項目依賴..."
    
    if [ -f "package.json" ]; then
        npm ci --only=production
        log_success "生產依賴安裝完成"
    else
        log_error "package.json 文件不存在"
        exit 1
    fi
}

# 構建項目
build_project() {
    log_info "構建項目..."
    
    if [ -f "tsconfig.json" ]; then
        npm run build
        log_success "項目構建完成"
    else
        log_warning "TypeScript 配置不存在，跳過構建步驟"
    fi
}

# 部署智能合約
deploy_contracts() {
    log_info "部署智能合約..."
    
    if [ -f "hardhat.config.js" ] || [ -f "hardhat.config.ts" ]; then
        # 根據環境選擇網絡
        if [ "$TRON_NETWORK" = "mainnet" ]; then
            log_info "部署到主網..."
            npm run deploy:contracts
        else
            log_info "部署到測試網..."
            npm run deploy:testnet
        fi
        log_success "智能合約部署完成"
    else
        log_warning "Hardhat 配置不存在，跳過合約部署"
    fi
}

# 啟動服務
start_service() {
    log_info "啟動支付服務..."
    
    # 檢查是否使用 PM2
    if command -v pm2 &> /dev/null; then
        log_info "使用 PM2 啟動服務..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        log_success "服務已啟動並保存到 PM2"
    else
        log_info "使用 npm 啟動服務..."
        npm start &
        log_success "服務已啟動"
    fi
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 等待服務啟動
    sleep 5
    
    # 檢查服務是否響應
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "服務健康檢查通過"
    else
        log_error "服務健康檢查失敗"
        exit 1
    fi
}

# 部署後清理
post_deploy_cleanup() {
    log_info "執行部署後清理..."
    
    # 清理構建文件
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "清理構建文件完成"
    fi
    
    # 清理緩存
    npm cache clean --force
    log_info "清理 npm 緩存完成"
}

# 主部署流程
main() {
    log_info "開始部署 USDT-TRC20 支付系統..."
    
    # 檢查當前目錄
    if [ ! -f "package.json" ]; then
        log_error "請在項目根目錄執行此腳本"
        exit 1
    fi
    
    # 執行部署步驟
    check_dependencies
    check_environment
    install_dependencies
    build_project
    deploy_contracts
    start_service
    health_check
    post_deploy_cleanup
    
    log_success "部署完成！"
    log_info "服務地址: http://localhost:3000"
    log_info "健康檢查: http://localhost:3000/health"
    
    if command -v pm2 &> /dev/null; then
        log_info "PM2 狀態: pm2 status"
        log_info "PM2 日誌: pm2 logs"
    fi
}

# 錯誤處理
trap 'log_error "部署過程中發生錯誤，退出碼: $?"' ERR

# 執行主函數
main "$@"
