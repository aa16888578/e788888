<template>
  <div class="card group hover:shadow-medium transition-all duration-300 overflow-hidden">
    <!-- 商品圖片 -->
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      >
      
      <!-- 商品標籤 -->
      <div v-if="product.tags && product.tags.length > 0" class="absolute top-2 left-2 flex flex-wrap gap-1">
        <span 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag"
          class="badge badge-primary text-xs px-2 py-1"
        >
          {{ tag }}
        </span>
      </div>
      
      <!-- 快速操作按鈕 -->
      <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          @click="toggleFavorite"
          class="w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-primary-50 transition-colors duration-200"
          :class="{ 'text-primary-600': isFavorite }"
        >
          <svg v-if="isFavorite" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        <button 
          @click="quickView"
          class="w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-primary-50 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      
      <!-- 庫存狀態 -->
      <div v-if="product.stock <= 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <span class="text-white font-medium text-lg">缺貨</span>
      </div>
      
      <!-- 折扣標籤 -->
      <div v-if="product.discount" class="absolute bottom-2 left-2">
        <span class="badge badge-error px-3 py-1 text-sm font-bold">
          -{{ product.discount }}%
        </span>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="p-4 space-y-3">
      <!-- 商品名稱 -->
      <h3 class="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
        <router-link :to="`/product/${product.id}`" class="hover:underline">
          {{ product.name }}
        </router-link>
      </h3>
      
      <!-- 商品描述 -->
      <p v-if="product.description" class="text-sm text-gray-600 text-truncate-2">
        {{ product.description }}
      </p>
      
      <!-- 商品分類 -->
      <div v-if="product.category" class="flex items-center text-xs text-gray-500">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        {{ product.category }}
      </div>
      
      <!-- 評分和評論 -->
      <div v-if="product.rating" class="flex items-center space-x-2">
        <div class="flex items-center">
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
          <span class="ml-1 text-sm text-gray-600">{{ product.rating }}</span>
        </div>
        <span v-if="product.reviewCount" class="text-sm text-gray-500">
          ({{ product.reviewCount }})
        </span>
      </div>
      
      <!-- 價格區域 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- 當前價格 -->
          <span class="text-lg font-bold text-gray-900">
            ${{ formatPrice(product.currentPrice) }}
          </span>
          
          <!-- 原價 (如果有折扣) -->
          <span v-if="product.originalPrice && product.originalPrice > product.currentPrice" class="text-sm text-gray-500 line-through">
            ${{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        
        <!-- 庫存狀態 -->
        <div v-if="product.stock > 0" class="text-xs text-gray-500">
          庫存: {{ product.stock }}
        </div>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="flex space-x-2">
        <!-- 加入購物車 -->
        <button 
          @click="addToCart"
          :disabled="product.stock <= 0"
          class="flex-1 btn btn-primary touch-optimized"
          :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          加入購物車
        </button>
        
        <!-- 立即購買 -->
        <button 
          @click="buyNow"
          :disabled="product.stock <= 0"
          class="flex-1 btn btn-outline touch-optimized"
          :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
        >
          立即購買
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['add-to-cart', 'buy-now', 'quick-view', 'toggle-favorite'],
  setup(props, { emit }) {
    const router = useRouter()
    
    // 響應式狀態
    const isFavorite = ref(false)
    
    // 格式化價格
    const formatPrice = (price) => {
      return Number(price).toFixed(2)
    }
    
    // 加入購物車
    const addToCart = () => {
      if (props.product.stock > 0) {
        emit('add-to-cart', props.product)
      }
    }
    
    // 立即購買
    const buyNow = () => {
      if (props.product.stock > 0) {
        emit('buy-now', props.product)
      }
    }
    
    // 快速查看
    const quickView = () => {
      emit('quick-view', props.product)
    }
    
    // 切換收藏
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
      emit('toggle-favorite', { product: props.product, isFavorite: isFavorite.value })
    }
    
    return {
      isFavorite,
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
@media (max-width: 640px) {
  .card {
    @apply mx-2;
  }
  
  .card-body {
    @apply px-3 py-3;
  }
  
  .btn {
    @apply text-sm px-3 py-2;
  }
}

@media (max-width: 480px) {
  .card {
    @apply mx-1;
  }
  
  .card-body {
    @apply px-2 py-2;
  }
  
  .btn {
    @apply text-xs px-2 py-1;
  }
}

/* 觸摸優化 */
@media (hover: none) {
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  
  .group:hover .group-hover\:scale-105 {
    transform: scale(1.05);
  }
  
  .group:hover .group-hover\:text-primary-600 {
    color: rgb(37 99 235);
  }
  
  .group:hover .group-hover\:shadow-medium {
    box-shadow: 0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
}

/* 動畫優化 */
.card {
  will-change: transform, box-shadow;
}

.card img {
  will-change: transform;
}

/* 加載優化 */
.card img {
  transition: opacity 0.3s ease;
}

.card img[loading] {
  opacity: 0;
}

.card img:not([loading]) {
  opacity: 1;
}
</style>
