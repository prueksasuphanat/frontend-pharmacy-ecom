<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import { MOCK_ORDERS } from '@/mocks/orders'
import { ArrowLeft, Download, X, CheckCircle, Clock, Truck, Package } from 'lucide-vue-next'

const route = useRoute()
const orderId = route.params.id as string
// TODO: replace with GET /orders/:id
const order = computed(() => MOCK_ORDERS.find(o => o.id === orderId) || MOCK_ORDERS[0])

const cancelReason = ref('')
const showCancelModal = ref(false)

function fmt(n: number) { return n.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }
function fmtDate(d: string) { return new Date(d).toLocaleString('th-TH', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) }

const statusSteps = ['pending', 'confirmed', 'shipped', 'completed']
const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending:   { label: 'รอดำเนินการ', icon: Clock,        color: 'text-yellow-600 bg-yellow-100' },
  confirmed: { label: 'ยืนยันแล้ว',  icon: CheckCircle,  color: 'text-blue-600 bg-blue-100'    },
  shipped:   { label: 'จัดส่งแล้ว',   icon: Truck,        color: 'text-teal-600 bg-teal-100'    },
  completed: { label: 'สำเร็จ',       icon: Package,      color: 'text-green-600 bg-green-100'  },
  cancelled: { label: 'ยกเลิก',       icon: X,            color: 'text-red-600 bg-red-100'      },
}

const currentStepIndex = computed(() =>
  order.value.status === 'cancelled' ? -1 : statusSteps.indexOf(order.value.status)
)

function cancelOrder() {
  // TODO: PATCH /orders/:id/cancel { reason: cancelReason.value }
  showCancelModal.value = false
  alert('TODO: ยกเลิกคำสั่งซื้อ (จะเชื่อม API จริงทีหลัง)')
}
</script>

<template>
  <div v-if="order">
    <Navbar />
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/orders" class="btn-ghost p-2"><ArrowLeft class="w-4 h-4" /></RouterLink>
        <div>
          <h1 class="text-xl font-bold text-secondary-900 font-mono">{{ order.id }}</h1>
          <p class="text-sm text-secondary-400">{{ new Date(order.created_at).toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' }) }}</p>
        </div>
        <span :class="['badge ml-2', order.status === 'cancelled' ? 'badge-red' : order.status === 'completed' ? 'badge-green' : order.status === 'shipped' ? 'badge-teal' : order.status === 'confirmed' ? 'badge-blue' : 'badge-yellow']">
          {{ statusConfig[order.status]?.label }}
        </span>
        <div class="ml-auto flex gap-2">
          <!-- TODO: GET /orders/:id/invoice -->
          <button class="btn-secondary text-sm gap-1.5"><Download class="w-3.5 h-3.5" /> Invoice PDF</button>
          <button v-if="order.status === 'pending'" @click="showCancelModal=true" class="btn-danger text-sm">ยกเลิก</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">

          <!-- Status Stepper -->
          <div v-if="order.status !== 'cancelled'" class="card">
            <h3 class="font-semibold text-secondary-900 mb-5 text-sm">สถานะการสั่งซื้อ</h3>
            <div class="flex items-start justify-between relative">
              <div class="absolute top-4 left-0 right-0 h-0.5 bg-secondary-100 z-0" />
              <template v-for="(step, i) in statusSteps" :key="step">
                <div class="flex flex-col items-center z-10 flex-1">
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                    i <= currentStepIndex ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-secondary-200 text-secondary-400']">
                    <component :is="statusConfig[step].icon" class="w-4 h-4" />
                  </div>
                  <p :class="['text-xs mt-2 text-center', i <= currentStepIndex ? 'text-primary-700 font-semibold' : 'text-secondary-400']">
                    {{ statusConfig[step].label }}
                  </p>
                  <p v-if="order.status_logs.find(l => l.to === step)" class="text-[10px] text-secondary-300 mt-0.5">
                    {{ fmtDate(order.status_logs.find(l => l.to === step)!.changed_at) }}
                  </p>
                </div>
              </template>
            </div>
          </div>

          <!-- Prescription status -->
          <div v-if="order.prescription_status !== 'not_required'" class="card"
            :class="{ 'border-yellow-200 bg-yellow-50': order.prescription_status === 'pending',
                      'border-green-200 bg-green-50': order.prescription_status === 'approved',
                      'border-red-200 bg-red-50': order.prescription_status === 'rejected' }">
            <h3 class="font-semibold mb-2 text-sm">สถานะใบสั่งแพทย์</h3>
            <div class="flex items-center gap-2">
              <span v-if="order.prescription_status === 'pending'" class="badge badge-yellow">รอรีวิว</span>
              <span v-if="order.prescription_status === 'approved'" class="badge badge-green">อนุมัติแล้ว</span>
              <span v-if="order.prescription_status === 'rejected'" class="badge badge-red">ปฏิเสธ</span>
            </div>
          </div>

          <!-- Order items -->
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4 text-sm">รายการสินค้า</h3>
            <div class="divide-y divide-secondary-50">
              <div v-for="item in order.items" :key="item.id" class="flex gap-3 py-3">
                <img :src="item.product_image" :alt="item.product_name" class="w-14 h-14 rounded-xl object-cover" />
                <div class="flex-1">
                  <p class="font-medium text-secondary-900 text-sm">{{ item.product_name }}</p>
                  <p class="text-xs text-secondary-400 mt-0.5">{{ item.sku }}</p>
                  <p class="text-xs text-secondary-500 mt-0.5">x{{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-secondary-900">฿{{ fmt(item.unit_price * item.quantity) }}</p>
                  <p class="text-xs text-secondary-400">฿{{ fmt(item.unit_price) }}/หน่วย</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: address + summary -->
        <div class="space-y-4">
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">ที่อยู่จัดส่ง</h3>
            <div class="text-sm space-y-1 text-secondary-600">
              <p class="font-semibold text-secondary-900">{{ order.shipping_address.recipient }}</p>
              <p>{{ order.shipping_address.phone }}</p>
              <p>{{ order.shipping_address.address }}</p>
              <p>{{ order.shipping_address.district }}, {{ order.shipping_address.province }}</p>
              <p>{{ order.shipping_address.postal_code }}</p>
            </div>
          </div>
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">สรุปราคา</h3>
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between text-secondary-600"><span>ยอดสินค้า</span><span>฿{{ fmt(order.total_amount - order.shipping_fee) }}</span></div>
              <div class="flex justify-between text-secondary-600"><span>ค่าจัดส่ง</span>
                <span :class="order.shipping_fee === 0 ? 'text-success' : ''">{{ order.shipping_fee === 0 ? 'ฟรี' : '฿' + fmt(order.shipping_fee) }}</span>
              </div>
              <div class="flex justify-between font-bold text-secondary-900 border-t pt-2"><span>รวมทั้งหมด</span><span class="text-primary-700">฿{{ fmt(order.total_amount) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="font-bold text-lg text-secondary-900 mb-2">ยืนยันการยกเลิก</h3>
        <p class="text-sm text-secondary-500 mb-4">โปรดระบุเหตุผลในการยกเลิก</p>
        <textarea v-model="cancelReason" class="input h-24 resize-none" placeholder="เหตุผล..."></textarea>
        <div class="flex gap-3 mt-4">
          <button @click="showCancelModal=false" class="btn-secondary flex-1">ยกเลิก</button>
          <button @click="cancelOrder" class="btn-danger flex-1">ยืนยันยกเลิก</button>
        </div>
      </div>
    </div>
  </div>
</template>
