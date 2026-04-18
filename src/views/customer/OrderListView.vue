<script setup lang="ts">
import { ref, computed } from "vue";
import { Navbar, Footer } from "@/components/layout";
import { MOCK_ORDERS } from "@/__mocks__/orders";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { Package } from "lucide-vue-next";

const auth = useAuthStore();
// TODO: replace with GET /orders?status=&page=
const orders = computed(() =>
  MOCK_ORDERS.filter(
    (o) => (auth.isAdmin ? true : o.user_id === auth.currentUser?.id || true), // show all for mockup
  ),
);

const statusFilter = ref("");
const statusOpts = [
  { value: "", label: "ทุกสถานะ" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "completed", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
];

const filtered = computed(() =>
  statusFilter.value
    ? orders.value.filter((o) => o.status === statusFilter.value)
    : orders.value,
);

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "รอดำเนินการ", class: "badge-yellow" },
  confirmed: { label: "ยืนยันแล้ว", class: "badge-blue" },
  shipped: { label: "จัดส่งแล้ว", class: "badge-teal" },
  completed: { label: "สำเร็จ", class: "badge-green" },
  cancelled: { label: "ยกเลิก", class: "badge-red" },
};

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="page-header">
        <h1 class="page-title">คำสั่งซื้อของฉัน</h1>
        <select v-model="statusFilter" class="input py-1.5 w-auto text-sm">
          <option v-for="s in statusOpts" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>

      <div v-if="filtered.length === 0" class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบคำสั่งซื้อ</p>
      </div>

      <div v-else class="space-y-4">
        <RouterLink
          v-for="order in filtered"
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="card-hover block"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="font-mono font-semibold text-secondary-900 text-sm"
                  >{{ order.id }}</span
                >
                <span :class="['badge', statusConfig[order.status].class]">{{
                  statusConfig[order.status].label
                }}</span>
                <span
                  v-if="order.prescription_status === 'pending'"
                  class="badge badge-yellow"
                  >ใบสั่งยารอรีวิว</span
                >
              </div>
              <p class="text-xs text-secondary-400">
                {{ fmtDate(order.created_at) }} ·
                {{ order.items.length }} รายการ
              </p>
              <div class="flex gap-2 mt-2 flex-wrap">
                <div
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.id"
                  class="flex items-center gap-1.5"
                >
                  <img
                    :src="item.product_image"
                    :alt="item.product_name"
                    class="w-8 h-8 rounded object-cover"
                  />
                  <span class="text-xs text-secondary-500 hidden sm:block">{{
                    item.product_name
                  }}</span>
                </div>
                <span
                  v-if="order.items.length > 3"
                  class="text-xs text-secondary-400 self-center"
                  >+{{ order.items.length - 3 }} รายการ</span
                >
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-primary-700">
                ฿{{ fmt(order.total_amount) }}
              </p>
              <p class="text-xs text-secondary-400 mt-1">ดูรายละเอียด →</p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <Footer />
  </div>
</template>
