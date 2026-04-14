<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MOCK_ORDERS } from '@/mocks/orders'
import { Search, Download } from 'lucide-vue-next'

// TODO: GET /admin/orders?status=&page=&search=

const search      = ref('')
const statusFilter = ref('')
const page        = ref(1)
const PAGE_SIZE   = 10

const statusOpts = [
  { v:'', l:'ทุกสถานะ' }, { v:'pending', l:'รอดำเนินการ' }, { v:'confirmed', l:'ยืนยัน' },
  { v:'shipped', l:'จัดส่ง' }, { v:'completed', l:'สำเร็จ' }, { v:'cancelled', l:'ยกเลิก' },
]
const statusCls: Record<string, string> = {
  pending:'badge-yellow', confirmed:'badge-blue', shipped:'badge-teal', completed:'badge-green', cancelled:'badge-red'
}
const statusLbl: Record<string, string> = {
  pending:'รอดำเนินการ', confirmed:'ยืนยัน', shipped:'จัดส่ง', completed:'สำเร็จ', cancelled:'ยกเลิก'
}
const prescLbl: Record<string, string> = {
  not_required:'', pending:'🔔ใบสั่งยารอรีวิว', approved:'📋อนุมัติ', rejected:'❌ปฏิเสธ'
}

const filtered = computed(() => {
  let list = [...MOCK_ORDERS]
  if (statusFilter.value) list = list.filter(o => o.status === statusFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o => o.id.toLowerCase().includes(q) || o.user_email.toLowerCase().includes(q))
  }
  return list
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PAGE_SIZE, page.value*PAGE_SIZE))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

function fmt(n: number) { return n.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' }) }
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">คำสั่งซื้อทั้งหมด</h1>
      <!-- TODO: GET /admin/orders/export (CSV/Excel) -->
      <button class="btn-secondary text-sm gap-2"><Download class="w-4 h-4" /> Export CSV</button>
    </div>

    <!-- Filters -->
    <div class="card mb-4 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-48">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input v-model="search" placeholder="ค้นหา order ID, อีเมล..." class="input pl-9 text-sm" />
      </div>
      <select v-model="statusFilter" class="input py-2 w-auto text-sm">
        <option v-for="s in statusOpts" :key="s.v" :value="s.v">{{ s.l }}</option>
      </select>
    </div>

    <div class="card p-0 overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th><th>ลูกค้า</th><th>รายการ</th><th>ยอดรวม</th><th>วันที่</th><th>สถานะ</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginated" :key="order.id">
            <td class="font-mono text-xs font-semibold">{{ order.id }}</td>
            <td>
              <p class="text-sm font-medium text-secondary-800">{{ order.user_email }}</p>
            </td>
            <td class="text-sm text-secondary-500">{{ order.items.length }} รายการ</td>
            <td class="font-semibold text-sm">฿{{ fmt(order.total_amount) }}</td>
            <td class="text-sm text-secondary-500">{{ fmtDate(order.created_at) }}</td>
            <td>
              <div class="flex flex-col gap-1">
                <span :class="['badge', statusCls[order.status]]">{{ statusLbl[order.status] }}</span>
                <span v-if="order.prescription_status === 'pending'" class="badge badge-yellow text-[10px]">ใบสั่งยารอรีวิว</span>
              </div>
            </td>
            <td>
              <RouterLink :to="`/admin/orders/${order.id}`" class="btn-secondary text-xs py-1">ดู</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
      <button v-for="p in totalPages" :key="p" @click="page=p"
        :class="['w-9 h-9 rounded-lg text-sm font-medium', p===page ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 border border-secondary-200']">
        {{ p }}
      </button>
    </div>
  </div>
</template>
