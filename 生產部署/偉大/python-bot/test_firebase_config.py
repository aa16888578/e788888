#!/usr/bin/env python3
"""
測試Firebase配置
"""
import os
from dotenv import load_dotenv

# 載入環境變量
load_dotenv()

def test_firebase_config():
    """測試Firebase配置"""
    print("🔍 檢查Firebase配置...")
    
    # 檢查必要的環境變量
    required_vars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY', 
        'FIREBASE_CLIENT_EMAIL'
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if var == 'FIREBASE_PRIVATE_KEY':
                # 隱藏私鑰內容
                print(f"✅ {var}: {'*' * 20}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: 未設置")
    
    # 檢查是否為示例配置
    project_id = os.getenv('FIREBASE_PROJECT_ID', '')
    private_key = os.getenv('FIREBASE_PRIVATE_KEY', '')
    client_email = os.getenv('FIREBASE_CLIENT_EMAIL', '')
    
    if (project_id == "your_firebase_project_id" or 
        "Your private key here" in private_key or
        "firebase-adminsdk-xxxxx" in client_email):
        print("\n⚠️  檢測到示例配置！")
        print("請設置真實的Firebase配置值")
        return False
    
    print("\n✅ Firebase配置檢查完成")
    return True

if __name__ == "__main__":
    test_firebase_config()
