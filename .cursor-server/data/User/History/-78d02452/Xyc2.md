# 🖥️ ShopBot VM 環境設置指南

## 📋 **VM 環境概況**

### **系統信息**
- **操作系統**: Linux 6.14.0-1014-gcp
- **Shell**: /bin/bash
- **Node.js**: v22.18.0
- **npm**: v10.9.3
- **工作目錄**: /home/a0928997578_gmail_com/偉大

### **網絡配置**
- **內部 IP**: 10.140.0.2
- **外部訪問**: 需要防火牆規則
- **端口配置**: 3000 (Next.js), 5001 (Functions)

---

## 🚀 **快速啟動**

### **方法 1: 使用啟動腳本**
```bash
cd 偉大
./start-vm.sh
```

### **方法 2: 手動啟動**
```bash
# 啟動 Firebase Functions
cd 偉大/functions
npm run serve &

# 啟動 Next.js 前端
cd ../web
HOST=0.0.0.0 npm run dev &
```

---

## 🌐 **訪問地址**

### **開發環境**
- **前端**: http://10.140.0.2:3000
- **Functions**: http://10.140.0.2:5001
- **本地**: http://localhost:3000

### **頁面導航**
- **主頁**: http://10.140.0.2:3000/
- **管理後台**: http://10.140.0.2:3000/admin
- **Telegram 管理**: http://10.140.0.2:3000/telegram
- **系統狀態**: http://10.140.0.2:3000/status
- **支付管理**: http://10.140.0.2:3000/payments
- **代理管理**: http://10.140.0.2:3000/agents

---

## 🔧 **VM 環境特殊配置**

### **Next.js 配置**
```typescript
// next.config.ts
const nextConfig = {
  server: {
    host: '0.0.0.0', // 允許外部訪問
    port: 3000,
  },
  outputFileTracingRoot: '/home/a0928997578_gmail_com/偉大/web',
  eslint: {
    ignoreDuringBuilds: true, // VM 環境跳過 lint
  },
  typescript: {
    ignoreBuildErrors: true, // VM 環境跳過 TS 錯誤
  },
};
```

### **Firebase 配置**
```typescript
// VM 環境 Firebase 配置
const firebaseConfig = {
  projectId: 'ccvbot-8578',
  // 使用模擬器
  emulator: {
    firestore: 'localhost:8080',
    auth: 'localhost:9099',
    functions: '10.140.0.2:5001',
  }
};
```

---

## 📊 **當前狀態**

### **✅ 已完成**
- [x] Next.js 應用創建
- [x] Firebase Functions 基礎配置
- [x] API 連接埠創建
- [x] VM 網絡配置
- [x] 多平台界面結構

### **🔄 進行中**
- [ ] 複雜服務邏輯修復
- [ ] Tailwind CSS 4 兼容性
- [ ] Firebase 實際配置

### **❌ 待完成**
- [ ] Telegram Bot Token 配置
- [ ] 支付系統配置
- [ ] 生產環境部署

---

## 🛠️ **故障排除**

### **常見問題**

#### **1. 端口被占用**
```bash
# 檢查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :5001

# 殺死進程
kill -9 <PID>
```

#### **2. 防火牆問題**
```bash
# 檢查防火牆狀態
sudo ufw status

# 開放端口 (如果需要)
sudo ufw allow 3000
sudo ufw allow 5001
```

#### **3. Node.js 版本問題**
```bash
# 切換 Node.js 版本
nvm use 20
nvm use 18
```

---

## 🎯 **開發建議**

### **VM 環境優化**
1. **跳過構建檢查**: 已配置跳過 TypeScript 和 ESLint 錯誤
2. **網絡配置**: 已設置 0.0.0.0 監聽所有接口
3. **模擬器優先**: 使用 Firebase 模擬器進行開發
4. **簡化配置**: 減少不必要的依賴和配置

### **開發流程**
1. **先運行前端**: 確認界面正常
2. **再啟動後端**: 測試 API 連接
3. **逐步集成**: 一個功能一個功能測試
4. **最後部署**: 確認所有功能正常後部署

---

## 📱 **外部訪問**

如果需要從外部訪問 VM：
1. **配置 GCP 防火牆規則**
2. **開放端口 3000, 5001**
3. **使用外部 IP 訪問**

---

**VM 環境狀態**: 配置完成，可以運行 🚀  
**最後更新**: 2025-08-26  
**版本**: VM 專用版本  

這份 VM 環境設置指南提供了在虛擬機環境中運行 ShopBot 的完整配置和啟動方法。
