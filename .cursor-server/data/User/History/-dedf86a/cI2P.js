import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 導入 PWA 服務
import pwaService from './services/pwa'

// 創建應用實例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)

// 全局屬性
app.config.globalProperties.$pwa = pwaService

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 錯誤:', err, info)
}

// 全局警告處理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue 警告:', msg, trace)
}

// 掛載應用
app.mount('#app')

// 開發環境下的調試信息
if (import.meta.env.DEV) {
  console.log('ShopBot MiniWeb 開發模式')
  console.log('PWA 狀態:', pwaService.getPWAStatus())
}

// 生產環境下的性能監控
if (import.meta.env.PROD) {
  // 性能監控
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        console.log('頁面加載性能:', {
          DNS查詢: perfData.domainLookupEnd - perfData.domainLookupStart,
          連接建立: perfData.connectEnd - perfData.connectStart,
          請求響應: perfData.responseEnd - perfData.requestStart,
          DOM解析: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          頁面完全加載: perfData.loadEventEnd - perfData.loadEventStart
        })
      }, 0)
    })
  }
  
  // 錯誤監控
  window.addEventListener('error', (event) => {
    console.error('JavaScript 錯誤:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })
  
  // 未處理的 Promise 拒絕
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason)
  })
}
