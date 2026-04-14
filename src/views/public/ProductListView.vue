<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { MOCK_PRODUCTS } from '@/mocks/products'
import DrugTypeBadge from '@/components/ui/DrugTypeBadge.vue'
import { useAuthStore } from '@/stores/auth.store'
import { Search, SlidersHorizontal, ChevronRight, Package } from 'lucide-vue-next'
import Navbar from '@/components/layout/Navbar.vue'

const auth = useAuthStore()
const router = useRouter()

const search      = ref('')
const filterType  = ref('')
const filterStock = ref(false)
const sortBy      = ref('newest')
const page        = ref(1)
const PAGE_SIZE   = 12

const drugTypes = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'otc', label: 'ยาสามัญประจำบ้าน' },
  { value: 'prescription', label: 'ยาต้องใช้ใบสั่งแพทย์' },
  { value: 'controlled', label: 'ยาควบคุมพิเศษ' },
  { value: 'supplement', label: 'ผลิตภัณฑ์เสริมอาหาร' },
  { value: 'cosmetic', label: 'เวชสำอาง' },
]

// TODO: replace with GET /products?search=&drug_type=&sort=&page=
const filtered = computed(() => {
  let list = [...MOCK_PRODUCTS].filter(p => !p.is_deleted)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q)       ||
      p.generic_name.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    )
  }
  if (filterType.value)  list = list.filter(p => p.drug_type === filterType.value)
  if (filterStock.value) list = list.filter(p => p.stock > 0)
  if (sortBy.value === 'az')     list.sort((a,b) => a.name.localeCompare(b.name, 'th'))
  if (sortBy.value === 'newest') list.sort((a,b) => b.created_at.localeCompare(a.created_at))
  return list
})

const paginated = computed(() => filtered.value.slice((page.value-1)*PAGE_SIZE, page.value*PAGE_SIZE))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

function goToProduct(id: string) {
  if (!auth.isLoggedIn) {
    router.push(`/login?redirect=/products/${id}`)
  } else {
    router.push(`/products/${id}`)
  }
}
</script>

<template>
  <div>
    <Navbar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Hero banner -->
      <div class="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-8 mb-8 text-white">
        <h1 class="text-3xl font-bold mb-2">ยาและผลิตภัณฑ์เพื่อสุขภาพ</h1>
        <p class="text-primary-100 mb-6">สินค้าคุณภาพจากผู้ผลิตชั้นนำ พร้อมส่ง ราคาพิเศษตามกลุ่มลูกค้า</p>
        <!-- Search bar in hero -->
        <div class="relative max-w-xl">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input v-model="search" type="text"
            placeholder="ค้นหาชื่อยา, generic name, ผู้ผลิต, SKU..."
            class="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-secondary-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>
      </div>

      <!-- Filters bar -->
      <div class="flex flex-wrap gap-3 mb-6 items-center">
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="w-4 h-4 text-secondary-400" />
          <span class="text-sm text-secondary-500">กรอง:</span>
        </div>
        <select v-model="filterType" class="input py-1.5 w-auto text-sm">
          <option v-for="dt in drugTypes" :key="dt.value" :value="dt.value">{{ dt.label }}</option>
        </select>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="filterStock" type="checkbox"
            class="w-4 h-4 rounded border-secondary-300 text-primary-600" />
          <span class="text-sm text-secondary-600">มีสินค้า</span>
        </label>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-sm text-secondary-500">เรียงโดย:</span>
          <select v-model="sortBy" class="input py-1.5 w-auto text-sm">
            <option value="newest">ใหม่ล่าสุด</option>
            <option value="az">ชื่อ A-Z</option>
          </select>
        </div>
      </div>

      <!-- Count -->
      <p class="text-sm text-secondary-500 mb-4">
        พบ <strong class="text-secondary-900">{{ filtered.length }}</strong> รายการ
      </p>

      <!-- Product grid -->
      <div v-if="paginated.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="product in paginated" :key="product.id"
          @click="goToProduct(product.id)"
          class="card-hover p-0 overflow-hidden group cursor-pointer">
          <!-- Image -->
          <div class="relative">
            <img :src="product.image_url" :alt="product.name"
              class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
            <DrugTypeBadge :type="product.drug_type" class="absolute top-2 left-2" />
            <div v-if="product.stock === 0"
              class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl">
              <span class="bg-white text-secondary-700 text-xs font-bold px-3 py-1 rounded-full">สินค้าหมด</span>
            </div>
          </div>
          <!-- Info -->
          <div class="p-3">
            <p class="text-xs text-secondary-400 mb-0.5">{{ product.generic_name }}</p>
            <h3 class="font-semibold text-sm text-secondary-900 line-clamp-2 leading-snug mb-2">{{ product.name }}</h3>
            <p class="text-xs text-secondary-400 mb-3">{{ product.manufacturer }}</p>
            <!-- Price locked -->
            <div v-if="!auth.isLoggedIn"
              class="bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 text-center">
              <p class="text-xs text-secondary-500">🔒 เข้าสู่ระบบเพื่อดูราคา</p>
            </div>
            <div v-else-if="product.stock === 0" class="text-sm font-medium text-secondary-400">สินค้าหมด</div>
            <div v-else class="flex items-center justify-between">
              <p class="text-xs font-medium text-secondary-500">ดูรายละเอียด</p>
              <ChevronRight class="w-4 h-4 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้าที่ค้นหา</p>
        <button @click="search=''; filterType=''; filterStock=false" class="btn-secondary mt-4 text-sm">ล้างตัวกรอง</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button v-for="p in totalPages" :key="p" @click="page=p"
          :class="['w-9 h-9 rounded-lg text-sm font-medium transition-colors', p === page ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50']">
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>
