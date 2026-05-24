<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { Search, Eye } from "lucide-vue-next";
import { adminOrdersApi } from "@/api/admin/orders";
import type { AdminOrder } from "@/types";
import { formatPrice, formatDateTime } from "@/utils/format";
import { formatOrderUser } from "@/utils";
import {
  BaseInput,
  BaseAutocomplete,
  BaseTable,
  type Column,
} from "@/components/ui";

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

const columns: Column<AdminOrder>[] = [
  { key: "id", label: "#", width: "90px", align: "left" },
  { key: "customer", label: "ลูกค้า", minWidth: "220px" },
  { key: "status", label: "สถานะ", width: "130px", align: "center" },
  { key: "total_amount", label: "ยอดรวม", width: "130px", align: "right" },
  { key: "created_at", label: "วันที่สั่ง", width: "180px", align: "left" },
  { key: "actions", label: "จัดการ", width: "80px", align: "center", fixed: "right" },
];

const pagination = computed(() => ({
  page: page.value,
  limit: 15,
  total: total.value,
  totalPages: totalPages.value,
}));

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

watch(statusFilter, () => {
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

function handlePageChange(newPage: number) {
  page.value = newPage;
  fetchOrders();
}

function fmt(n: number) {
  return formatPrice(n);
}

function fmtDate(d: string) {
  return formatDateTime(d);
}
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">คำสั่งซื้อทั้งหมด</h1>
      <span class="text-sm text-secondary-400">{{ total }} รายการ</span>
    </div>

    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div class="flex-1 w-full">
          <BaseInput
            label="ค้นหา"
            v-model="search"
            placeholder="ค้นหา Order ID, ชื่อลูกค้า, อีเมล..."
            :icon="Search"
          />
        </div>
        <div class="w-full sm:w-48">
          <BaseAutocomplete
            label="สถานะคำสั่งซื้อ"
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="ทั้งหมด"
          />
        </div>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="orders"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบคำสั่งซื้อ"
    >
      <template #cell-id="{ row }">
        <span class="font-mono font-bold text-secondary-900">#{{ row.id }}</span>
      </template>

      <template #cell-customer="{ row }">
        <div>
          <p class="font-medium text-secondary-900 text-sm">
            {{ formatOrderUser(row.user) }}
          </p>
          <p class="text-xs text-secondary-400">{{ row.user.email }}</p>
        </div>
      </template>

      <template #cell-status="{ row }">
        <span :class="['badge', statusCls[row.status]]">
          {{ statusLbl[row.status] }}
        </span>
      </template>

      <template #cell-total_amount="{ value }">
        <span class="font-medium text-secondary-900">
          ฿{{ fmt(value as number) }}
        </span>
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-secondary-500 text-xs">
          {{ fmtDate(value as string) }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center">
          <RouterLink
            :to="`/admin/orders/${row.id}`"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
            title="ดูรายละเอียด"
          >
            <Eye class="w-4 h-4" />
          </RouterLink>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

