<template>
  <ResponsiveLayout>
    <!-- 英雄區域 -->
    <section class="bg-gradient-primary text-white section-responsive">
      <div class="container-responsive">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            歡迎來到 ShopBot
          </h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            輕量級電商購物體驗，隨時隨地享受購物樂趣
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/products" class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              開始購物
            </router-link>
            <button @click="showPWAInstall" class="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
              安裝應用
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能 -->
    <section class="section-responsive">
      <div class="container-responsive">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">
          為什麼選擇 ShopBot？
        </h2>
        
        <div class="grid-responsive grid-cols-responsive">
          <div class="card text-center p-8 hover:shadow-medium transition-all duration-300">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">PWA 應用</h3>
            <p class="text-gray-600">
              可安裝的漸進式網頁應用，提供原生應用體驗
            </p>
          </div>

          <div class="card text-center p-8 hover:shadow-medium transition-all duration-300">
            <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">離線支持</h3>
            <p class="text-gray-600">
              完整的離線功能，網絡中斷也能繼續購物
            </p>
          </div>

          <div class="card text-center p-8 hover:shadow-medium transition-all duration-300">
            <div class="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">響應式設計</h3>
            <p class="text-gray-600">
              完美適配各種設備，從手機到桌面的最佳體驗
            </p>
          </div>

          <div class="card text-center p-8 hover:shadow-medium transition-all duration-300">
            <div class="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">極速加載</h3>
            <p class="text-gray-600">
              優化的性能，快速響應，流暢的用戶體驗
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 熱門商品 -->
    <section class="section-responsive bg-gray-50">
      <div class="container-responsive">
        <div class="flex items-center justify-between mb-12">
          <h2 class="text-3xl md:text-4xl font-bold">
            熱門商品
          </h2>
          <router-link to="/products" class="btn btn-primary">
            查看全部
          </router-link>
        </div>

        <div class="grid-responsive grid-cols-responsive">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
            @buy-now="buyNow"
            @quick-view="quickView"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </div>
    </section>

    <!-- PWA 安裝提示 -->
    <section class="section-responsive bg-primary-600 text-white">
      <div class="container-responsive text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">
          安裝 ShopBot 應用
        </h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          將 ShopBot 添加到主畫面，享受更快的加載速度和離線功能
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="showPWAInstall" class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
            立即安裝
          </button>
          <button @click="showPWAInfo" class="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold">
            了解更多
          </button>
        </div>
      </div>
    </section>
  </ResponsiveLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import ResponsiveLayout from '../components/ResponsiveLayout.vue'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Home',
  components: {
    ResponsiveLayout,
    ProductCard
  },
  setup() {
    // 模擬熱門商品數據
    const featuredProducts = ref([
      {
        id: 1,
        name: '智能手機 Pro Max',
        description: '最新款智能手機，搭載先進處理器和專業相機系統',
        price: 999.99,
        originalPrice: 1199.99,
        currentPrice: 999.99,
        discount: 17,
        image: 'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Phone',
        category: '電子產品',
        stock: 50,
        rating: 4.8,
        reviewCount: 128,
        tags: ['熱銷', '新品']
      },
      {
        id: 2,
        name: '無線藍牙耳機',
        description: '高品質音頻，降噪技術，長續航時間',
        price: 199.99,
        originalPrice: 249.99,
        currentPrice: 199.99,
        discount: 20,
        image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Headphones',
        category: '音頻設備',
        stock: 100,
        rating: 4.6,
        reviewCount: 89,
        tags: ['推薦', '特價']
      },
      {
        id: 3,
        name: '智能手錶',
        description: '健康監測，運動追蹤，智能通知',
        price: 299.99,
        originalPrice: 399.99,
        currentPrice: 299.99,
        discount: 25,
        image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Watch',
        category: '可穿戴設備',
        stock: 75,
        rating: 4.7,
        reviewCount: 156,
        tags: ['熱門', '限時']
      },
      {
        id: 4,
        name: '筆記本電腦',
        description: '輕薄便攜，強勁性能，長續航電池',
        price: 1299.99,
        originalPrice: 1499.99,
        currentPrice: 1299.99,
        discount: 13,
        image: 'https://via.placeholder.com/400x400/EF4444/FFFFFF?text=Laptop',
        category: '電腦設備',
        stock: 25,
        rating: 4.9,
        reviewCount: 203,
        tags: ['旗艦', '暢銷']
      }
    ])

    // 購物車功能
    const addToCart = (product) => {
      console.log('加入購物車:', product.name)
      // 這裡實現加入購物車邏輯
    }

    const buyNow = (product) => {
      console.log('立即購買:', product.name)
      // 這裡實現立即購買邏輯
    }

    const quickView = (product) => {
      console.log('快速查看:', product.name)
      // 這裡實現快速查看邏輯
    }

    const toggleFavorite = ({ product, isFavorite }) => {
      console.log('收藏商品:', product.name, isFavorite)
      // 這裡實現收藏邏輯
    }

    // PWA 功能
    const showPWAInstall = () => {
      if (window.pwaService) {
        window.pwaService.addToHomeScreen()
      } else {
        alert('PWA 功能暫時不可用')
      }
    }

    const showPWAInfo = () => {
      alert('PWA (Progressive Web App) 是一種可以像原生應用一樣安裝和使用的網頁應用。\n\n主要特點：\n• 可安裝到主畫面\n• 離線功能支持\n• 推送通知\n• 快速加載')
    }

    return {
      featuredProducts,
      addToCart,
      buyNow,
      quickView,
      toggleFavorite,
      showPWAInstall,
      showPWAInfo
    }
  }
}
</script>

<style scoped>
/* 響應式優化 */
@media (max-width: 768px) {
  .section-responsive {
    @apply py-8;
  }
  
  h1 {
    @apply text-3xl;
  }
  
  h2 {
    @apply text-2xl;
  }
}

/* 動畫優化 */
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
