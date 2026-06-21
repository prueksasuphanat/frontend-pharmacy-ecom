<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Search,
  X,
  FileSpreadsheet,
  ShoppingBag,
  Calendar,
  Eye,
} from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseDatePicker,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { ProductViewLogEntry } from "@/types";
import { useAuditLogStore } from "@/stores";
import { formatDateTime, formatUserName, formatNum } from "@/utils";

const store = useAuditLogStore();

const searchQuery = ref("");
const dateFilter = ref("");

const loading = computed(() => store.isLoading);
const pagination = computed(() => store.pagination);
const logs = computed(() => store.productViewLogs);

const columns: Column<ProductViewLogEntry>[] = [
  { key: "viewed_at", label: "เวลาเข้าชม", width: "180px" },
  { key: "product", label: "สินค้า", minWidth: "220px" },
  { key: "category", label: "ประเภทสินค้า", width: "160px" },
  { key: "user", label: "ผู้เข้าชม", minWidth: "180px" },
  { key: "role", label: "บทบาท", width: "130px" },
  { key: "session_id", label: "รหัสเซสชัน", width: "150px" },
];

function fetchLogs(page = 1) {
  const params: any = {
    page,
    limit: 10,
    search: searchQuery.value || undefined,
    viewed_at: dateFilter.value || undefined,
  };
  store.fetchProductViewLogs(params);
}

let searchTimeout: any = null;
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchLogs(1);
  }, 500);
}

function handleFilterChange() {
  fetchLogs(1);
}

function clearDateFilter() {
  dateFilter.value = "";
  fetchLogs(1);
}

function handlePageChange(page: number) {
  fetchLogs(page);
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-50 text-red-700 border-red-200";
    case "DEMO":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PHARMACIST":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CUSTOMER":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-secondary-50 text-secondary-700 border-secondary-200";
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "ผู้ดูแลระบบ";
    case "DEMO":
      return "บัญชีทดลอง";
    case "PHARMACIST":
      return "เภสัชกร";
    case "CUSTOMER":
      return "ลูกค้า";
    default:
      return role;
  }
}

function exportToCSV() {
  const headers = [
    "เวลาเข้าชม",
    "รหัสสินค้า",
    "ชื่อสินค้า",
    "ประเภทสินค้า",
    "ผู้เข้าชม (Username)",
    "ชื่อ-นามสกุล/ชื่อร้านค้า",
    "บทบาท",
    "รหัสเซสชัน",
  ];

  const rows = logs.value.map((log) => [
    formatDateTime(log.viewed_at),
    log.product?.code || "-",
    log.product?.name || "-",
    log.product?.categories?.map((c) => c.category.name).join(", ") || "-",
    log.user?.username || "-",
    formatUserName(log.user),
    getRoleLabel(log.user?.role),
    log.session_id || "-",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `product-view-logs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

onMounted(() => {
  fetchLogs(1);
});
</script>

<template>
  <div class="overflow-y-visible">
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title flex items-center gap-2">
          <ShoppingBag class="w-6 h-6 text-primary-500" />
          <span>ประวัติการเข้าชมสินค้า</span>
        </h1>
        <p class="text-sm text-secondary-400 mt-1">
          วิเคราะห์พฤติกรรมลูกค้าผ่านประวัติการเข้าดูและเปิดหน้าข้อมูลสินค้าแต่ละรายการ
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary-400">
          {{ formatNum(pagination.total) }} รายการ
        </span>
        <button
          @click="exportToCSV"
          class="btn-secondary text-sm inline-flex items-center gap-2"
          :disabled="logs.length === 0"
          title="Export เป็น CSV"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span class="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BaseInput
            v-model="searchQuery"
            label="ค้นหาข้อมูล"
            placeholder="ค้นหาชื่อสินค้า, รหัสสินค้า, ชื่อผู้เข้าชม, หรือชื่อร้านค้า..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>

        <div class="relative">
          <BaseDatePicker
            v-model="dateFilter"
            label="วันที่เข้าชม"
            placeholder="เลือกวันที่เข้าชม..."
            @update:model-value="handleFilterChange"
          >
            <template #prefix>
              <Calendar class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseDatePicker>
          <button
            v-if="dateFilter"
            @click="clearDateFilter"
            class="absolute right-10 top-[38px] p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
            title="ล้างตัวกรองวันที่"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <BaseTable
      :columns="columns"
      :data="logs"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลประวัติการเข้าชมสินค้า"
    >
      <!-- Viewed At Cell -->
      <template #cell-viewed_at="{ value }">
        <span class="text-sm text-secondary-600 whitespace-nowrap">
          {{ formatDateTime(value as string) }}
        </span>
      </template>

      <!-- Product Cell -->
      <template #cell-product="{ row }">
        <div v-if="row.product" class="flex items-start gap-2">
          <Eye class="w-4 h-4 text-secondary-400 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-secondary-900 leading-tight">
              {{ row.product.name }}
            </p>
            <p class="text-xs text-secondary-400 mt-0.5">
              รหัสสินค้า: {{ row.product.code }}
            </p>
          </div>
        </div>
        <div v-else class="text-sm text-secondary-400">
          สินค้าถูกลบแล้ว (ID: {{ row.product_id }})
        </div>
      </template>

      <!-- Category Cell -->
      <template #cell-category="{ row }">
        <div
          v-if="row.product?.categories?.length"
          class="flex flex-wrap gap-1"
        >
          <span
            v-for="c in row.product.categories"
            :key="c.category?.id"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary-100 text-secondary-700 border border-secondary-200"
          >
            {{ c.category?.name || 'ไม่มีชื่อหมวดหมู่' }}
          </span>
        </div>
        <span v-else class="text-secondary-400">-</span>
      </template>

      <!-- User Cell -->
      <template #cell-user="{ row }">
        <div v-if="row.user">
          <p class="text-sm font-medium text-secondary-900">
            {{ formatUserName(row.user) || "-" }}
          </p>
          <p class="text-xs text-secondary-400">
            {{ row.user.username }} | {{ row.user.email || 'ไม่มีอีเมล' }}
          </p>
        </div>
        <div v-else class="text-sm text-secondary-400">
          ผู้เข้าชมทั่วไป / บัญชีถูกลบแล้ว (ID: {{ row.user_id }})
        </div>
      </template>

      <!-- Role Cell -->
      <template #cell-role="{ row }">
        <span
          v-if="row.user"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
          :class="getRoleBadgeClass(row.user.role)"
        >
          {{ getRoleLabel(row.user.role) }}
        </span>
        <span v-else class="text-secondary-400">-</span>
      </template>

      <!-- Session ID Cell -->
      <template #cell-session_id="{ value }">
        <span class="text-sm text-secondary-500 font-mono" :title="(value as string) || ''">
          {{ value ? (value as string).substring(0, 8) + '...' : '-' }}
        </span>
      </template>
    </BaseTable>
  </div>
</template>
