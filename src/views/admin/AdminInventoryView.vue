<script setup lang="ts">
import { ref, computed } from 'vue'
import { MOCK_PRODUCTS } from '@/mocks/products'
import { MOCK_LOTS } from '@/mocks/inventory'
import { Search, Plus, AlertTriangle, Edit, Eye } from 'lucide-vue-next'

// TODO: GET /admin/products, GET /admin/inventory/lots

const search = ref('')
const filterType = ref('')
const showLots = ref<string | null>(null)

const products = computed(() => {
  let list = MOCK_PRODUCTS.filter(p => !p.is_deleted)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  if (filterType.value) list = list.filter(p => p.drug_type === filterType.value)
  return list
})

function lotsFor(productId: string) {
  return MOCK_LOTS.filter(l => l.product_id === productId)
}

function isNearExpiry(dateStr: string) {
  const days = (new Date(dateStr).getTime() - Date.now()) / (1000*60*60*24)
  return days <= 90
}

function fmt(n: number) { return n.toLocaleString('th-TH') }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' }) }

const drugTypes = ['otc','prescription','controlled','supplement','cosmetic']
const drugLabel: Record<string, string> = { otc:'OTC', prescription:'Rx', controlled:'ยาควบคุม', supplement:'อาหารเสริม', cosmetic:'เวชสำอาง' }
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">คลังสินค้า</h1>
      <!-- TODO: POST /admin/products -->
      <button class="btn-primary text-sm gap-1.5"><Plus class="w-4 h-4" /> เพิ่มสินค้าใหม่</button>
    </div>

    <!-- Filters -->
    <div class="card mb-4 flex flex-wrap gap-3">
      <div class="relative flex-1 min-w-48">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input v-model="search" placeholder="ค้นหา..." class="input pl-9 text-sm" />
      </div>
      <select v-model="filterType" class="input py-2 w-auto text-sm">
        <option value="">ทุกประเภท</option>
        <option v-for="t in drugTypes" :key="t" :value="t">{{ drugLabel[t] }}</option>
      </select>
    </div>

    <!-- Lot alerts -->
    <div v-if="MOCK_LOTS.some(l => isNearExpiry(l.expiry_date) || l.quantity === 0)"
      class="card bg-orange-50 border border-orange-200 mb-4">
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-4 h-4 text-orange-600" />
        <span class="font-semibold text-orange-800 text-sm">แจ้งเตือนคลังสินค้า</span>
      </div>
      <div class="space-y-1">
        <div v-for="lot in MOCK_LOTS.filter(l => isNearExpiry(l.expiry_date) || l.quantity === 0)" :key="lot.id"
          class="flex items-center gap-3 text-xs text-orange-700">
          <span>{{ lot.quantity === 0 ? '❌' : '⏳' }}</span>
          <span>{{ lot.product_name }} ({{ lot.lot_number }})</span>
          <span class="text-orange-500">{{ lot.quantity === 0 ? 'หมด' : `หมดอายุ ${fmtDate(lot.expiry_date)}` }}</span>
        </div>
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>SKU</th><th>ชื่อสินค้า</th><th>ประเภท</th><th>ราคาขาย (retail)</th><th>สต็อก</th><th>จุดสั่งซื้อ</th><th>สถานะ</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td class="font-mono text-xs">{{ p.sku }}</td>
            <td>
              <div class="flex items-center gap-2">
                <img :src="p.image_url" :alt="p.name" class="w-8 h-8 rounded object-cover" />
                <div>
                  <p class="text-sm font-medium text-secondary-800">{{ p.name }}</p>
                  <p class="text-xs text-secondary-400">{{ p.generic_name }}</p>
                </div>
              </div>
            </td>
            <td><span class="badge badge-teal text-xs">{{ drugLabel[p.drug_type] }}</span></td>
            <td class="text-sm font-medium">฿{{ fmt(p.base_price) }}</td>
            <td>
              <span :class="['font-semibold text-sm', p.stock === 0 ? 'text-danger' : p.stock <= p.reorder_level ? 'text-warning' : 'text-success']">
                {{ p.stock }}
              </span>
            </td>
            <td class="text-sm text-secondary-500">{{ p.reorder_level }}</td>
            <td>
              <span v-if="p.stock === 0" class="badge badge-red">หมด</span>
              <span v-else-if="p.stock <= p.reorder_level" class="badge badge-yellow">ใกล้หมด</span>
              <span v-else class="badge badge-green">ปกติ</span>
            </td>
            <td>
              <div class="flex gap-1">
                <!-- TODO: PATCH /admin/products/:id -->
                <button class="p-1.5 rounded-lg hover:bg-secondary-50 text-secondary-400 hover:text-secondary-700 transition-colors">
                  <Edit class="w-3.5 h-3.5" />
                </button>
                <button @click="showLots = showLots === p.id ? null : p.id"
                  class="p-1.5 rounded-lg hover:bg-primary-50 text-secondary-400 hover:text-primary-600 transition-colors">
                  <Eye class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Lot detail expandable -->
    <div v-if="showLots" class="card mt-4">
      <h3 class="font-bold text-secondary-900 mb-4">
        Lot Details — {{ MOCK_PRODUCTS.find(p=>p.id===showLots)?.name }}
        <!-- TODO: GET /admin/inventory/lots?product_id=X -->
      </h3>
      <table class="table">
        <thead>
          <tr><th>Lot #</th><th>จำนวน</th><th>ราคาต้นทุน</th><th>วันหมดอายุ</th><th>วันรับเข้า</th><th>สถานะ</th></tr>
        </thead>
        <tbody>
          <tr v-for="lot in lotsFor(showLots)" :key="lot.id" :class="{ 'bg-orange-50': isNearExpiry(lot.expiry_date) || lot.quantity === 0 }">
            <td class="font-mono text-xs">{{ lot.lot_number }}</td>
            <td class="font-semibold" :class="lot.quantity === 0 ? 'text-danger' : ''">{{ lot.quantity }}</td>
            <td class="text-sm">฿{{ fmt(lot.cost_price) }}</td>
            <td :class="['text-sm', isNearExpiry(lot.expiry_date) ? 'text-orange-600 font-medium' : '']">{{ fmtDate(lot.expiry_date) }}</td>
            <td class="text-sm text-secondary-500">{{ fmtDate(lot.received_at) }}</td>
            <td>
              <span v-if="lot.quantity === 0" class="badge badge-red">หมด</span>
              <span v-else-if="isNearExpiry(lot.expiry_date)" class="badge badge-yellow">ใกล้หมดอายุ</span>
              <span v-else class="badge badge-green">ปกติ</span>
            </td>
          </tr>
          <tr v-if="lotsFor(showLots).length === 0">
            <td colspan="6" class="text-center text-secondary-400 py-4">ยังไม่มี lot ในระบบ</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
