<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Search,
  X,
  FileSpreadsheet,
  Users,
  Monitor,
  Calendar,
  ShieldCheck,
} from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseDatePicker,
  LoadingOverlay,
  BaseAutocomplete,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { UserSessionLogEntry } from "@/types";
import { useAuditLogStore } from "@/stores";
import { formatDateTime, formatUserName } from "@/utils";

const store = useAuditLogStore();

const searchQuery = ref("");
const dateFilter = ref("");
const roleFilter = ref<string | null>("all");

const roleOptions = [
  { value: "all", label: "บทบาททั้งหมด" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ (ADMIN)" },
  { value: "DEMO", label: "ระบบทดสอบ (DEMO)" },
  { value: "PHARMACIST", label: "เภสัชกร (PHARMACIST)" },
  { value: "CUSTOMER", label: "ลูกค้า (CUSTOMER)" },
];

const loading = computed(() => store.isLoading);
const pagination = computed(() => store.pagination);
const logs = computed(() => store.userSessionLogs);

const columns: Column<UserSessionLogEntry>[] = [
  { key: "user", label: "ผู้ใช้งาน", minWidth: "200px" },
  { key: "role", label: "บทบาท", width: "140px" },
  { key: "login_at", label: "เวลาเข้าสู่ระบบ", width: "180px" },
  { key: "last_active_at", label: "ใช้งานล่าสุด", width: "180px" },
  { key: "logout_at", label: "เวลาออกจากระบบ", width: "180px" },
  { key: "duration_minutes", label: "เวลาที่ใช้ (นาที)", width: "130px", align: "right" },
  { key: "ip_address", label: "IP Address", width: "130px" },
  { key: "user_agent", label: "อุปกรณ์", width: "150px" },
];

function fetchLogs(page = 1) {
  const params: any = {
    page,
    limit: 10,
    search: searchQuery.value || undefined,
    login_at: dateFilter.value || undefined,
    role: roleFilter.value !== "all" ? roleFilter.value : undefined,
  };
  store.fetchUserSessionLogs(params);
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

function getShortUserAgent(ua: string | null): string {
  if (!ua) return "-";
  if (ua.includes("Windows")) return "Windows / Browser";
  if (ua.includes("Macintosh")) return "macOS / Safari/Chrome";
  if (ua.includes("iPhone")) return "iPhone / Mobile";
  if (ua.includes("Android")) return "Android / Mobile";
  if (ua.includes("iPad")) return "iPad / Mobile";
  return "อุปกรณ์อื่น ๆ";
}

function exportToCSV() {
  const headers = [
    "ผู้ใช้งาน",
    "ชื่อ-นามสกุล/ชื่อร้านค้า",
    "บทบาท",
    "เวลาเข้าสู่ระบบ",
    "ใช้งานล่าสุด",
    "เวลาออกจากระบบ",
    "ระยะเวลาการใช้งาน (นาที)",
    "IP Address",
    "User Agent",
  ];

  const rows = logs.value.map((log) => [
    log.user?.username || "-",
    formatUserName(log.user),
    getRoleLabel(log.user?.role),
    formatDateTime(log.login_at),
    formatDateTime(log.last_active_at),
    log.logout_at ? formatDateTime(log.logout_at) : "ยังใช้งานอยู่",
    log.duration_minutes !== null ? log.duration_minutes.toString() : "-",
    log.ip_address || "-",
    log.user_agent || "-",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `user-session-logs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

onMounted(() => {
  fetchLogs(1);
});
</script>

<template>
  <div class="overflow-y-visible">
    <LoadingOverlay :loading="loading && logs.length > 0" />

    <div class="page-header mb-6">
      <div>
        <h1 class="page-title flex items-center gap-2">
          <Users class="w-6 h-6 text-primary-500" />
          <span>ประวัติการเข้าใช้งานระบบ</span>
        </h1>
        <p class="text-sm text-secondary-400 mt-1">
          ตรวจสอบประวัติการ Login การใช้งาน และประวัติช่วงเวลาของแต่ละบัญชี
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary-400">
          {{ pagination.total }} รายการ
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <BaseInput
            v-model="searchQuery"
            label="ค้นหาผู้ใช้"
            placeholder="ค้นหาชื่อ, นามสกุล, อีเมล, รหัส หรือชื่อร้านค้า..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>

        <div>
          <BaseAutocomplete
            v-model="roleFilter"
            label="บทบาทผู้ใช้"
            placeholder="เลือกบทบาท..."
            :options="roleOptions"
            @update:model-value="handleFilterChange"
          >
            <template #prefix>
              <ShieldCheck class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseAutocomplete>
        </div>

        <div class="relative">
          <BaseDatePicker
            v-model="dateFilter"
            label="วันที่เข้าใช้งาน"
            placeholder="เลือกวันที่..."
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
      empty-text="ไม่พบข้อมูลประวัติการเข้าใช้งาน"
    >
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
          ผู้ใช้ถูกลบแล้ว (ID: {{ row.user_id }})
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

      <!-- Login At Cell -->
      <template #cell-login_at="{ value }">
        <span class="text-sm text-secondary-600 whitespace-nowrap">
          {{ formatDateTime(value as string) }}
        </span>
      </template>

      <!-- Last Active At Cell -->
      <template #cell-last_active_at="{ value }">
        <span class="text-sm text-secondary-600 whitespace-nowrap">
          {{ formatDateTime(value as string) }}
        </span>
      </template>

      <!-- Logout At Cell -->
      <template #cell-logout_at="{ value }">
        <span v-if="value" class="text-sm text-secondary-500 whitespace-nowrap">
          {{ formatDateTime(value as string) }}
        </span>
        <span v-else class="inline-flex items-center gap-1 text-sm font-medium text-green-600">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          กำลังใช้งานอยู่
        </span>
      </template>

      <!-- Duration Minutes Cell -->
      <template #cell-duration_minutes="{ value }">
        <span class="text-sm text-secondary-600 font-mono">
          {{ value !== null ? value : "-" }}
        </span>
      </template>

      <!-- IP Address Cell -->
      <template #cell-ip_address="{ value }">
        <span class="text-sm text-secondary-500 font-mono">
          {{ value || "-" }}
        </span>
      </template>

      <!-- User Agent Cell -->
      <template #cell-user_agent="{ value }">
        <div class="flex items-center gap-1.5 text-xs text-secondary-500" :title="(value as string) || ''">
          <Monitor class="w-3.5 h-3.5 text-secondary-400 shrink-0" />
          <span class="truncate max-w-[130px]">
            {{ getShortUserAgent(value as string | null) }}
          </span>
        </div>
      </template>
    </BaseTable>
  </div>
</template>
