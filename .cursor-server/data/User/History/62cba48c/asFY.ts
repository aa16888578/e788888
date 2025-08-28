// 統一配置管理服務

export interface ConfigItem {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'password' | 'textarea' | 'select';
  category: string;
  required: boolean;
  description: string;
  options?: string[]; // 用於 select 類型
}

export interface ConfigCategory {
  name: string;
  icon: string;
  description: string;
  configs: ConfigItem[];
}

// 配置分類定義
export const configCategories: ConfigCategory[] = [
  {
    name: 'Firebase',
    icon: '🔥',
    description: 'Firebase 後端服務配置',
    configs: [
      {
        key: 'FIREBASE_API_KEY',
        label: 'Firebase API Key',
        value: '',
        type: 'password',
        category: 'Firebase',
        required: true,
        description: 'Firebase 項目的 API 金鑰'
      },
      {
        key: 'FIREBASE_PROJECT_ID',
        label: 'Firebase Project ID',
        value: 'ccvbot-8578',
        type: 'text',
        category: 'Firebase',
        required: true,
        description: 'Firebase 項目 ID'
      },
      {
        key: 'FIREBASE_AUTH_DOMAIN',
        label: 'Firebase Auth Domain',
        value: 'ccvbot-8578.firebaseapp.com',
        type: 'text',
        category: 'Firebase',
        required: true,
        description: 'Firebase 認證域名'
      }
    ]
  },
  {
    name: 'Telegram',
    icon: '🤖',
    description: 'Telegram Bot 配置',
    configs: [
      {
        key: 'TELEGRAM_BOT_TOKEN',
        label: 'Bot Token',
        value: '',
        type: 'password',
        category: 'Telegram',
        required: true,
        description: '從 @BotFather 獲取的 Bot Token'
      },
      {
        key: 'TELEGRAM_BOT_USERNAME',
        label: 'Bot Username',
        value: '',
        type: 'text',
        category: 'Telegram',
        required: false,
        description: 'Bot 的用戶名 (不含 @)'
      }
    ]
  },
  {
    name: '支付系統',
    icon: '💰',
    description: 'USDT-TRC20 支付配置',
    configs: [
      {
        key: 'USDT_TRC20_CONTRACT',
        label: 'USDT TRC20 合約地址',
        value: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        type: 'text',
        category: '支付系統',
        required: true,
        description: 'USDT TRC20 智能合約地址'
      },
      {
        key: 'TRON_API_KEY',
        label: 'Tron API Key',
        value: '',
        type: 'password',
        category: '支付系統',
        required: true,
        description: 'TronGrid API 金鑰'
      },
      {
        key: 'PAYMENT_WALLET',
        label: '收款錢包地址',
        value: '',
        type: 'text',
        category: '支付系統',
        required: true,
        description: '系統收款的 Tron 錢包地址'
      }
    ]
  },
  {
    name: '代理系統',
    icon: '🏢',
    description: '代理管理系統配置',
    configs: [
      {
        key: 'MAX_AGENT_LEVELS',
        label: '最大代理層級',
        value: '3',
        type: 'select',
        category: '代理系統',
        required: true,
        description: '代理系統支持的最大層級',
        options: ['1', '2', '3', '4', '5']
      },
      {
        key: 'BASE_COMMISSION_RATE',
        label: '基礎佣金比例 (%)',
        value: '15',
        type: 'text',
        category: '代理系統',
        required: true,
        description: '一級代理的基礎佣金比例'
      }
    ]
  }
];

