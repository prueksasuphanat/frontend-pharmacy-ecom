<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import { useOrderStore } from "@/stores/customer/order.store";
import { type OrderStatus } from "@/api/customer/orders";
import { Package, ChevronRight } from "lucide-vue-next";

const orderStore = useOrderStore();

const statusFilter = ref<OrderStatus | "">("");

const statusOptions = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "SHIPPED", label: "กำลังจัดส่ง" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  CONFIRMED: "ยืนยันแล้ว",
  SHIPPED: "กำลังจัดส่ง",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadOrders() {
  await orderStore.fetchOrders({
    status: statusFilter.value ? (statusFilter.value as OrderStatus) : undefined,
  });
}

onMounted(loadOrders);
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
      <h1 class="page-title mb-6">คำสั่งซื้อของฉัน</h1>

      <!-- Filter tabs -->
      <div class="flex gap-2 flex-wrap mb-6">
        <button
          v-for="opt in statusOptions"
          :key="opt.value"
          @click="statusFilter = opt.value as any; loadOrders()"
          :class="[
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            statusFilter === opt.value
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="orderStore.isLoading" class="text-center py-20">
        <div class="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto" />
      </div>

      <!-- Empty -->
      <div v-else-if="!orderStore.hasOrders" class="text-center py-20">
        <Package class="w-16 h-16 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400 text-lg font-medium mb-2">ยังไม่มีคำสั่งซื้อ</p>
        <RouterLink to="/products" class="btn-primary mt-2 inline-block">เลือกสินค้า</RouterLink>
      </div>

      <!-- Order list -->
      <div v-else class="space-y-4">
        <RouterLink
          v-for="order in orderStore.orders"
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="card block hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <p class="font-semibold text-secondary-900">คำสั่งซื้อ #{{ order.id }}</p>
              <p class="text-xs text-secondary-400 mt-0.5">{{ fmtDate(order.created_at) }}</p>
            </div>
            <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', statusBadge[order.status]]">
              {{ statusLabel[order.status] }}
            </span>
          </div>

          <!-- Item preview -->
          <div class="space-y-1 mb-3">
            <p
              v-for="(item, i) in order.items.slice(0, 2)"
              :key="item.id"
              class="text-sm text-secondary-600"
            >
              {{ item.product_name }} × {{ item.quantity }}
            </p>
            <p v-if="order.items.length > 2" class="text-xs text-secondary-400">
              + อีก {{ order.items.length - 2 }} รายการ
            </p>
          </div>

          <div class="flex items-center justify-between">
            <p class="font-bold text-primary-700">฿{{ fmt(order.total_amount) }}</p>
            <ChevronRight class="w-4 h-4 text-secondary-300" />
          </div>
        </RouterLink>

        <!-- Pagination -->
        <div
          v-if="orderStore.pagination.totalPages > 1"
          class="flex justify-center gap-2 mt-6"
        >
          <button
            v-for="p in orderStore.pagination.totalPages"
            :key="p"
            @click="orderStore.fetchOrders({ page: p })"
            :class="[
              'w-8 h-8 rounded-lg text-sm font-medium',
              p === orderStore.pagination.page
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
            ]"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
