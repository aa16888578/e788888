# 🔐 ShopBot 安全檢查工具

本目錄包含 ShopBot 項目的 Git 安全檢查工具，幫助您保護敏感信息不被意外提交到版本控制中。

## 📁 文件說明

### 主要工具

- **`shopbot-security`** - 主要的安全檢查工具，支持多種選項
- **`check-security.sh`** - 基礎的安全檢查腳本
- **`install-security-tools.sh`** - 安裝腳本，將工具添加到系統 PATH

### 功能特性

- ✅ 檢查環境變數文件是否被 Git 追蹤
- ✅ 驗證 `.gitignore` 配置是否正確
- ✅ 掃描最近提交中的敏感信息
- ✅ 檢查大文件是否被意外提交
- ✅ 提供詳細的安全建議和解決方案

## 🚀 快速開始

### 1. 從項目根目錄運行

```bash
# 運行完整安全檢查
./scripts/shopbot-security

# 只檢查環境變數文件
./scripts/shopbot-security -e

# 只檢查 .gitignore 配置
./scripts/shopbot-security -g

# 顯示 Git 狀態
./scripts/shopbot-security -s

# 查看幫助信息
./scripts/shopbot-security --help
```

### 2. 安裝到系統（可選）

```bash
# 運行安裝腳本
./scripts/install-security-tools.sh

# 重新載入 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 現在可以從任何目錄運行
shopbot-security
shopbot-security --help
```

## 🔧 使用方法

### 基本命令

```bash
# 完整檢查
shopbot-security

# 檢查特定項目
shopbot-security -e          # 環境變數
shopbot-security -g          # .gitignore 配置
shopbot-security -s          # Git 狀態
shopbot-security -v          # 版本信息
```

### 選項說明

| 選項 | 長選項 | 說明 |
|------|--------|------|
| `-h` | `--help` | 顯示幫助信息 |
| `-c` | `--check` | 運行完整安全檢查 |
| `-e` | `--env` | 只檢查環境變數文件 |
| `-g` | `--git` | 只檢查 .gitignore 配置 |
| `-s` | `--status` | 顯示 Git 狀態 |
| `-v` | `--version` | 顯示版本信息 |

## 📋 檢查項目

### 1. 環境變數文件檢查

檢查是否有 `.env` 文件被 Git 追蹤：

```bash
shopbot-security -e
```

**安全標準：**
- ✅ 沒有 `.env` 文件被追蹤
- ❌ 發現 `.env` 文件被追蹤（需要立即處理）

### 2. .gitignore 配置檢查

檢查各目錄的 `.gitignore` 配置：

```bash
shopbot-security -g
```

**檢查目錄：**
- 根目錄 `.gitignore`
- `admin/.gitignore`
- `functions/.gitignore`
- `web/.gitignore`

### 3. Git 狀態檢查

顯示當前的 Git 狀態：

```bash
shopbot-security -s
```

**顯示信息：**
- 當前分支
- 最近提交
- 暫存區狀態
- 未追蹤文件

## 🛡️ 安全建議

### 日常使用

1. **每次提交前**：運行 `shopbot-security` 進行檢查
2. **每週檢查**：運行完整的安全檢查
3. **團隊協作**：確保所有成員都使用安全檢查工具

### 緊急情況

如果發現敏感信息被提交：

```bash
# 1. 立即撤銷提交
git reset --soft HEAD~1

# 2. 從 Git 中移除敏感文件
git rm --cached .env*

# 3. 提交更改
git commit -m "Remove sensitive environment files"

# 4. 強制推送（如果需要）
git push origin --force

# 5. 立即更換 API 金鑰
```

## 📚 相關文檔

- **`../ENVIRONMENT_SETUP.md`** - 環境變數設置指南
- **`../admin/ENVIRONMENT_SETUP.md`** - 管理後台環境設置
- **`../.gitignore`** - Git 忽略規則配置

## 🔍 故障排除

### 常見問題

1. **命令未找到**
   ```bash
   # 確保腳本有執行權限
   chmod +x scripts/shopbot-security
   
   # 或使用完整路徑
   ./scripts/shopbot-security
   ```

2. **權限不足**
   ```bash
   # 檢查腳本權限
   ls -la scripts/shopbot-security
   
   # 添加執行權限
   chmod +x scripts/shopbot-security
   ```

3. **路徑問題**
   ```bash
   # 確保在項目根目錄
   pwd
   
   # 應該顯示項目路徑
   ```

### 調試模式

```bash
# 顯示詳細信息
bash -x scripts/shopbot-security

# 檢查腳本語法
bash -n scripts/shopbot-security
```

## 🎯 最佳實踐

### 開發流程

1. **開始開發前**：運行安全檢查
2. **提交代碼前**：再次運行安全檢查
3. **部署前**：運行完整安全檢查
4. **定期檢查**：每週運行一次完整檢查

### 團隊協作

1. **統一配置**：所有成員使用相同的 `.gitignore`
2. **培訓團隊**：確保每個人都了解安全檢查的重要性
3. **自動化檢查**：考慮設置 Git 預提交鉤子

## 📞 需要幫助？

如果您在使用安全檢查工具時遇到問題：

1. 檢查本文件中的故障排除部分
2. 運行 `shopbot-security --help` 查看幫助
3. 檢查腳本權限和路徑設置
4. 查看項目的 `.gitignore` 配置

---

**記住：安全第一！定期運行安全檢查，保護您的敏感信息。**