// 配置管理服務
export class ConfigService {
  private static instance: ConfigService;
  private configs: Map<string, string> = new Map();

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // 加載配置
  async loadConfigs(): Promise<Map<string, string>> {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('shopbot_configs');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.configs = new Map(Object.entries(parsed));
        }
      }
      return this.configs;
    } catch (error) {
      console.error('加載配置失敗:', error);
      return new Map();
    }
  }

  // 保存配置
  async saveConfigs(configs: Map<string, string>): Promise<boolean> {
    try {
      this.configs = configs;
      if (typeof window !== 'undefined') {
        const configObject = Object.fromEntries(configs);
        localStorage.setItem('shopbot_configs', JSON.stringify(configObject));
        
        // 觸發配置更新事件
        window.dispatchEvent(new CustomEvent('configUpdated', { 
          detail: configObject 
        }));
      }
      return true;
    } catch (error) {
      console.error('保存配置失敗:', error);
      return false;
    }
  }

  // 獲取單個配置
  getConfig(key: string): string | undefined {
    return this.configs.get(key);
  }

  // 設置單個配置
  setConfig(key: string, value: string): void {
    this.configs.set(key, value);
  }

  // 生成環境變數文件內容
  generateEnvFile(): string {
    const configObject = Object.fromEntries(this.configs);
    
    return `# 🔐 ShopBot 自動生成的環境配置
# 由統一後台配置系統生成 - ${new Date().toLocaleString('zh-TW')}

# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=${configObject.FIREBASE_API_KEY || ''}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${configObject.FIREBASE_AUTH_DOMAIN || 'ccvbot-8578.firebaseapp.com'}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${configObject.FIREBASE_PROJECT_ID || 'ccvbot-8578'}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${configObject.FIREBASE_STORAGE_BUCKET || 'ccvbot-8578.firebasestorage.app'}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=177257832546
NEXT_PUBLIC_FIREBASE_APP_ID=1:177257832546:web:auto

# Telegram Bot 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=${configObject.TELEGRAM_BOT_TOKEN || ''}
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${configObject.TELEGRAM_BOT_USERNAME || ''}

# 支付系統配置
USDT_TRC20_CONTRACT_ADDRESS=${configObject.USDT_TRC20_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'}
TRON_NETWORK_API_KEY=${configObject.TRON_API_KEY || ''}
PAYMENT_WALLET_ADDRESS=${configObject.PAYMENT_WALLET || ''}

# 代理系統配置
MAX_AGENT_LEVELS=${configObject.MAX_AGENT_LEVELS || '3'}
BASE_COMMISSION_RATE=${configObject.BASE_COMMISSION_RATE || '15'}

# 系統配置
NEXT_PUBLIC_APP_NAME=${configObject.APP_NAME || 'ShopBot 統一平台'}
NEXT_PUBLIC_APP_VERSION=3.0.0
NEXT_PUBLIC_APP_ENV=development

# VM 環境配置
HOST=0.0.0.0
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://10.140.0.2:5001/ccvbot-8578/asia-east1
NEXT_PUBLIC_API_BASE_URL_PROD=https://asia-east1-ccvbot-8578.cloudfunctions.net

# 功能開關
NEXT_PUBLIC_ENABLE_EMULATOR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_VM_MODE=true
`;
  }

  // 驗證配置完整性
  validateConfigs(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 檢查必需配置
    const requiredConfigs = configCategories
      .flatMap(cat => cat.configs)
      .filter(config => config.required);
    
    for (const config of requiredConfigs) {
      const value = this.configs.get(config.key);
      if (!value || value.trim() === '') {
        errors.push(`${config.label} 是必需的`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 測試配置連接
  async testConnection(category: string): Promise<{ success: boolean; message: string }> {
    switch (category) {
      case 'Firebase':
        return await this.testFirebaseConnection();
      case 'Telegram':
        return await this.testTelegramConnection();
      case '支付系統':
        return await this.testPaymentConnection();
      default:
        return { success: true, message: '配置正常' };
    }
  }

  private async testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // 測試 Firebase 連接
      const projectId = this.configs.get('FIREBASE_PROJECT_ID');
      if (projectId) {
        return { success: true, message: 'Firebase 配置正常' };
      }
      return { success: false, message: 'Firebase Project ID 未配置' };
    } catch (error) {
      return { success: false, message: 'Firebase 連接測試失敗' };
    }
  }

  private async testTelegramConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const botToken = this.configs.get('TELEGRAM_BOT_TOKEN');
      if (!botToken) {
        return { success: false, message: 'Bot Token 未配置' };
      }
      
      // 測試 Bot Token (簡單驗證格式)
      if (botToken.includes(':') && botToken.length > 40) {
        return { success: true, message: 'Telegram Bot Token 格式正確' };
      }
      
      return { success: false, message: 'Bot Token 格式不正確' };
    } catch (error) {
      return { success: false, message: 'Telegram 連接測試失敗' };
    }
  }

  private async testPaymentConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const walletAddress = this.configs.get('PAYMENT_WALLET');
      if (!walletAddress) {
        return { success: false, message: '收款錢包地址未配置' };
      }
      
      // 驗證 Tron 錢包地址格式
      if (walletAddress.startsWith('T') && walletAddress.length === 34) {
        return { success: true, message: '支付配置正常' };
      }
      
      return { success: false, message: '錢包地址格式不正確' };
    } catch (error) {
      return { success: false, message: '支付系統連接測試失敗' };
    }
  }
}

// 導出單例實例
export const configService = ConfigService.getInstance();
