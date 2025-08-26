<template>
  <ResponsiveLayout>
    <!-- 頁面標題 -->
    <section class="bg-white border-b border-gray-100 section-responsive-sm">
      <div class="container-responsive">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
          商品目錄
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          發現精選商品，享受優質購物體驗
        </p>
      </div>
    </section>

    <!-- 篩選和排序 -->
    <section class="bg-gray-50 border-b border-gray-100 py-4">
      <div class="container-responsive">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- 篩選選項 -->
          <div class="flex flex-wrap gap-3">
            <select 
              v-model="selectedCategory" 
              class="input max-w-xs"
              @change="filterProducts"
            >
              <option value="">所有分類</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <select 
              v-model="selectedPriceRange" 
              class="input max-w-xs"
              @change="filterProducts"
            >
              <option value="">所有價格</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1000</option>
              <option value="1000+">$1000+</option>
            </select>

            <button 
              @click="clearFilters"
              class="btn btn-secondary"
            >
              清除篩選
            </button>
          </div>

          <!-- 排序選項 -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600">排序:</span>
            <select 
              v-model="sortBy" 
              class="input max-w-xs"
              @change="sortProducts"
            >
              <option value="name">名稱</option>
              <option value="price">價格</option>
              <option value="rating">評分</option>
              <option value="newest">最新</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品網格 -->
    <section class="section-responsive">
      <div class="container-responsive">
        <!-- 商品數量顯示 -->
        <div class="flex items-center justify-between mb-8">
          <p class="text-gray-600">
            顯示 {{ filteredProducts.length }} 個商品
          </p>
          
          <!-- 視圖切換 -->
          <div class="flex items-center gap-2">
            <button 
              @click="viewMode = 'grid'"
              class="p-2 rounded-lg transition-colors duration-200"
              :class="viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              @click="viewMode = 'list'"
              class="p-2 rounded-lg transition-colors duration-200"
              :class="viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 商品列表 -->
        <div v-if="filteredProducts.length > 0" class="space-y-6">
          <!-- 網格視圖 -->
          <div v-if="viewMode === 'grid'" class="grid-responsive grid-cols-responsive">
            <ProductCard 
              v-for="product in paginatedProducts" 
              :key="product.id"
              :product="product"
              @add-to-cart="addToCart"
              @buy-now="buyNow"
              @quick-view="quickView"
              @toggle-favorite="toggleFavorite"
            />
          </div>

          <!-- 列表視圖 -->
          <div v-else class="space-y-4">
            <div 
              v-for="product in paginatedProducts" 
              :key="product.id"
              class="card p-6 hover:shadow-medium transition-all duration-300"
            >
              <div class="flex flex-col md:flex-row gap-6">
                <!-- 商品圖片 -->
                <div class="w-full md:w-48 h-48 flex-shrink-0">
                  <img 
                    :src="product.image" 
                    :alt="product.name"
                    class="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  >
                </div>

                <!-- 商品信息 -->
                <div class="flex-1 space-y-4">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                      <router-link :to="`/product/${product.id}`" class="hover:text-primary-600">
                        {{ product.name }}
                      </router-link>
                    </h3>
                    <p class="text-gray-600 text-truncate-3">
                      {{ product.description }}
                    </p>
                  </div>

                  <!-- 商品標籤和評分 -->
                  <div class="flex flex-wrap items-center gap-4">
                    <div v-if="product.tags && product.tags.length > 0" class="flex gap-2">
                      <span 
                        v-for="tag in product.tags.slice(0, 3)" 
                        :key="tag"
                        class="badge badge-primary"
                      >
                        {{ tag }}
                      </span>
                    </div>

                    <div v-if="product.rating" class="flex items-center gap-2">
                      <div class="flex items-center">
                        <svg 
                          v-for="star in 5" 
                          :key="star"
                          class="w-4 h-4"
                          :class="star <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600">{{ product.rating }}</span>
                      <span v-if="product.reviewCount" class="text-sm text-gray-500">
                        ({{ product.reviewCount }})
                      </span>
                    </div>
                  </div>

                  <!-- 價格和庫存 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl font-bold text-gray-900">
                        ${{ formatPrice(product.currentPrice) }}
                      </span>
                      <span v-if="product.originalPrice && product.originalPrice > product.currentPrice" class="text-lg text-gray-500 line-through">
                        ${{ formatPrice(product.originalPrice) }}
                      </span>
                      <span v-if="product.discount" class="badge badge-error">
                        -{{ product.discount }}%
                      </span>
                    </div>

                    <div class="text-sm text-gray-500">
                      庫存: {{ product.stock }}
                    </div>
                  </div>

                  <!-- 操作按鈕 -->
                  <div class="flex flex-wrap gap-3">
                    <button 
                      @click="addToCart(product)"
                      :disabled="product.stock <= 0"
                      class="btn btn-primary"
                      :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      加入購物車
                    </button>

                    <button 
                      @click="buyNow(product)"
                      :disabled="product.stock <= 0"
                      class="btn btn-outline"
                      :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
                    >
                      立即購買
                    </button>

                    <button 
                      @click="quickView(product)"
                      class="btn btn-secondary"
                    >
                      快速查看
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分頁 -->
          <div v-if="totalPages > 1" class="flex items-center justify-center">
            <nav class="flex items-center space-x-2">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn btn-outline px-3 py-2"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              >
                上一頁
              </button>

              <div class="flex items-center space-x-1">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  @click="currentPage = page"
                  class="px-3 py-2 rounded-lg transition-colors duration-200"
                  :class="page === currentPage ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
                >
                  {{ page }}
                </button>
              </div>

              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn btn-outline px-3 py-2"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
              >
                下一頁
              </button>
            </nav>
          </div>
        </div>

        <!-- 無商品狀態 -->
        <div v-else class="text-center py-16">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            沒有找到商品
          </h3>
          <p class="text-gray-600 mb-6">
            請嘗試調整篩選條件或清除篩選
          </p>
          <button @click="clearFilters" class="btn btn-primary">
            清除篩選
          </button>
        </div>
      </div>
    </section>
  </ResponsiveLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ResponsiveLayout from '../components/ResponsiveLayout.vue'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Products',
  components: {
    ResponsiveLayout,
    ProductCard
  },
  setup() {
    // 響應式狀態
    const products = ref([])
    const selectedCategory = ref('')
    const selectedPriceRange = ref('')
    const sortBy = ref('name')
    const viewMode = ref('grid')
    const currentPage = ref(1)
    const itemsPerPage = 12

    // 模擬商品數據
    const mockProducts = [
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
      },
      {
        id: 5,
        name: '平板電腦',
        description: '大屏娛樂，辦公生產力，便攜設計',
        price: 599.99,
        originalPrice: 699.99,
        currentPrice: 599.99,
        discount: 14,
        image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Tablet',
        category: '電子產品',
        stock: 60,
        rating: 4.5,
        reviewCount: 92,
        tags: ['娛樂', '辦公']
      },
      {
        id: 6,
        name: '遊戲主機',
        description: '4K遊戲體驗，強大圖形處理，豐富遊戲庫',
        price: 499.99,
        originalPrice: 599.99,
        currentPrice: 499.99,
        discount: 17,
        image: 'https://via.placeholder.com/400x400/EC4899/FFFFFF?text=Console',
        category: '遊戲設備',
        stock: 30,
        rating: 4.9,
        reviewCount: 178,
        tags: ['遊戲', '4K']
      }
    ]

    // 分類列表
    const categories = computed(() => {
      const uniqueCategories = [...new Set(mockProducts.map(p => p.category))]
      return uniqueCategories.sort()
    })

    // 篩選商品
    const filteredProducts = computed(() => {
      let filtered = [...mockProducts]

      // 分類篩選
      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.category === selectedCategory.value)
      }

      // 價格篩選
      if (selectedPriceRange.value) {
        const [min, max] = selectedPriceRange.value.split('-').map(Number)
        if (max) {
          filtered = filtered.filter(p => p.currentPrice >= min && p.currentPrice <= max)
        } else {
          filtered = filtered.filter(p => p.currentPrice >= min)
        }
      }

      // 排序
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'price':
            return a.currentPrice - b.currentPrice
          case 'rating':
            return b.rating - a.rating
          case 'newest':
            return b.id - a.id
          default:
            return 0
        }
      })

      return filtered
    })

    // 分頁
    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredProducts.value.slice(start, end)
    })

    // 可見頁碼
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // 方法
    const filterProducts = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      selectedCategory.value = ''
      selectedPriceRange.value = ''
      currentPage.value = 1
    }

    const sortProducts = () => {
      currentPage.value = 1
    }

    const formatPrice = (price) => {
      return Number(price).toFixed(2)
    }

    const addToCart = (product) => {
      console.log('加入購物車:', product.name)
    }

    const buyNow = (product) => {
      console.log('立即購買:', product.name)
    }

    const quickView = (product) => {
      console.log('快速查看:', product.name)
    }

    const toggleFavorite = ({ product, isFavorite }) => {
      console.log('收藏商品:', product.name, isFavorite)
    }

    // 初始化
    onMounted(() => {
      products.value = mockProducts
    })

    return {
      products,
      selectedCategory,
      selectedPriceRange,
      sortBy,
      viewMode,
      currentPage,
      categories,
      filteredProducts,
      totalPages,
      paginatedProducts,
      visiblePages,
      filterProducts,
      clearFilters,
      sortProducts,
      formatPrice,
      addToCart,
      buyNow,
      quickView,
      toggleFavorite
    }
  }
}
</script>

<style scoped>
/* 響應式優化 */
@media (max-width: 768px) {
  .section-responsive-sm {
    @apply py-4;
  }
  
  .section-responsive {
    @apply py-6;
  }
}

/* 動畫優化 */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
