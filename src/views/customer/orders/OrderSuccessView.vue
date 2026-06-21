<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import { useOrderStore } from "@/stores/customer/order.store";
import { CheckCircle, Package, MapPin, Clock, Check } from "lucide-vue-next";
import { formatPrice, formatDateTime } from "@/utils/format";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const orderId = parseInt(route.params.id as string, 10);

onMounted(async () => {
  if (isNaN(orderId)) {
    router.replace("/products");
    return;
  }
  await orderStore.fetchOrder(orderId);
});

function fmt(n: number) {
  return formatPrice(n);
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-secondary-50/30">
    <Navbar />
    
    <div class="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div v-if="orderStore.isLoading" class="text-center py-20">
        <div
          class="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"
        />
      </div>

      <div v-else-if="orderStore.error" class="text-center py-20">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <CheckCircle class="w-8 h-8 rotate-180" />
        </div>
        <p class="text-secondary-600 font-medium">{{ orderStore.error }}</p>
        <RouterLink to="/products" class="btn-primary mt-6 inline-block px-6 py-2.5 rounded-xl shadow-md"
          >กลับหน้าสินค้า</RouterLink
        >
      </div>

      <template v-else-if="orderStore.currentOrder">
        <!-- Success Hero section -->
        <div class="text-center mb-10">
          <div class="pulse-circle w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 z-10 relative">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md z-10">
              <Check class="w-9 h-9 stroke-[3]" />
            </div>
          </div>
          <h1 class="text-3xl font-extrabold text-secondary-900 mb-2 tracking-tight">
            สั่งซื้อสำเร็จ! 🎉
          </h1>
          <p class="text-secondary-500 text-sm font-medium">
            คำสั่งซื้อ <span class="text-primary-700 font-bold">#{{ orderStore.currentOrder.id }}</span> ได้รับการบันทึกเรียบร้อยแล้ว
          </p>
        </div>

        <!-- Ordered Items Summary -->
        <div class="card mb-6 border border-secondary-100 shadow-sm bg-white rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-5 pb-4 border-b border-secondary-100">
            <div class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Package class="w-5 h-5" />
            </div>
            <h2 class="text-lg font-bold text-secondary-900">รายการสินค้า</h2>
          </div>
          
          <div class="divide-y divide-secondary-100">
            <div
              v-for="item in orderStore.currentOrder.items"
              :key="item.id"
              class="flex justify-between items-center py-3.5 text-sm"
            >
              <div>
                <p class="font-bold text-secondary-800">
                  {{ item.product_name }}
                </p>
                <p class="text-xs text-secondary-400 mt-0.5">
                  {{ item.unit_name }} × {{ item.quantity }}
                </p>
              </div>
              <p class="font-bold text-secondary-900">
                ฿{{ fmt(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>

          <div class="border-t border-secondary-100 pt-4 mt-2 space-y-2 text-sm">
            <div class="flex justify-between text-secondary-500">
              <span>ยอดสินค้า</span>
              <span class="font-semibold text-secondary-800">฿{{ fmt(orderStore.currentOrder.subtotal) }}</span>
            </div>
            <div class="flex justify-between font-black text-lg border-t border-dashed border-secondary-200 pt-4 mt-2">
              <span class="text-secondary-800">ยอดชำระสุทธิ</span>
              <span class="text-xl text-primary-700">฿{{ fmt(orderStore.currentOrder.total_amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Address Card -->
        <div class="card mb-6 border border-secondary-100 shadow-sm bg-white rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <MapPin class="w-5 h-5" />
            </div>
            <h2 class="text-lg font-bold text-secondary-900">ที่อยู่จัดส่ง</h2>
          </div>
          
          <div class="text-sm text-secondary-700 space-y-1.5 bg-secondary-50/50 p-5 rounded-2xl border border-secondary-100">
            <p class="font-bold text-secondary-900 text-base">
              {{ orderStore.currentOrder.shipping_address.recipient }}
            </p>
            <p class="flex items-center gap-2">
              <span class="text-secondary-400">เบอร์โทรศัพท์:</span>
              <span class="font-semibold text-secondary-800">{{ orderStore.currentOrder.shipping_address.phone }}</span>
            </p>
            <p class="leading-relaxed">
              {{ orderStore.currentOrder.shipping_address.address }}, 
              {{ orderStore.currentOrder.shipping_address.province }} 
              {{ orderStore.currentOrder.shipping_address.postal_code }}
            </p>
          </div>
        </div>

        <!-- Order Status Timeline Tracker -->
        <div class="card mb-8 border border-secondary-100 shadow-sm bg-white rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Clock class="w-5 h-5" />
            </div>
            <h2 class="text-lg font-bold text-secondary-900">สถานะคำสั่งซื้อ</h2>
          </div>
          
          <div class="relative pl-6 space-y-6">
            <!-- Line down the middle of nodes -->
            <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-secondary-200" />
            
            <div
              v-for="(log, idx) in orderStore.currentOrder.status_logs"
              :key="log.id"
              class="relative flex items-start gap-4"
            >
              <!-- Node icon/circle -->
              <div 
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 shrink-0 transition-all duration-300',
                  idx === 0
                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm ring-4 ring-primary-50'
                    : 'bg-white border-secondary-300 text-secondary-400'
                ]"
              >
                <Check v-if="idx > 0" class="w-3 h-3 stroke-[3]" />
                <div v-else class="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>

              <!-- Node content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p :class="['text-sm font-bold', idx === 0 ? 'text-primary-700 font-extrabold' : 'text-secondary-700']">
                    {{ log.note }}
                  </p>
                  <span class="text-xs text-secondary-400 shrink-0">
                    {{ formatDateTime(log.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 pt-2">
          <RouterLink
            to="/profile/orders"
            class="btn-secondary flex-1 text-center py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow"
          >
            ดูคำสั่งซื้อทั้งหมด
          </RouterLink>
          <RouterLink 
            to="/products" 
            class="btn-primary flex-1 text-center py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
          >
            เลือกสินค้าต่อ
          </RouterLink>
        </div>
      </template>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}
.pulse-circle::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background-color: rgb(220 252 231); /* bg-green-100 */
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 0;
}
</style>
