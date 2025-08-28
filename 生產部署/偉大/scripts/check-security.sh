#!/bin/bash

# 🔐 Git 安全檢查腳本 (可從任何目錄運行)
# 檢查是否有敏感文件被意外提交到 Git

# 獲取腳本所在目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 開始 Git 安全檢查..."
echo "================================"
echo "📁 項目根目錄: $PROJECT_ROOT"
echo ""

# 切換到項目根目錄
cd "$PROJECT_ROOT" || {
    echo "❌ 無法切換到項目根目錄: $PROJECT_ROOT"
    exit 1
}

# 檢查是否有 .env 文件被追蹤
echo "📋 檢查環境變數文件..."
if git ls-files | grep -E "\.env$|\.env\."; then
    echo "❌ 警告：發現環境變數文件被 Git 追蹤！"
    echo "   這些文件包含敏感信息，應該立即移除："
    echo ""
    git ls-files | grep -E "\.env$|\.env\." | while read file; do
        echo "   - $file"
    done
    echo ""
    echo "🚨 緊急操作："
    echo "   1. 立即從 Git 中移除這些文件："
    echo "      git rm --cached .env*"
    echo "   2. 提交更改："
    echo "      git commit -m 'Remove sensitive environment files'"
    echo "   3. 檢查 .gitignore 是否正確配置"
    echo ""
    exit 1
else
    echo "✅ 沒有環境變數文件被 Git 追蹤"
fi

# 檢查 .gitignore 文件
echo ""
echo "📋 檢查 .gitignore 配置..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        echo "✅ .gitignore 包含 .env 模式"
    else
        echo "❌ .gitignore 缺少 .env 模式"
        echo "   建議添加："
        echo "   .env"
        echo "   .env.*"
    fi
else
    echo "❌ 根目錄缺少 .gitignore 文件"
    echo "   建議創建包含以下內容的 .gitignore："
    echo "   .env"
    echo "   .env.*"
    echo "   node_modules/"
fi

# 檢查子目錄的 .gitignore
echo ""
echo "📋 檢查子目錄 .gitignore..."
for dir in admin functions web; do
    if [ -d "$dir" ]; then
        if [ -f "$dir/.gitignore" ]; then
            if grep -q "\.env" "$dir/.gitignore"; then
                echo "✅ $dir/.gitignore 配置正確"
            else
                echo "⚠️  $dir/.gitignore 缺少 .env 保護"
            fi
        else
            echo "❌ $dir/ 目錄缺少 .gitignore 文件"
        fi
    fi
done

# 檢查是否有敏感信息在最近的提交中
echo ""
echo "📋 檢查最近提交中的敏感信息..."
if git log --oneline -10 | grep -i "env\|config\|secret\|key\|password\|token"; then
    echo "⚠️  發現可能包含敏感信息的提交"
    echo "   建議檢查這些提交的內容："
    git log --oneline -10 | grep -i "env\|config\|secret\|key\|password\|token"
else
    echo "✅ 最近提交中沒有發現明顯的敏感信息"
fi

# 檢查是否有大文件被提交
echo ""
echo "📋 檢查大文件..."
git ls-files | xargs ls -la 2>/dev/null | awk '$5 > 1000000 {print $5, $9}' | sort -nr | head -5 | while read size file; do
    if [ ! -z "$size" ]; then
        echo "⚠️  大文件：$file ($size bytes)"
    fi
done

echo ""
echo "================================"
echo "🔍 Git 安全檢查完成！"

# 提供安全建議
echo ""
echo "💡 安全建議："
echo "1. 永遠不要提交 .env 文件"
echo "2. 使用環境變數管理敏感信息"
echo "3. 定期檢查 .gitignore 配置"
echo "4. 如果發現敏感信息被提交，立即移除並更換密鑰"
echo "5. 使用 git-secrets 等工具進行自動檢查"
echo ""
echo "📚 更多信息請參考："
echo "   - ENVIRONMENT_SETUP.md"
echo "   - admin/ENVIRONMENT_SETUP.md"
echo "   - 各目錄下的 .gitignore 文件"
echo ""
echo "🔧 使用方法："
echo "   - 從任何目錄運行: $0"
echo "   - 或切換到項目目錄運行: ./check-git-security.sh"
