<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-vue-next";
import { adminOrdersApi, type AdminOrder } from "@/api/admin/orders";

const orders = ref<AdminOrder[]>([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("ALL");
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);

const statusOptions = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "SHIPPED", label: "จัดส่งแล้ว" },
  { value: "COMPLETED", label: "สำเร็จ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

const statusCls: Record<string, string> = {
  PENDING: "badge-yellow",
  CONFIRMED: "badge-blue",
  SHIPPED: "badge-teal",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
};

const statusLbl: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  CONFIRMED: "ยืนยันแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

async function fetchOrders() {
  loading.value = true;
  try {
    const res = await adminOrdersApi.getAll({
      page: page.value,
      limit: 15,
      status: statusFilter.value !== "ALL" ? statusFilter.value : undefined,
      search: search.value || undefined,
    });
    orders.value = res.data.data;
    totalPages.value = res.data.pagination.totalPages;
    total.value = res.data.pagination.total;
  } catch {
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOrders);

watch([statusFilter], () => {
  page.value = 1;
  fetchOrders();
});

let searchTimeout: ReturnType<typeof setTimeout>;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchOrders();
  }, 400);
});

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchOrders();
  }
}
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchOrders();
  }
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function customerName(order: AdminOrder) {
  if (order.user.first_name || order.user.last_name) {
    return `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim();
  }
  return order.user.username || order.user.email || "-";
}
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">คำสั่งซื้อทั้งหมด</h1>
      <span class="text-sm text-secondary-400">{{ total }} รายการ</span>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
          />
          <input
            v-model="search"
            type="text"
            placeholder="ค้นหา Order ID, ชื่อ, อีเมล..."
            class="input pl-9 w-full"
          />
        </div>
        <select v-model="statusFilter" class="input w-full sm:w-auto min-w-[160px]">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center py-16">
      <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
      <p class="text-secondary-400">ไม่พบคำสั่งซื้อ</p>
    </div>

    <!-- Table -->
    <div v-else class="card overflow-hidden !p-0">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-secondary-50 text-secondary-600 text-xs uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">ลูกค้า</th>
              <th class="px-4 py-3 text-left">สถานะ</th>
              <th class="px-4 py-3 text-right">ยอดรวม</th>
              <th class="px-4 py-3 text-left">วันที่สั่ง</th>
              <th class="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary-50">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-secondary-50/50 transition-colors"
            >
              <td class="px-4 py-3 font-mono font-bold text-secondary-900">
                #{{ order.id }}
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-secondary-900 text-sm">
                  {{ customerName(order) }}
                </p>
                <p class="text-xs text-secondary-400">{{ order.user.email }}</p>
              </td>
              <td class="px-4 py-3">
                <span :class="['badge', statusCls[order.status]]">
                  {{ statusLbl[order.status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium">
                ฿{{ fmt(order.total_amount) }}
              </td>
              <td class="px-4 py-3 text-secondary-500 text-xs">
                {{ fmtDate(order.created_at) }}
              </td>
              <td class="px-4 py-3 text-center">
                <RouterLink
                  :to="`/admin/orders/${order.id}`"
                  class="btn-ghost text-xs py-1.5 px-3 gap-1 text-primary-600"
                >
                  <Eye class="w-3.5 h-3.5" /> ดูรายละเอียด
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 bg-secondary-50/50 border-t border-secondary-100"
      >
        <p class="text-xs text-secondary-500">
          หน้า {{ page }} จาก {{ totalPages }} ({{ total }} รายการ)
        </p>
        <div class="flex gap-2">
          <button
            @click="prevPage"
            :disabled="page <= 1"
            class="btn-ghost text-xs py-1.5 px-2 disabled:opacity-30"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="nextPage"
            :disabled="page >= totalPages"
            class="btn-ghost text-xs py-1.5 px-2 disabled:opacity-30"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
