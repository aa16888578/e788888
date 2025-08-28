# 🔧 GMS 管理後台環境配置指南

## 📋 概述

本文檔說明如何配置 GMS 信用卡管理後台的環境變數和相關設置。

## 🚀 快速開始

### 1. 複製環境配置文件
```bash
# 在 admin 目錄下
cp env.example .env.local
```

### 2. 編輯 .env.local 文件
根據您的實際配置修改環境變數值。

## 🔑 必需配置

### Firebase 配置
```bash
# 前端 Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# 服務端 Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### 安全配置
```bash
# JWT 密鑰
JWT_SECRET=your-jwt-secret-key-here

# 管理員認證
ADMIN_EMAIL=admin@gms.com
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=your-session-secret
```

## 🔧 詳細配置說明

### Next.js 配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `NODE_ENV` | 運行環境 | `development`, `production` |
| `NEXT_TELEMETRY_DISABLED` | 禁用遙測 | `1` |

### 應用配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `NEXT_PUBLIC_APP_NAME` | 應用名稱 | `GMS 信用卡管理後台` |
| `NEXT_PUBLIC_APP_VERSION` | 應用版本 | `1.0.0` |
| `NEXT_PUBLIC_APP_ENV` | 應用環境 | `development`, `production` |

### Firebase 配置
| 變數 | 說明 | 獲取方式 |
|------|------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 密鑰 | Firebase Console → 項目設置 → 一般 → Web API 密鑰 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 認證域名 | `your-project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 項目 ID | Firebase Console → 項目設置 → 一般 → 項目 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 存儲桶 | `your-project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 消息發送者 ID | Firebase Console → 項目設置 → 雲端消息傳遞 → 發送者 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 應用 ID | Firebase Console → 項目設置 → 一般 → 應用 ID |

### Firebase Admin SDK 配置
| 變數 | 說明 | 獲取方式 |
|------|------|----------|
| `FIREBASE_PROJECT_ID` | Firebase 項目 ID | 同上 |
| `FIREBASE_PRIVATE_KEY_ID` | 私鑰 ID | 服務帳戶金鑰 JSON 文件 |
| `FIREBASE_PRIVATE_KEY` | 私鑰 | 服務帳戶金鑰 JSON 文件 |
| `FIREBASE_CLIENT_EMAIL` | 客戶端郵箱 | 服務帳戶金鑰 JSON 文件 |
| `FIREBASE_CLIENT_ID` | 客戶端 ID | 服務帳戶金鑰 JSON 文件 |

### 數據庫配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `FIRESTORE_DATABASE_URL` | Firestore 數據庫 URL | `https://your-project-id.firebaseio.com` |
| `FIRESTORE_PROJECT_ID` | Firestore 項目 ID | `your-project-id` |

### 認證配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `JWT_SECRET` | JWT 簽名密鑰 | 隨機生成的長字符串 |
| `JWT_EXPIRES_IN` | JWT 過期時間 | `24h`, `7d` |
| `ADMIN_EMAIL` | 管理員郵箱 | `admin@gms.com` |
| `ADMIN_PASSWORD` | 管理員密碼 | 強密碼 |
| `ADMIN_SESSION_SECRET` | 會話密鑰 | 隨機生成的長字符串 |

### AI 服務配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `AI_SERVICE_ENDPOINT` | AI 服務端點 | `https://your-ai-service.com/api` |
| `AI_SERVICE_API_KEY` | AI 服務 API 密鑰 | 您的 AI 服務密鑰 |
| `AI_MODEL_VERSION` | AI 模型版本 | `1.0.0` |

### 安全配置
| 變數 | 說明 | 示例值 |
|------|------|--------|
| `NEXT_PUBLIC_ALLOWED_ORIGINS` | 允許的 CORS 域名 | `http://localhost:3000,https://your-domain.com` |
| `ALLOWED_ADMIN_IPS` | 允許的管理員 IP | `127.0.0.1,::1` |

## 📁 配置文件位置

### 開發環境
- 主要配置: `.env.local`
- 示例配置: `env.example`

### 生產環境
- 主要配置: `.env.production`
- 備用配置: `.env`

## 🔐 安全注意事項

### 1. 私鑰保護
- 永遠不要將私鑰提交到版本控制
- 使用環境變數存儲敏感信息
- 定期輪換密鑰

### 2. 環境變數管理
```bash
# 正確做法
echo "FIREBASE_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> .env.local

# 錯誤做法
echo "FIREBASE_PRIVATE_KEY=actual-private-key" >> .env.local
```

### 3. 生產環境安全
- 使用強密碼
- 啟用 HTTPS
- 配置防火牆規則
- 定期安全審計

## 🚀 部署配置

### 開發環境
```bash
# 複製配置
cp env.example .env.local

# 編輯配置
nano .env.local

# 啟動開發服務器
npm run dev
```

### 生產環境
```bash
# 複製生產配置
cp env.example .env.production

# 編輯生產配置
nano .env.production

# 構建和啟動
npm run build
npm start
```

## 🔍 故障排除

### 常見問題

#### 1. Firebase 連接失敗
```bash
# 檢查配置
echo $FIREBASE_PROJECT_ID
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID

# 檢查服務帳戶權限
# 確保服務帳戶有適當的 Firestore 權限
```

#### 2. 環境變數未生效
```bash
# 重啟服務器
npm run dev

# 檢查文件位置
ls -la .env*

# 檢查變數名稱
grep -r "FIREBASE" .env*
```

#### 3. 權限錯誤
```bash
# 檢查 Firebase 規則
# 確保服務帳戶有讀寫權限

# 檢查 IP 白名單
echo $ALLOWED_ADMIN_IPS
```

## 📚 相關文檔

- [Firebase 配置指南](../ENVIRONMENT_SETUP.md)
- [Next.js 環境變數](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 📞 支持

如果遇到配置問題，請檢查：
1. 環境變數是否正確設置
2. Firebase 項目配置是否正確
3. 服務帳戶權限是否足夠
4. 網絡連接是否正常

---

**注意**: 請確保所有敏感信息都通過環境變數管理，不要硬編碼在代碼中。
