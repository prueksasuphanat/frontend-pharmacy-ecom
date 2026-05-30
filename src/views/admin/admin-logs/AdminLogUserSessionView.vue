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
  Eye,
  Clock,
  Activity,
  ArrowRight,
} from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseDatePicker,
  LoadingOverlay,
  BaseAutocomplete,
  BaseModal,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { UserSessionLogEntry } from "@/types";
import { useAuditLogStore } from "@/stores";
import { auditLogsApi } from "@/api";
import { formatDateTime, formatUserName } from "@/utils";

const store = useAuditLogStore();

const searchQuery = ref("");
const dateFilter = ref("");
const roleFilter = ref<string | null>("all");

// Detail view state
const isModalOpen = ref(false);
const selectedUser = ref<any>(null);
const userSessions = ref<UserSessionLogEntry[]>([]);
const loadingSessions = ref(false);
const sessionPagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });

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

// Primary Table Columns
const columns: Column<UserSessionLogEntry>[] = [
  { key: "user", label: "ผู้ใช้งาน", minWidth: "220px" },
  { key: "role", label: "บทบาท", width: "130px" },
  { key: "status", label: "สถานะ", width: "155px" },
  { key: "login_at", label: "เวลาเข้าล่าสุด", width: "180px" },
  { key: "last_active_at", label: "ใช้งานล่าสุด", width: "180px" },
  { key: "ip_address", label: "IP Address ล่าสุด", width: "135px" },
  { key: "actions", label: "รายละเอียด", width: "100px", align: "center" },
];

