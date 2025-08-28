<template>
  <ResponsiveLayout>
    <!-- 商品詳情 -->
    <section class="section-responsive">
      <div class="container-responsive">
        <div v-if="product" class="grid lg:grid-cols-2 gap-8">
          <!-- 商品圖片 -->
          <div class="space-y-4">
            <!-- 主圖片 -->
            <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                :src="selectedImage || product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
              >
            </div>
            
            <!-- 縮略圖 -->
            <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="selectedImage = image"
                class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200"
                :class="selectedImage === image ? 'border-primary-500' : 'border-transparent hover:border-gray-300'"
              >
                <img
                  :src="image"
                  :alt="`${product.name} - 圖片 ${index + 1}`"
                  class="w-full h-full object-cover"
                >
              </button>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="space-y-6">
            <!-- 商品標題和評分 -->
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {{ product.name }}
              </h1>
              
              <!-- 評分和評論 -->
              <div v-if="product.rating" class="flex items-center gap-4 mb-4">
                <div class="flex items-center">
                  <div class="flex items-center">
                    <svg 
                      v-for="star in 5" 
                      :key="star"
                      class="w-5 h-5"
                      :class="star <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="ml-2 text-lg font-medium text-gray-900">{{ product.rating }}</span>
                </div>
                <span v-if="product.reviewCount" class="text-gray-600">
                  ({{ product.reviewCount }} 條評論)
                </span>
              </div>

              <!-- 商品標籤 -->
              <div v-if="product.tags && product.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="tag in product.tags" 
                  :key="tag"
                  class="badge badge-primary"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- 價格信息 -->
            <div class="space-y-3">
              <div class="flex items-center gap-4">
                <span class="text-3xl md:text-4xl font-bold text-gray-900">
                  ${{ formatPrice(product.currentPrice) }}
                </span>
                <span v-if="product.originalPrice && product.originalPrice > product.currentPrice" class="text-xl text-gray-500 line-through">
                  ${{ formatPrice(product.originalPrice) }}
                </span>
                <span v-if="product.discount" class="badge badge-error text-lg px-3 py-1">
                  -{{ product.discount }}%
                </span>
              </div>
              
              <p class="text-sm text-gray-600">
                庫存: <span class="font-medium">{{ product.stock }} 件</span>
              </p>
            </div>

            <!-- 商品描述 -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">商品描述</h3>
              <p class="text-gray-600 leading-relaxed">
                {{ product.description }}
              </p>
            </div>

            <!-- 商品規格 -->
            <div v-if="product.specifications">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">商品規格</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  v-for="(value, key) in product.specifications" 
                  :key="key"
                  class="flex justify-between py-2 border-b border-gray-100"
                >
                  <span class="text-gray-600">{{ key }}</span>
                  <span class="font-medium text-gray-900">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- 數量選擇 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                數量
              </label>
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    @click="decreaseQuantity"
                    :disabled="quantity <= 1"
                    class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span class="w-16 text-center font-medium text-lg">
                    {{ quantity }}
                  </span>
                  
                  <button 
                    @click="increaseQuantity"
                    :disabled="quantity >= product.stock"
                    class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <span class="text-sm text-gray-500">
                  最多可購買 {{ product.stock }} 件
                </span>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button 
                @click="addToCart"
                :disabled="product.stock <= 0"
                class="flex-1 btn btn-primary py-4 text-lg font-semibold"
                :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                加入購物車
              </button>
              
              <button 
                @click="buyNow"
                :disabled="product.stock <= 0"
                class="flex-1 btn btn-outline py-4 text-lg font-semibold"
                :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
              >
                立即購買
              </button>
            </div>

            <!-- 收藏按鈕 -->
            <div class="flex items-center gap-4">
              <button 
                @click="toggleFavorite"
                class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                :class="{ 'text-primary-600': isFavorite }"
              >
                <svg v-if="isFavorite" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {{ isFavorite ? '已收藏' : '收藏商品' }}
              </button>
              
              <button 
                @click="shareProduct"
                class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                分享
              </button>
            </div>
          </div>
        </div>

        <!-- 加載狀態 -->
        <div v-else class="text-center py-16">
          <div class="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p class="text-gray-600">載入商品信息中...</p>
        </div>
      </div>
    </section>

    <!-- 相關商品 -->
    <section v-if="relatedProducts.length > 0" class="section-responsive bg-gray-50">
      <div class="container-responsive">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          相關商品
        </h2>
        
        <div class="grid-responsive grid-cols-responsive">
          <ProductCard 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id"
            :product="relatedProduct"
            @add-to-cart="addToCart"
            @buy-now="buyNow"
            @quick-view="quickView"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </div>
    </section>
  </ResponsiveLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResponsiveLayout from '../components/ResponsiveLayout.vue'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'ProductDetail',
  components: {
    ResponsiveLayout,
    ProductCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 響應式狀態
    const product = ref(null)
    const selectedImage = ref('')
    const quantity = ref(1)
    const isFavorite = ref(false)
    const relatedProducts = ref([])

    // 模擬商品數據
    const mockProduct = {
      id: 1,
      name: '智能手機 Pro Max',
      description: '最新款智能手機，搭載先進處理器和專業相機系統。採用最新的 A17 Pro 芯片，提供卓越的性能和能效。配備 48MP 主相機和 12MP 超廣角相機，支持 4K 視頻錄製。6.7 英寸 Super Retina XDR 顯示屏，支持 ProMotion 120Hz 刷新率。內建 256GB 存儲空間，支持 5G 網絡。',
      price: 999.99,
      originalPrice: 1199.99,
      currentPrice: 999.99,
      discount: 17,
      image: 'https://via.placeholder.com/600x600/3B82F6/FFFFFF?text=Phone',
      images: [
        'https://via.placeholder.com/600x600/3B82F6/FFFFFF?text=Phone+1',
        'https://via.placeholder.com/600x600/10B981/FFFFFF?text=Phone+2',
        'https://via.placeholder.com/600x600/F59E0B/FFFFFF?text=Phone+3',
        'https://via.placeholder.com/600x600/EF4444/FFFFFF?text=Phone+4'
      ],
      category: '電子產品',
      stock: 50,
      rating: 4.8,
      reviewCount: 128,
      tags: ['熱銷', '新品', '5G', 'AI相機'],
      specifications: {
        '處理器': 'A17 Pro',
        '存儲': '256GB',
        '顯示屏': '6.7 英寸 Super Retina XDR',
        '相機': '48MP 主相機 + 12MP 超廣角',
        '電池': '4441mAh',
        '網絡': '5G',
        '防水': 'IP68',
        '重量': '221g'
      }
    }

    // 模擬相關商品
    const mockRelatedProducts = [
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
      }
    ]

    // 方法
    const increaseQuantity = () => {
      if (quantity.value < product.value.stock) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = () => {
      if (product.value.stock > 0) {
        console.log('加入購物車:', product.value.name, '數量:', quantity.value)
        // 這裡實現加入購物車邏輯
        alert('商品已加入購物車！')
      }
    }

    const buyNow = () => {
      if (product.value.stock > 0) {
        console.log('立即購買:', product.value.name, '數量:', quantity.value)
        // 這裡實現立即購買邏輯
        router.push('/checkout')
      }
    }

    const quickView = (relatedProduct) => {
      console.log('快速查看:', relatedProduct.name)
      // 這裡實現快速查看邏輯
    }

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
      console.log('收藏狀態:', isFavorite.value ? '已收藏' : '取消收藏')
      // 這裡實現收藏邏輯
    }

    const shareProduct = () => {
      if (navigator.share) {
        navigator.share({
          title: product.value.name,
          text: product.value.description,
          url: window.location.href
        })
      } else {
        // 複製鏈接到剪貼板
        navigator.clipboard.writeText(window.location.href)
        alert('商品鏈接已複製到剪貼板！')
      }
    }

    const formatPrice = (price) => {
      return Number(price).toFixed(2)
    }

    // 初始化
    onMounted(() => {
      // 模擬 API 調用延遲
      setTimeout(() => {
        product.value = mockProduct
        selectedImage.value = mockProduct.image
        relatedProducts.value = mockRelatedProducts
      }, 500)
    })

    return {
      product,
      selectedImage,
      quantity,
      isFavorite,
      relatedProducts,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      buyNow,
      quickView,
      toggleFavorite,
      shareProduct,
      formatPrice
    }
  }
}
</script>

<style scoped>
/* 響應式優化 */
@media (max-width: 1024px) {
  .grid {
    @apply grid-cols-1;
  }
}

/* 動畫優化 */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* 圖片切換動畫 */
img {
  transition: opacity 0.3s ease;
}

/* 數量控制按鈕 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 收藏按鈕動畫 */
button svg {
  transition: transform 0.2s ease;
}

button:hover svg {
  transform: scale(1.1);
}
</style>
