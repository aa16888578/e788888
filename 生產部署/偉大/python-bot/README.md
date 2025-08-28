# 🤖 CVV Python Bot - 完整生態系統

> **版本**: v5.0.0  
> **狀態**: ✅ 部署就緒  
> **最後更新**: 2025-01-27

## 🎯 系統概覽

CVV Python Bot 是一個完整的 Telegram 機器人生態系統，專為 CVV 卡片交易、代理商管理和支付處理而設計。

### ✨ 核心特色

- 🤖 **完整的 Telegram Bot** - 15+ 種內嵌鍵盤交互
- 👑 **5級代理商系統** - 銅牌🥉 到 鑽石💎✨ 完整等級
- 💰 **USDT-TRC20 支付** - 自動區塊鏈監控和確認
- 🔥 **後台配置管理** - 動態環境變數，無需 .env 檔案
- 📱 **現代化前端** - 響應式支付介面
- 🔒 **企業級安全** - 數據加密和權限控制

## 📁 項目結構

```
python-bot/
├── main.py                          # FastAPI 主應用程序
├── start.py                         # 系統啟動腳本
├── test_system.py                   # 系統測試腳本
├── requirements.txt                 # Python 依賴包
├── env.example                      # 環境變數範例
├── DEPLOYMENT_READY.md              # 部署說明
├── SETUP_INSTRUCTIONS.md           # 設置指南
├── app/
│   ├── core/
│   │   └── config.py               # 動態配置管理
│   ├── services/
│   │   ├── firebase_service.py     # Firebase 數據庫服務
│   │   ├── config_service.py       # 後台配置服務
│   │   ├── keyboard_service.py     # 內嵌鍵盤服務
│   │   ├── agent_service.py        # 代理商權限系統
│   │   └── payment_service.py      # 支付系統服務
│   ├── api/
│   │   ├── telegram_api.py         # Telegram Bot API
│   │   ├── config_api.py           # 配置管理 API
│   │   └── payment_api.py          # 支付系統 API
│   ├── bot/
│   │   └── telegram_bot.py         # Bot 消息處理器
│   └── models/
│       ├── cvv.py                  # SQLAlchemy 數據模型
│       └── pydantic_models.py      # API 數據模型
└── ../web/src/app/payment/page.tsx  # 前端支付介面
```

## 🚀 快速開始

### 1. 環境準備
```bash
# 安裝 Python 3.8+
sudo apt update && sudo apt install python3 python3-pip python3-venv

# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate

# 安裝依賴
pip install -r requirements.txt
```

### 2. 配置設置
```bash
# 複製環境變數範例
cp env.example .env

# 編輯配置（部署後您會提供實際值）
nano .env
```

### 3. 啟動系統
```bash
# 完整啟動（API 服務器 + Telegram Bot）
python3 start.py

# 或僅啟動 API 服務器
python3 main.py
```

### 4. 驗證部署
```bash
# 健康檢查
curl http://localhost:8000/health

# 系統狀態
curl http://localhost:8000/api/status
```

## 🔧 API 端點

### Telegram Bot API (`/api/telegram/`)
- `POST /welcome` - 發送歡迎消息
- `GET /all_cards` - 獲取所有 CVV 卡片
- `GET /balance_check` - 查詢用戶餘額
- `POST /buy_card` - 購買 CVV 卡片

### 支付系統 API (`/api/payment/`)
- `POST /create` - 創建支付訂單
- `GET /status/{order_id}` - 查詢支付狀態
- `GET /history/{user_id}` - 獲取支付歷史
- `POST /withdraw` - 申請提現

### 配置管理 API (`/api/admin/`)
- `GET /configs` - 獲取所有配置
- `POST /configs` - 創建/更新配置
- `GET /configs/status` - 配置狀態檢查

## 🤖 Telegram Bot 功能

### 主選單
- 🌍 **全資庫** - 瀏覽所有可用卡片
- 📚 **課資庫** - 課程相關資源
- 💎 **特價庫** - 特價商品展示
- 🔥 **商家基地** - 代理商功能中心
- 💰 **充值** - USDT-TRC20 充值
- 📊 **餘額查詢** - 用戶餘額管理

### 代理商功能
- 📈 **代理統計** - 銷售和收益數據
- 👥 **團隊管理** - 下級代理管理
- 💰 **收益查詢** - 佣金和獎金查詢
- 🏆 **等級升級** - 自動等級晉升
- 🔗 **推薦鏈接** - 推薦碼管理

### 支付功能
- 💵 **預設金額** - $10, $50, $100, $500, $1000
- 💎 **自定義金額** - 靈活金額設置
- 📋 **地址複製** - 一鍵複製支付地址
- ✅ **支付確認** - 自動區塊鏈監控
- 📱 **QR 碼支付** - 移動端友好

## 👑 代理商等級系統

| 等級 | 名稱 | 圖標 | 佣金率 | 升級要求 |
|------|------|------|--------|----------|
| 1 | 銅牌代理 | 🥉 | 5% | 起始等級 |
| 2 | 銀牌代理 | 🥈 | 8% | 銷售額 $1,000 |
| 3 | 金牌代理 | 🥇 | 12% | 銷售額 $5,000 |
| 4 | 鉑金代理 | 💎 | 15% | 銷售額 $20,000 |
| 5 | 鑽石代理 | 💎✨ | 18% | 銷售額 $50,000 |

## 💰 支付系統特色

### USDT-TRC20 支持
- ⚡ **快速確認** - 1-3 個區塊確認
- 💸 **低手續費** - TRON 網絡優勢
- 🔄 **自動監控** - 實時區塊鏈掃描
- 📱 **移動友好** - QR 碼和深度鏈接

### 安全特性
- 🔒 **數據加密** - AES-256-CBC 加密
- 🛡️ **權限控制** - 多級權限驗證
- 📝 **審計日誌** - 完整操作記錄
- 🔐 **安全密鑰** - 環境變數保護

## 📊 監控和維護

### 系統監控
- 📈 **健康檢查** - `/health` 端點
- 📊 **系統狀態** - 詳細狀態報告
- 🔍 **日誌記錄** - 結構化日誌輸出
- ⚠️ **錯誤追蹤** - 完整錯誤堆疊

### 維護工具
- 🧪 **測試腳本** - `test_system.py`
- 🔧 **配置管理** - 動態配置更新
- 📋 **數據備份** - Firebase 自動備份
- 🔄 **系統重啟** - 優雅重啟機制

## 🌐 部署選項

### 本地部署
```bash
python3 start.py
```

### Docker 部署
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python3", "start.py"]
```

### 雲端部署
- **Google Cloud Run** - 容器化部署
- **AWS EC2** - 虛擬機部署
- **DigitalOcean** - 雲端服務器
- **Heroku** - PaaS 部署

## 📞 部署後支持

部署完成後，請聯繫提供：

1. **Firebase 服務帳號配置**
2. **Telegram Bot Token 和設置**
3. **部署環境信息**

我將協助您完成最終配置和系統測試！

---

**🎉 系統完成度: 100%**  
**🚀 部署狀態: 就緒**  
**📱 功能模組: 全部完成**  

> 這是一個完整的企業級 Telegram Bot 生態系統，包含所有必要的功能模組和安全特性。系統已準備就緒，等待部署後的最終配置。
