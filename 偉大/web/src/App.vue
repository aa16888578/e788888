<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 導航欄 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-primary-600">🚀 CCV Bot</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              首頁
            </router-link>
            <router-link to="/products" class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              商品
            </router-link>
            <router-link to="/cart" class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              購物車
            </router-link>
            <router-link to="/login" class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              登入
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要內容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- 頁腳 -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="text-center text-gray-500">
          <p>&copy; 2024 CCV Bot. 多平台電商系統</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
