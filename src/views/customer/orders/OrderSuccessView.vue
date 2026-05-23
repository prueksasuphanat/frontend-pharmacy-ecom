<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import { useOrderStore } from "@/stores/customer/order.store";
import { CheckCircle, Package, MapPin, Clock } from "lucide-vue-next";
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
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div v-if="orderStore.isLoading" class="text-center py-20">
        <div
          class="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"
        />
      </div>

      <div v-else-if="orderStore.error" class="text-center py-20">
        <p class="text-secondary-400">{{ orderStore.error }}</p>
        <RouterLink to="/products" class="btn-primary mt-4 inline-block"
          >กลับหน้าสินค้า</RouterLink
        >
      </div>

      <template v-else-if="orderStore.currentOrder">
        <div class="text-center mb-8">
          <div
            class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle class="w-10 h-10 text-green-600" />
          </div>
          <h1 class="text-2xl font-bold text-secondary-900 mb-2">
            สั่งซื้อสำเร็จ! 🎉
          </h1>
          <p class="text-secondary-500 text-sm">
            คำสั่งซื้อ #{{ orderStore.currentOrder.id }} ได้รับการบันทึกแล้ว
          </p>
        </div>

        <div class="card mb-4">
          <div class="flex items-center gap-2 mb-4">
            <Package class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">รายการสินค้า</h2>
          </div>
          <div class="divide-y divide-secondary-50">
            <div
              v-for="item in orderStore.currentOrder.items"
              :key="item.id"
              class="flex justify-between items-center py-2.5 text-sm"
            >
              <div>
                <p class="font-medium text-secondary-800">
                  {{ item.product_name }}
                </p>
                <p class="text-xs text-secondary-400">
                  {{ item.unit_name }} × {{ item.quantity }}
                </p>
              </div>
              <p class="font-semibold text-secondary-900">
                ฿{{ fmt(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>

          <div class="border-t pt-3 mt-1 space-y-1.5 text-sm">
            <div class="flex justify-between text-secondary-600">
              <span>ยอดสินค้า</span>
              <span>฿{{ fmt(orderStore.currentOrder.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-secondary-600">
              <span>ค่าจัดส่ง</span>
              <span
                :class="
                  orderStore.currentOrder.shipping_fee === 0
                    ? 'text-success font-medium'
                    : ''
                "
              >
                {{
                  orderStore.currentOrder.shipping_fee === 0
                    ? "ฟรี"
                    : `฿${fmt(orderStore.currentOrder.shipping_fee)}`
                }}
              </span>
            </div>
            <div class="flex justify-between font-bold text-base border-t pt-2">
              <span>รวมทั้งหมด</span>
              <span class="text-primary-700"
                >฿{{ fmt(orderStore.currentOrder.total_amount) }}</span
              >
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="flex items-center gap-2 mb-3">
            <MapPin class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">ที่อยู่จัดส่ง</h2>
          </div>
          <div class="text-sm text-secondary-600 space-y-0.5">
            <p class="font-medium text-secondary-800">
              {{ orderStore.currentOrder.shipping_address.recipient }}
            </p>
            <p>{{ orderStore.currentOrder.shipping_address.phone }}</p>
            <p>{{ orderStore.currentOrder.shipping_address.address }}</p>
            <p>
              {{ orderStore.currentOrder.shipping_address.province }}
              {{ orderStore.currentOrder.shipping_address.postal_code }}
            </p>
          </div>
        </div>

        <div class="card mb-6">
          <div class="flex items-center gap-2 mb-3">
            <Clock class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">สถานะคำสั่งซื้อ</h2>
          </div>
          <div class="space-y-2">
            <div
              v-for="log in orderStore.currentOrder.status_logs"
              :key="log.id"
              class="flex items-start gap-3"
            >
              <div
                class="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0"
              />
              <div>
                <p class="text-sm font-medium text-secondary-800">
                  {{ log.note }}
                </p>
                <p class="text-xs text-secondary-400">
                  {{ formatDateTime(log.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <RouterLink
            to="/profile/orders"
            class="btn-secondary flex-1 text-center"
          >
            ดูคำสั่งซื้อทั้งหมด
          </RouterLink>
          <RouterLink to="/products" class="btn-primary flex-1 text-center">
            เลือกสินค้าต่อ
          </RouterLink>
        </div>
      </template>
    </div>
    <Footer />
  </div>
</template>
