<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 響應式導航欄 -->
    <nav class="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-40">
      <div class="container-responsive">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span class="text-xl font-bold text-gray-900 hidden sm:block">ShopBot</span>
            </router-link>
          </div>

          <!-- 桌面端導航 -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link 
              v-for="item in navigationItems" 
              :key="item.path"
              :to="item.path"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="{ 'text-primary-600': $route.path === item.path }"
            >
              {{ item.name }}
            </router-link>
          </div>

          <!-- 右側操作區 -->
          <div class="flex items-center space-x-4">
            <!-- 搜索按鈕 (移動端) -->
            <button 
              @click="showSearch = true"
              class="md:hidden p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- 購物車 -->
            <router-link 
              to="/cart"
              class="relative p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <span 
                v-if="cartItemCount > 0"
                class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </span>
            </router-link>

            <!-- 用戶菜單 -->
            <div class="relative">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="hidden sm:block text-sm font-medium">用戶</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- 用戶下拉菜單 -->
              <div 
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-strong border border-gray-200 py-1 z-50"
              >
                <router-link 
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  個人資料
                </router-link>
                <router-link 
                  to="/orders"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  我的訂單
                </router-link>
                <router-link 
                  to="/favorites"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  收藏商品
                </router-link>
                <hr class="my-1">
                <button 
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  登出
                </button>
              </div>
            </div>

            <!-- 移動端菜單按鈕 -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 移動端導航菜單 -->
      <div 
        v-if="showMobileMenu"
        class="md:hidden border-t border-gray-100 bg-white"
      >
        <div class="px-4 py-2 space-y-1">
          <router-link 
            v-for="item in navigationItems" 
            :key="item.path"
            :to="item.path"
            @click="showMobileMenu = false"
            class="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-md text-base font-medium transition-colors duration-200"
            :class="{ 'text-primary-600 bg-primary-50': $route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 搜索彈窗 -->
    <div 
      v-if="showSearch"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      @click="showSearch = false"
    >
      <div 
        class="bg-white rounded-lg shadow-strong w-full max-w-md mx-4"
        @click.stop
      >
        <div class="p-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索商品..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @keyup.enter="performSearch"
            >
            <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="mt-3 flex space-x-2">
            <button 
              @click="performSearch"
              class="flex-1 btn btn-primary"
            >
              搜索
            </button>
            <button 
              @click="showSearch = false"
              class="flex-1 btn btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <main class="flex-1">
      <slot></slot>
    </main>

    <!-- 響應式頁腳 -->
    <footer class="bg-white border-t border-gray-100 mt-auto">
      <div class="container-responsive">
        <div class="py-8">
          <div class="grid-responsive grid-cols-responsive">
            <!-- 品牌信息 -->
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span class="text-lg font-bold text-gray-900">ShopBot</span>
              </div>
              <p class="text-sm text-gray-600">
                輕量級電商購物體驗，隨時隨地享受購物樂趣。
              </p>
            </div>

            <!-- 快速鏈接 -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-900">快速鏈接</h3>
              <ul class="space-y-2">
                <li>
                  <router-link to="/products" class="text-sm text-gray-600 hover:text-primary-600">
                    所有商品
                  </router-link>
                </li>
                <li>
                  <router-link to="/categories" class="text-sm text-gray-600 hover:text-primary-600">
                    商品分類
                  </router-link>
                </li>
                <li>
                  <router-link to="/deals" class="text-sm text-gray-600 hover:text-primary-600">
                    特價優惠
                  </router-link>
                </li>
              </ul>
            </div>

            <!-- 客戶服務 -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-900">客戶服務</h3>
              <ul class="space-y-2">
                <li>
                  <router-link to="/help" class="text-sm text-gray-600 hover:text-primary-600">
                    幫助中心
                  </router-link>
                </li>
                <li>
                  <router-link to="/contact" class="text-sm text-gray-600 hover:text-primary-600">
                    聯繫我們
                  </router-link>
                </li>
                <li>
                  <router-link to="/shipping" class="text-sm text-gray-600 hover:text-primary-600">
                    配送信息
                  </router-link>
                </li>
              </ul>
            </div>

            <!-- 聯繫方式 -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-900">聯繫方式</h3>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">
                  <svg class="inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  support@shopbot.com
                </p>
                <p class="text-sm text-gray-600">
                  <svg class="inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
                  </svg>
                  在線客服
                </p>
              </div>
            </div>
          </div>

          <!-- 底部信息 -->
          <div class="mt-8 pt-8 border-t border-gray-100">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p class="text-sm text-gray-600">
                © 2024 ShopBot. 保留所有權利。
              </p>
              <div class="flex space-x-6">
                <router-link to="/privacy" class="text-sm text-gray-600 hover:text-primary-600">
                  隱私政策
                </router-link>
                <router-link to="/terms" class="text-sm text-gray-600 hover:text-primary-600">
                  服務條款
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ResponsiveLayout',
  setup() {
    const router = useRouter()
    
    // 響應式狀態
    const showMobileMenu = ref(false)
    const showUserMenu = ref(false)
    const showSearch = ref(false)
    const searchQuery = ref('')
    
    // 導航項目
    const navigationItems = [
      { name: '首頁', path: '/' },
      { name: '商品', path: '/products' },
      { name: '分類', path: '/categories' },
      { name: '特價', path: '/deals' },
      { name: '關於', path: '/about' }
    ]
    
    // 購物車商品數量 (模擬數據)
    const cartItemCount = ref(0)
    
    // 搜索功能
    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/search',
          query: { q: searchQuery.value.trim() }
        })
        showSearch.value = false
        searchQuery.value = ''
      }
    }
    
    // 登出功能
    const logout = () => {
      // 實現登出邏輯
      console.log('用戶登出')
      showUserMenu.value = false
      router.push('/login')
    }
    
    // 點擊外部關閉菜單
    const handleClickOutside = (event) => {
      if (showUserMenu.value && !event.target.closest('.relative')) {
        showUserMenu.value = false
      }
    }
    
    // 監聽點擊事件
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      showMobileMenu,
      showUserMenu,
      showSearch,
      searchQuery,
      navigationItems,
      cartItemCount,
      performSearch,
      logout
    }
  }
}
</script>

<style scoped>
/* 響應式動畫 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 觸摸優化 */
@media (hover: none) {
  .hover\:bg-gray-100:hover {
    background-color: transparent;
  }
  
  .hover\:text-primary-600:hover {
    color: inherit;
  }
}
</style>
