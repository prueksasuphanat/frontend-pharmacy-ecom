<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { BaseSelect } from "@/components/ui";
import { RouterLink } from "vue-router";
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-vue-next";
import { ordersApi } from "@/api/customer/orders";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, formatDateTime } from "@/utils/format";

const orders = ref<Order[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);

const statusFilter = ref("");
const statusOpts = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "SHIPPED", label: "จัดส่งแล้ว" },
  { value: "COMPLETED", label: "สำเร็จ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const res = await ordersApi.getAll({
      page: page.value,
      limit: 20,
      status: (statusFilter.value || undefined) as OrderStatus | undefined,
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

watch(statusFilter, () => {
  page.value = 1;
  fetchOrders();
});

const statusConfig: Record<
  string,
  { label: string; badge: string; icon: any; color: string }
> = {
  PENDING: {
    label: "รอดำเนินการ",
    badge: "badge-yellow",
    icon: Clock,
    color: "text-yellow-600",
  },
  CONFIRMED: {
    label: "ยืนยันแล้ว",
    badge: "badge-blue",
    icon: FileText,
    color: "text-blue-600",
  },
  SHIPPED: {
    label: "จัดส่งแล้ว",
    badge: "badge-teal",
    icon: Truck,
    color: "text-primary-600",
  },
  COMPLETED: {
    label: "สำเร็จ",
    badge: "badge-green",
    icon: CheckCircle,
    color: "text-green-600",
  },
  CANCELLED: {
    label: "ยกเลิก",
    badge: "badge-red",
    icon: XCircle,
    color: "text-red-500",
  },
};

const stats = computed(() => {
  const all = orders.value;
  return [
    {
      label: "ทั้งหมด",
      count: total.value,
      color: "bg-secondary-100 text-secondary-600",
    },
    {
      label: "รอดำเนินการ",
      count: all.filter((o: Order) => o.status === "PENDING").length,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "กำลังจัดส่ง",
      count: all.filter((o: Order) => o.status === "SHIPPED").length,
      color: "bg-primary-100 text-primary-700",
    },
    {
      label: "สำเร็จ",
      count: all.filter((o: Order) => o.status === "COMPLETED").length,
      color: "bg-green-100 text-green-700",
    },
  ];
});

function fmt(n: number) {
  return formatPrice(n);
}
function fmtDate(d: string) {
  return formatDateTime(d);
}
function fmtTime(d: string) {
  return formatDateTime(d);
}
</script>

<template>
  <div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card py-3 px-4 text-center"
      >
        <p class="text-2xl font-bold text-secondary-900">{{ stat.count }}</p>
        <p class="text-xs text-secondary-500 mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <div class="card">
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
      >
        <div>
          <h2 class="text-lg font-bold text-secondary-900">คำสั่งซื้อของฉัน</h2>
          <p class="text-sm text-secondary-500 mt-0.5">
            ติดตามสถานะคำสั่งซื้อทั้งหมดของคุณ
          </p>
        </div>
        <BaseSelect
          v-model="statusFilter"
          :options="statusOpts"
          class="w-full sm:w-44"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-16">
        <div
          class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <ShoppingBag class="w-8 h-8 text-secondary-400" />
        </div>
        <p class="text-secondary-600 font-medium mb-1">ไม่พบคำสั่งซื้อ</p>
        <p class="text-sm text-secondary-400 mb-4">
          {{
            statusFilter ? "ลองเปลี่ยนตัวกรองสถานะ" : "คุณยังไม่มีคำสั่งซื้อ"
          }}
        </p>
        <RouterLink to="/products" class="btn-primary text-sm"
          >เลือกซื้อสินค้า</RouterLink
        >
      </div>

      <div v-else class="space-y-3">
        <RouterLink
          v-for="order in orders"
          :key="order.id"
          :to="`/profile/orders/${order.id}`"
          class="block rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-sm p-4 transition-all"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono font-semibold text-secondary-900 text-sm"
                  >#{{ order.id }}</span
                >
                <span
                  v-if="statusConfig[order.status]"
                  :class="['badge', statusConfig[order.status].badge]"
                >
                  {{ statusConfig[order.status].label }}
                </span>
              </div>
              <p class="text-xs text-secondary-400 mt-1">
                {{ fmtDate(order.created_at) }} ·
                {{ fmtTime(order.created_at) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-primary-700 text-sm">
                ฿{{ fmt(order.total_amount) }}
              </p>
              <p class="text-xs text-secondary-400 mt-0.5">
                {{ order.items.length }} รายการ
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div
              v-for="item in order.items.slice(0, 4)"
              :key="item.id"
              class="w-10 h-10 rounded-lg overflow-hidden border border-secondary-100 shrink-0 bg-gradient-to-br from-primary-50 to-teal-50 flex items-center justify-center"
            >
              <span
                class="text-[8px] text-primary-500 font-medium leading-tight text-center p-0.5"
              >
                {{ item.product_name.slice(0, 10) }}
              </span>
            </div>
            <span
              v-if="order.items.length > 4"
              class="text-xs text-secondary-400 ml-1"
            >
              +{{ order.items.length - 4 }} รายการ
            </span>
            <span class="ml-auto text-xs text-primary-600 font-medium"
              >ดูรายละเอียด →</span
            >
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