// Session History Columns
const historyColumns: Column<UserSessionLogEntry>[] = [
  { key: "login_at", label: "เวลาเข้าใช้งาน", width: "180px" },
  { key: "logout_at", label: "เวลาออกจากระบบ", width: "180px" },
  { key: "duration_minutes", label: "ระยะเวลา", width: "120px", align: "right" },
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
    groupByUser: true,
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

// Row Click Detail Handler
function handleRowClick(row: UserSessionLogEntry) {
  if (row.user) {
    openUserDetail(row);
  }
}

async function openUserDetail(row: UserSessionLogEntry) {
  selectedUser.value = row.user;
  isModalOpen.value = true;
  await fetchUserSessions(1);
}

async function fetchUserSessions(page = 1) {
  if (!selectedUser.value) return;
  loadingSessions.value = true;
  try {
    const res = await auditLogsApi.getUserSessionLogs({
      page,
      limit: 10,
      user_id: selectedUser.value.id,
    });
    userSessions.value = res.data.data;
    sessionPagination.value = res.data.pagination;
  } catch (error) {
    console.error("Error fetching user sessions", error);
  } finally {
    loadingSessions.value = false;
  }
}

const averageDuration = computed(() => {
  if (userSessions.value.length === 0) return 0;
  const sessionsWithDuration = userSessions.value.filter(s => s.duration_minutes !== null);
  if (sessionsWithDuration.length === 0) return "-";
  const sum = sessionsWithDuration.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  return Math.round(sum / sessionsWithDuration.length);
});

function exportToCSV() {
  const headers = [
    "ผู้ใช้งาน",
    "ชื่อ-นามสกุล/ชื่อร้านค้า",
    "บทบาท",
    "เวลาเข้าล่าสุด",
    "ใช้งานล่าสุด",
    "สถานะปัจจุบัน",
    "IP Address ล่าสุด",
    "User Agent ล่าสุด",
  ];

  const rows = logs.value.map((log) => [
    log.user?.username || "-",
    formatUserName(log.user),
    getRoleLabel(log.user?.role),
    formatDateTime(log.login_at),
    formatDateTime(log.last_active_at),
    log.logout_at ? "ออฟไลน์" : "กำลังใช้งานอยู่",
    log.ip_address || "-",
    log.user_agent || "-",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `user-session-summary-${new Date().toISOString().split("T")[0]}.csv`;
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
          สรุปรายชื่อผู้ใช้งานและกิจกรรมการเชื่อมต่อล่าสุด พร้อมความสามารถในการเรียกดูประวัติเข้าใช้แบบเจาะลึก
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary-400">
          {{ pagination.total }} บัญชีผู้ใช้งาน
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
      @row-click="handleRowClick"
      empty-text="ไม่พบข้อมูลประวัติการเข้าใช้งาน"
    >
      <!-- User Cell -->
      <template #cell-user="{ row }">
        <div v-if="row.user" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
            {{ row.user.first_name?.[0] || row.user.username?.[0] || 'U' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-secondary-900">
              {{ formatUserName(row.user) || "-" }}
            </p>
            <p class="text-xs text-secondary-400">
              {{ row.user.username }} | {{ row.user.email || 'ไม่มีอีเมล' }}
            </p>
          </div>
        </div>
        <div v-else class="text-sm text-secondary-400">
          ผู้ใช้ถูกลบแล้ว (ID: {{ row.user_id }})
        </div>
      </template>

      <!-- Role Cell -->
      <template #cell-role="{ row }">
        <span
          v-if="row.user"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
          :class="getRoleBadgeClass(row.user.role)"
        >
          {{ getRoleLabel(row.user.role) }}
        </span>
        <span v-else class="text-secondary-400">-</span>
      </template>

      <!-- Status Cell -->
      <template #cell-status="{ row }">
        <span v-if="row.logout_at" class="inline-flex items-center gap-1.5 text-xs font-medium text-secondary-400 bg-secondary-50 border border-secondary-200 px-2 py-0.5 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-secondary-400"></span>
          ออฟไลน์
        </span>
        <span v-else class="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          กำลังใช้งานอยู่
        </span>
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

      <!-- IP Address Cell -->
      <template #cell-ip_address="{ value }">
        <span class="text-sm text-secondary-500 font-mono">
          {{ value || "-" }}
        </span>
      </template>

      <!-- Actions Cell -->
      <template #cell-actions="{ row }">
        <button
          @click.stop="openUserDetail(row)"
          class="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8"
          title="ดูประวัติการเข้าใช้งาน"
        >
          <Eye class="w-4 h-4" />
        </button>
      </template>
    </BaseTable>

    <!-- Detailed Session Modal -->
    <BaseModal
      v-if="isModalOpen"
      title="ประวัติกิจกรรมผู้ใช้งาน"
      size="lg"
      @close="isModalOpen = false"
    >
      <div v-if="selectedUser" class="space-y-6">
        <!-- User Profile Summary Card -->
        <div class="p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-100/30 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-200 uppercase shrink-0">
              {{ selectedUser.first_name?.[0] || selectedUser.username?.[0] || 'U' }}
            </div>
            <div>
              <h4 class="font-bold text-lg text-secondary-900 flex items-center flex-wrap gap-2">
                <span>{{ formatUserName(selectedUser) }}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-white" :class="getRoleBadgeClass(selectedUser.role)">
                  {{ getRoleLabel(selectedUser.role) }}
                </span>
              </h4>
              <p class="text-xs text-secondary-500 mt-1 flex items-center gap-2">
                <span>Username: {{ selectedUser.username }}</span>
                <span class="text-secondary-300">|</span>
                <span>{{ selectedUser.email || 'ไม่มีอีเมล' }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-secondary-100 shadow-sm self-stretch md:self-auto justify-center">
            <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span class="text-xs font-semibold text-secondary-700">ประวัติกิจกรรมเชิงลึก</span>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-white rounded-xl border border-secondary-100 flex items-center gap-3.5 shadow-sm">
            <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Activity class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-secondary-400 font-medium">ความถี่การล็อกอินทั้งหมด</p>
              <p class="text-lg font-bold text-secondary-900">{{ sessionPagination.total }} ครั้ง</p>
            </div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-secondary-100 flex items-center gap-3.5 shadow-sm">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-secondary-400 font-medium">ระยะเวลาใช้งานเฉลี่ยต่อครั้ง</p>
              <p class="text-lg font-bold text-secondary-900">
                {{ averageDuration }} {{ typeof averageDuration === 'number' ? 'นาที' : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sessions History Table Section -->
        <div class="space-y-3">
          <h5 class="font-bold text-sm text-secondary-800 flex items-center gap-1.5">
            <Users class="w-4.5 h-4.5 text-secondary-400" />
            <span>บันทึกประวัติการล็อกอินย้อนหลัง</span>
          </h5>

          <BaseTable
            :columns="historyColumns"
            :data="userSessions"
            :loading="loadingSessions"
            :pagination="sessionPagination"
            @page-change="fetchUserSessions"
            empty-text="ไม่พบประวัติการเชื่อมต่อระบบของผู้ใช้รายนี้"
          >
            <!-- Login At Cell -->
            <template #cell-login_at="{ value }">
              <span class="text-xs font-medium text-secondary-600 whitespace-nowrap">
                {{ formatDateTime(value as string) }}
              </span>
            </template>

            <!-- Logout At Cell -->
            <template #cell-logout_at="{ value }">
              <span v-if="value" class="text-xs text-secondary-500 whitespace-nowrap">
                {{ formatDateTime(value as string) }}
              </span>
              <span v-else class="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full animate-pulse">
                กำลังใช้งานอยู่
              </span>
            </template>

            <!-- Duration Minutes Cell -->
            <template #cell-duration_minutes="{ value }">
              <span class="text-xs font-mono font-semibold" :class="value !== null ? 'text-secondary-700' : 'text-secondary-400'">
                {{ value !== null ? `${value} นาที` : "-" }}
              </span>
            </template>

            <!-- IP Address Cell -->
            <template #cell-ip_address="{ value }">
              <span class="text-xs font-mono text-secondary-500">
                {{ value || "-" }}
              </span>
            </template>

            <!-- User Agent Cell -->
            <template #cell-user_agent="{ value }">
              <div class="flex items-center gap-1 text-xs text-secondary-500" :title="(value as string) || ''">
                <Monitor class="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                <span class="truncate max-w-[120px]">
                  {{ getShortUserAgent(value as string | null) }}
                </span>
              </div>
            </template>
          </BaseTable>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
