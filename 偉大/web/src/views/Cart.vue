<template>
  <ResponsiveLayout>
    <!-- 頁面標題 -->
    <section class="bg-white border-b border-gray-100 section-responsive-sm">
      <div class="container-responsive">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
          購物車
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          管理您的商品，準備結帳
        </p>
      </div>
    </section>

    <!-- 購物車內容 -->
    <section class="section-responsive">
      <div class="container-responsive">
        <div v-if="cartItems.length > 0" class="grid lg:grid-cols-3 gap-8">
          <!-- 商品列表 -->
          <div class="lg:col-span-2">
            <div class="space-y-4">
              <div 
                v-for="item in cartItems" 
                :key="item.id"
                class="card p-6"
              >
                <div class="flex gap-4">
                  <!-- 商品圖片 -->
                  <div class="w-24 h-24 flex-shrink-0">
                    <img 
                      :src="item.image" 
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-lg"
                    >
                  </div>

                  <!-- 商品信息 -->
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 mb-2 text-truncate">
                      {{ item.name }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-3 text-truncate-2">
                      {{ item.description }}
                    </p>
                    
                    <!-- 價格和數量 -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <span class="text-lg font-bold text-gray-900">
                          ${{ formatPrice(item.price) }}
                        </span>
                        
                        <!-- 數量控制 -->
                        <div class="flex items-center gap-2">
                          <button 
                            @click="decreaseQuantity(item.id)"
                            class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                            :disabled="item.quantity <= 1"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span class="w-12 text-center font-medium">
                            {{ item.quantity }}
                          </span>
                          
                          <button 
                            @click="increaseQuantity(item.id)"
                            class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                            :disabled="item.quantity >= item.stock"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <!-- 小計和刪除 -->
                      <div class="flex items-center gap-4">
                        <span class="text-lg font-semibold text-gray-900">
                          ${{ formatPrice(item.price * item.quantity) }}
                        </span>
                        
                        <button 
                          @click="removeFromCart(item.id)"
                          class="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 結帳摘要 -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                訂單摘要
              </h2>

              <!-- 價格明細 -->
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-gray-600">
                  <span>商品小計</span>
                  <span>${{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>運費</span>
                  <span>{{ shippingCost === 0 ? '免費' : `$${formatPrice(shippingCost)}` }}</span>
                </div>
                <div v-if="discount > 0" class="flex justify-between text-success-600">
                  <span>折扣</span>
                  <span>-${{ formatPrice(discount) }}</span>
                </div>
                <hr class="border-gray-200">
                <div class="flex justify-between text-lg font-semibold text-gray-900">
                  <span>總計</span>
                  <span>${{ formatPrice(total) }}</span>
                </div>
              </div>

              <!-- 優惠券 -->
              <div class="mb-6">
                <div class="flex gap-2">
                  <input
                    v-model="couponCode"
                    type="text"
                    placeholder="輸入優惠券代碼"
                    class="input flex-1"
                  >
                  <button 
                    @click="applyCoupon"
                    class="btn btn-secondary whitespace-nowrap"
                  >
                    應用
                  </button>
                </div>
              </div>

              <!-- 結帳按鈕 -->
              <button 
                @click="checkout"
                class="w-full btn btn-primary py-4 text-lg font-semibold"
              >
                立即結帳
              </button>

              <!-- 繼續購物 -->
              <router-link 
                to="/products"
                class="block w-full text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                繼續購物
              </router-link>
            </div>
          </div>
        </div>

        <!-- 空購物車狀態 -->
        <div v-else class="text-center py-16">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            您的購物車是空的
          </h3>
          <p class="text-gray-600 mb-6">
            開始購物，添加您喜歡的商品到購物車
          </p>
          <router-link to="/products" class="btn btn-primary">
            開始購物
          </router-link>
        </div>
      </div>
    </section>
  </ResponsiveLayout>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ResponsiveLayout from '../components/ResponsiveLayout.vue'

export default {
  name: 'Cart',
  components: {
    ResponsiveLayout
  },
  setup() {
    const router = useRouter()
    
    // 響應式狀態
    const cartItems = ref([
      {
        id: 1,
        name: '智能手機 Pro Max',
        description: '最新款智能手機，搭載先進處理器和專業相機系統',
        price: 999.99,
        image: 'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Phone',
        quantity: 1,
        stock: 50
      },
      {
        id: 2,
        name: '無線藍牙耳機',
        description: '高品質音頻，降噪技術，長續航時間',
        price: 199.99,
        image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Headphones',
        quantity: 2,
        stock: 100
      }
    ])
    
    const couponCode = ref('')
    const discount = ref(0)
    const shippingCost = ref(0)

    // 計算屬性
    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const total = computed(() => {
      return subtotal.value + shippingCost.value - discount.value
    })

    // 方法
    const increaseQuantity = (itemId) => {
      const item = cartItems.value.find(i => i.id === itemId)
      if (item && item.quantity < item.stock) {
        item.quantity++
      }
    }

    const decreaseQuantity = (itemId) => {
      const item = cartItems.value.find(i => i.id === itemId)
      if (item && item.quantity > 1) {
        item.quantity--
      }
    }

    const removeFromCart = (itemId) => {
      const index = cartItems.value.findIndex(i => i.id === itemId)
      if (index > -1) {
        cartItems.value.splice(index, 1)
      }
    }

    const applyCoupon = () => {
      if (couponCode.value.trim()) {
        // 這裡實現優惠券邏輯
        if (couponCode.value.toLowerCase() === 'save20') {
          discount.value = subtotal.value * 0.2
          alert('優惠券應用成功！獲得 20% 折扣')
        } else {
          alert('無效的優惠券代碼')
        }
        couponCode.value = ''
      }
    }

    const checkout = () => {
      // 這裡實現結帳邏輯
      console.log('開始結帳，總金額:', total.value)
      router.push('/checkout')
    }

    const formatPrice = (price) => {
      return Number(price).toFixed(2)
    }

    return {
      cartItems,
      couponCode,
      discount,
      shippingCost,
      subtotal,
      total,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      applyCoupon,
      checkout,
      formatPrice
    }
  }
}
</script>

<style scoped>
/* 響應式優化 */
@media (max-width: 1024px) {
  .sticky {
    position: static;
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
