#!/bin/bash

# 🔐 ShopBot 安全工具安裝腳本
# 將安全檢查工具添加到系統 PATH 中

echo "🔐 安裝 ShopBot 安全檢查工具..."
echo "================================"

# 獲取腳本所在目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 腳本目錄: $SCRIPT_DIR"
echo "📁 項目根目錄: $PROJECT_ROOT"

# 檢查腳本是否存在
if [ ! -f "$SCRIPT_DIR/shopbot-security" ]; then
    echo "❌ 錯誤：找不到 shopbot-security 腳本"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/check-security.sh" ]; then
    echo "❌ 錯誤：找不到 check-security.sh 腳本"
    exit 1
fi

# 創建符號連結到 /usr/local/bin
echo ""
echo "📋 創建系統符號連結..."

# 檢查是否有權限
if [ "$EUID" -eq 0 ]; then
    # 以 root 身份運行
    ln -sf "$SCRIPT_DIR/shopbot-security" /usr/local/bin/shopbot-security
    ln -sf "$SCRIPT_DIR/check-security.sh" /usr/local/bin/check-security
    
    echo "✅ 已創建系統級符號連結"
    echo "   /usr/local/bin/shopbot-security"
    echo "   /usr/local/bin/check-security"
else
    # 以普通用戶身份運行
    if [ -d "$HOME/.local/bin" ]; then
        mkdir -p "$HOME/.local/bin"
        ln -sf "$SCRIPT_DIR/shopbot-security" "$HOME/.local/bin/shopbot-security"
        ln -sf "$SCRIPT_DIR/check-security.sh" "$HOME/.local/bin/check-security"
        
        echo "✅ 已創建用戶級符號連結"
        echo "   $HOME/.local/bin/shopbot-security"
        echo "   $HOME/.local/bin/check-security"
        
        # 檢查 PATH 是否包含 ~/.local/bin
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            echo ""
            echo "⚠️  警告：$HOME/.local/bin 不在您的 PATH 中"
            echo "   請將以下行添加到您的 ~/.bashrc 或 ~/.zshrc 文件："
            echo ""
            echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
            echo ""
            echo "   然後重新載入配置："
            echo "   source ~/.bashrc  # 或 source ~/.zshrc"
        fi
    else
        echo "❌ 無法創建符號連結，請以 root 身份運行此腳本"
        echo "   或手動創建符號連結"
    fi
fi

echo ""
echo "📋 創建項目別名..."

# 創建項目別名腳本
cat > "$PROJECT_ROOT/shopbot-security" << 'EOF'
#!/bin/bash
# 🔐 ShopBot 安全檢查工具別名
# 從項目根目錄運行安全檢查

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/scripts/shopbot-security" "$@"
EOF

chmod +x "$PROJECT_ROOT/shopbot-security"

echo "✅ 已創建項目別名腳本: $PROJECT_ROOT/shopbot-security"

echo ""
echo "🔧 使用方法："
echo ""
echo "1. 從任何目錄運行："
echo "   shopbot-security"
echo "   shopbot-security --help"
echo "   shopbot-security -e  # 只檢查環境變數"
echo "   shopbot-security -s  # 顯示 Git 狀態"
echo ""
echo "2. 從項目根目錄運行："
echo "   ./shopbot-security"
echo "   ./scripts/shopbot-security"
echo "   ./scripts/check-security.sh"
echo ""
echo "3. 檢查幫助："
echo "   shopbot-security --help"
echo ""
echo "🎉 安裝完成！現在您可以使用 'shopbot-security' 命令了。"
echo ""
echo "💡 提示：如果命令未找到，請重新載入您的 shell 配置："
echo "   source ~/.bashrc  # 或 source ~/.zshrc"
