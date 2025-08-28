#!/usr/bin/env python3
"""
Firebase配置測試和啟動腳本
"""
import os
import sys
import json
from pathlib import Path

def check_firebase_config():
    """檢查Firebase配置"""
    print("🔍 檢查Firebase配置...")
    
    # 檢查服務帳戶文件
    service_account_path = Path("firebase-service-account.json")
    if service_account_path.exists():
        try:
            with open(service_account_path, 'r') as f:
                config = json.load(f)
            
            print("✅ 找到服務帳戶配置文件")
            print(f"   項目ID: {config.get('project_id', 'N/A')}")
            print(f"   客戶端郵箱: {config.get('client_email', 'N/A')}")
            print(f"   私鑰ID: {config.get('private_key_id', 'N/A')}")
            
            # 檢查必要字段
            required_fields = ['project_id', 'private_key', 'client_email']
            missing_fields = [field for field in required_fields if not config.get(field)]
            
            if missing_fields:
                print(f"❌ 缺少必要字段: {missing_fields}")
                return False
            
            # 檢查是否為模板值
            if "YOUR_ACTUAL_PRIVATE_KEY_HERE" in config.get('private_key', ''):
                print("❌ 私鑰仍然是模板值，請設置真實的私鑰")
                return False
            
            print("✅ Firebase配置檢查通過！")
            return True
            
        except Exception as e:
            print(f"❌ 讀取服務帳戶文件失敗: {e}")
            return False
    else:
        print("❌ 未找到服務帳戶配置文件")
        print("   請按照 FIREBASE_SETUP_GUIDE.md 的說明創建配置文件")
        return False

def check_env_config():
    """檢查環境變量配置"""
    print("\n🔍 檢查環境變量配置...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY', 
        'FIREBASE_CLIENT_EMAIL'
    ]
    
    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if var == 'FIREBASE_PRIVATE_KEY':
                print(f"✅ {var}: {'*' * 20}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: 未設置")
            all_set = False
    
    if not all_set:
        print("\n⚠️  請設置所有必要的環境變量")
        return False
    
    return True

def start_system():
    """啟動系統"""
    print("\n🚀 啟動CVV Bot管理後台...")
    
    try:
        # 導入並啟動主應用
        from main import app
        import uvicorn
        
        print("✅ 系統啟動成功！")
        print("🌐 管理後台: http://localhost:8000/static/admin_dashboard.html")
        print("📊 API文檔: http://localhost:8000/docs")
        print("🔧 健康檢查: http://localhost:8000/health")
        
        # 啟動服務
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except Exception as e:
        print(f"❌ 系統啟動失敗: {e}")
        print("\n🔧 故障排除建議:")
        print("1. 檢查Firebase配置是否正確")
        print("2. 確認所有依賴包已安裝")
        print("3. 查看錯誤日誌獲取詳細信息")
        return False
    
    return True

def main():
    """主函數"""
    print("🚀 CVV Bot Firebase配置檢查和啟動工具")
    print("=" * 50)
    
    # 檢查Firebase配置
    if not check_firebase_config():
        print("\n❌ Firebase配置檢查失敗")
        print("請按照 FIREBASE_SETUP_GUIDE.md 的說明修復配置")
        return
    
    # 檢查環境變量
    if not check_env_config():
        print("\n❌ 環境變量檢查失敗")
        print("請設置 .env 文件中的必要變量")
        return
    
    print("\n✅ 所有配置檢查通過！")
    
    # 詢問是否啟動系統
    try:
        choice = input("\n是否現在啟動系統？(y/n): ").lower().strip()
        if choice in ['y', 'yes', '是']:
            start_system()
        else:
            print("👋 配置完成！你可以稍後手動啟動系統")
            print("啟動命令: python3 main.py")
    except KeyboardInterrupt:
        print("\n👋 操作已取消")

if __name__ == "__main__":
    main()
