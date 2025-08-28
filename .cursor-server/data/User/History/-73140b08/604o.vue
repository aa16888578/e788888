<template>
  <ResponsiveLayout>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- 登入表單 -->
        <div class="card p-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              歡迎回來
            </h2>
            <p class="text-gray-600 mb-8">
              登入您的 ShopBot 帳戶
            </p>
          </div>

          <!-- 登入表單 -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- 電子郵件 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="input"
                :class="{ 'input-error': errors.email }"
                placeholder="輸入您的電子郵件"
                @blur="validateEmail"
              >
              <p v-if="errors.email" class="mt-1 text-sm text-error-600">
                {{ errors.email }}
              </p>
            </div>

            <!-- 密碼 -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pr-10"
                  :class="{ 'input-error': errors.password }"
                  placeholder="輸入您的密碼"
                  @blur="validatePassword"
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-error-600">
                {{ errors.password }}
              </p>
            </div>

            <!-- 記住我和忘記密碼 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                >
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  記住我
                </label>
              </div>
              
              <router-link 
                to="/forgot-password"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                忘記密碼？
              </router-link>
            </div>

            <!-- 登入按鈕 -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full btn btn-primary py-3 text-lg font-semibold"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
            >
              <svg v-if="isLoading" class="loading-spinner mr-2" viewBox="0 0 24 24"></svg>
              {{ isLoading ? '登入中...' : '登入' }}
            </button>

            <!-- 社交登入 -->
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">或使用</span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="socialLogin('google')"
                  class="w-full btn btn-outline py-3"
                >
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  @click="socialLogin('facebook')"
                  class="w-full btn btn-outline py-3"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            <!-- 註冊鏈接 -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                還沒有帳戶？
                <router-link 
                  to="/register"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  立即註冊
                </router-link>
              </p>
            </div>
          </form>
        </div>

        <!-- 額外信息 -->
        <div class="text-center">
          <p class="text-xs text-gray-500">
            登入即表示您同意我們的
            <router-link to="/terms" class="text-primary-600 hover:text-primary-700">
              服務條款
            </router-link>
            和
            <router-link to="/privacy" class="text-primary-600 hover:text-primary-700">
              隱私政策
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </ResponsiveLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ResponsiveLayout from '../components/ResponsiveLayout.vue'

export default {
  name: 'Login',
  components: {
    ResponsiveLayout
  },
  setup() {
    const router = useRouter()
    
    // 響應式狀態
    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    })
    
    const errors = reactive({
      email: '',
      password: ''
    })
    
    const isLoading = ref(false)
    const showPassword = ref(false)

    // 驗證方法
    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email) {
        errors.email = '請輸入電子郵件'
      } else if (!emailRegex.test(form.email)) {
        errors.email = '請輸入有效的電子郵件地址'
      } else {
        errors.email = ''
      }
    }

    const validatePassword = () => {
      if (!form.password) {
        errors.password = '請輸入密碼'
      } else if (form.password.length < 6) {
        errors.password = '密碼至少需要 6 個字符'
      } else {
        errors.password = ''
      }
    }

    const validateForm = () => {
      validateEmail()
      validatePassword()
      return !errors.email && !errors.password
    }

    // 登入處理
    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }

      isLoading.value = true

      try {
        // 模擬 API 調用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 這裡實現實際的登入邏輯
        console.log('登入表單數據:', form)
        
        // 登入成功後跳轉
        router.push('/')
        
      } catch (error) {
        console.error('登入失敗:', error)
        alert('登入失敗，請檢查您的憑證')
      } finally {
        isLoading.value = false
      }
    }

    // 社交登入
    const socialLogin = (provider) => {
      console.log('社交登入:', provider)
      // 這裡實現社交登入邏輯
      alert(`${provider} 登入功能開發中...`)
    }

    return {
      form,
      errors,
      isLoading,
      showPassword,
      validateEmail,
      validatePassword,
      handleLogin,
      socialLogin
    }
  }
}
</script>

<style scoped>
/* 響應式優化 */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
  }
  
  .card {
    @apply mx-4;
  }
}

/* 動畫優化 */
.card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 社交登入按鈕樣式 */
.btn-outline:hover {
  @apply bg-gray-50;
}

/* 加載狀態 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
