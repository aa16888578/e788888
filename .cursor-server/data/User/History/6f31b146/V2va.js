// PWA 服務管理
class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    
    this.init();
  }
  
  init() {
    // 監聽安裝提示事件
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });
    
    // 監聽應用安裝完成事件
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallPrompt();
      console.log('PWA 安裝成功');
    });
    
    // 監聽在線/離線狀態變化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.hideOfflineIndicator();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineIndicator();
    });
    
    // 檢查是否已經安裝
    this.checkInstallationStatus();
    
    // 檢查網絡狀態
    this.checkNetworkStatus();
  }
  
  // 檢查安裝狀態
  checkInstallationStatus() {
    // 檢查是否為獨立模式運行
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
    
    // 檢查是否為 iOS 主畫面應用
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
    }
  }
  
  // 檢查網絡狀態
  checkNetworkStatus() {
    if (!this.isOnline) {
      this.showOfflineIndicator();
    }
  }
  
  // 顯示安裝提示
  showInstallPrompt() {
    if (this.isInstalled) return;
    
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.classList.remove('hidden');
      
      // 綁定安裝按鈕事件
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.addEventListener('click', () => {
          this.installPWA();
        });
      }
      
      // 綁定稍後按鈕事件
      const dismissBtn = document.getElementById('pwa-dismiss-btn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          this.hideInstallPrompt();
        });
      }
    }
  }
  
  // 隱藏安裝提示
  hideInstallPrompt() {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.classList.add('hidden');
    }
  }
  
  // 安裝 PWA
  async installPWA() {
    if (!this.deferredPrompt) {
      console.log('無法安裝 PWA');
      return;
    }
    
    try {
      // 顯示安裝提示
      this.deferredPrompt.prompt();
      
      // 等待用戶響應
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用戶接受安裝 PWA');
      } else {
        console.log('用戶拒絕安裝 PWA');
      }
      
      // 清除提示
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      
    } catch (error) {
      console.error('安裝 PWA 時發生錯誤:', error);
    }
  }
  
  // 顯示離線指示器
  showOfflineIndicator() {
    let indicator = document.querySelector('.offline-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'offline-indicator';
      indicator.innerHTML = `
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          離線模式
        </div>
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.classList.remove('hidden');
  }
  
  // 隱藏離線指示器
  hideOfflineIndicator() {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }
  
  // 檢查更新
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdatePrompt();
              }
            });
          });
        }
      } catch (error) {
        console.error('檢查更新時發生錯誤:', error);
      }
    }
  }
  
  // 顯示更新提示
  showUpdatePrompt() {
    const updatePrompt = document.createElement('div');
    updatePrompt.className = 'fixed top-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-strong z-50';
    updatePrompt.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">有新版本可用</span>
        <button class="ml-3 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <button class="mt-2 w-full bg-white text-primary-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100" onclick="window.location.reload()">
        立即更新
      </button>
    `;
    
    document.body.appendChild(updatePrompt);
    
    // 5秒後自動隱藏
    setTimeout(() => {
      if (updatePrompt.parentElement) {
        updatePrompt.remove();
      }
    }, 5000);
  }
  
  // 獲取 PWA 狀態
  getPWAStatus() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      canInstall: !!this.deferredPrompt,
      displayMode: this.getDisplayMode()
    };
  }
  
  // 獲取顯示模式
  getDisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    } else if (window.navigator.standalone === true) {
      return 'standalone';
    } else {
      return 'browser';
    }
  }
  
  // 手動觸發安裝
  manualInstall() {
    if (this.deferredPrompt) {
      this.installPWA();
    } else {
      console.log('無法手動安裝 PWA');
    }
  }
  
  // 添加主畫面
  addToHomeScreen() {
    // iOS Safari 主畫面添加提示
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      this.showIOSInstallPrompt();
    } else {
      this.installPWA();
    }
  }
  
  // 顯示 iOS 安裝提示
  showIOSInstallPrompt() {
    const iosPrompt = document.createElement('div');
    iosPrompt.className = 'fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-strong border border-gray-200 p-4 z-50';
    iosPrompt.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">添加到主畫面</p>
          <p class="text-sm text-gray-500 mt-1">
            點擊分享按鈕，然後選擇「添加到主畫面」
          </p>
        </div>
        <button class="ml-3 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(iosPrompt);
    
    // 10秒後自動隱藏
    setTimeout(() => {
      if (iosPrompt.parentElement) {
        iosPrompt.remove();
      }
    }, 10000);
  }
}

// 創建 PWA 服務實例
const pwaService = new PWAService();

// 導出服務
export default pwaService;

// 全局使用
window.pwaService = pwaService;
