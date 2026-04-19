<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { User } from "@/types";
import {
  BaseTable,
  BaseInput,
  BaseSelect,
  LoadingOverlay,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import { Users, Edit, Search, ChevronLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useUsersStore } from "@/stores";
import type { GetUsersParams } from "@/api/users";

const ROLE_OPTIONS = [
  { value: "", label: "ทุก Role" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
  { value: "CUSTOMER", label: "ลูกค้า" },
];

const ROLE_OPTIONS_FOR_EDIT = ROLE_OPTIONS.filter((r) => r.value !== "");

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "true", label: "ใช้งาน" },
  { value: "false", label: "ระงับ" },
];

const router = useRouter();
const userStore = useUsersStore();

const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const loading = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const pagination = computed(() => userStore.pagination);

const columns: Column<User>[] = [
  { key: "email", label: "อีเมล", width: "20%", align: "left" },
  { key: "full_name", label: "ชื่อ-นามสกุล", width: "18%", align: "left" },
  { key: "role", label: "Role", width: "15%", align: "left" },
  {
    key: "is_verified",
    label: "อีเมลยืนยัน",
    align: "center",
    width: "12%",
  },
  { key: "is_active", label: "สถานะ", align: "center", width: "10%" },
  { key: "actions", label: "จัดการ", align: "center", width: "15%" },
];

const users = computed(() => userStore.users);

const stats = computed(() => ({
  total: pagination.value.total,
  active: users.value.filter((u) => u.is_active).length,
  inactive: users.value.filter((u) => !u.is_active).length,
  verified: users.value.filter((u) => u.is_verified).length,
}));

const fetchUsers = async (page = 1) => {
  try {
    loading.value = true;
    const params: GetUsersParams = {
      page,
      limit: pagination.value.limit,
    };
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedRole.value)
      params.role = selectedRole.value as GetUsersParams["role"];
    if (selectedStatus.value !== "")
      params.is_active = selectedStatus.value === "true";

    await userStore.getUsers(params);
  } finally {
    loading.value = false;
  }
};

function handlePageChange(page: number) {
  fetchUsers(page);
}

function updateUserRole(userId: number, newRole: string) {
  // TODO: PATCH /admin/users/:id/role { role_id: newRole }
  alert(`TODO: เปลี่ยน role user ${userId} → ${newRole}`);
}

function toggleUserStatus(userId: number, currentStatus: boolean) {
  // TODO: PATCH /admin/users/:id/status { is_active: !currentStatus }
  alert(`TODO: ${currentStatus ? "ระงับ" : "เปิดใช้งาน"} user ${userId}`);
}

function editUser(user: User) {
  // TODO: Open edit modal
  alert(`TODO: แก้ไขผู้ใช้ ${user.email}`);
}

// Watch filters — reset to page 1 on change
watch([selectedRole, selectedStatus], () => {
  fetchUsers(1);
});

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchUsers(1), 400);
});

onMounted(() => fetchUsers());
</script>

<template>
  <div>
    <LoadingOverlay :loading="loading && users.length > 0" />

    <!-- Back Button (Mobile) -->
    <button
      @click="router.push('/admin/settings')"
      class="lg:hidden flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-4 -ml-2"
    >
      <ChevronLeft class="w-5 h-5" />
      <span class="text-sm font-medium">กลับไปตั้งค่าระบบ</span>
    </button>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="page-title">จัดการผู้ใช้งาน</h1>
        <p class="text-sm text-secondary-500 mt-1">
          จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง
        </p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ผู้ใช้งานทั้งหมด</p>
        <p class="text-2xl font-bold text-secondary-900">
          {{ pagination.total }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ใช้งานอยู่</p>
        <p class="text-2xl font-bold text-green-600">
          {{ stats.active }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ระงับ</p>
        <p class="text-2xl font-bold text-red-600">
          {{ stats.inactive }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ยืนยันอีเมลแล้ว</p>
        <p class="text-2xl font-bold text-primary-600">
          {{ stats.verified }}
        </p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="card mb-6">
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
      >
        <BaseInput
          v-model="searchQuery"
          placeholder="ค้นหาด้วยอีเมล หรือชื่อ..."
          :icon="Search"
          class="flex-1 min-w-0"
        />

        <BaseSelect
          v-model="selectedRole"
          :options="ROLE_OPTIONS"
          class="w-full sm:w-48 shrink-0"
        />

        <BaseSelect
          v-model="selectedStatus"
          :options="STATUS_OPTIONS"
          class="w-full sm:w-40 shrink-0"
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="mb-[100px] relative">
      <BaseTable
        :columns="columns"
        :data="users"
        :loading="loading && users.length === 0"
        :pagination="{
          page: pagination.page,
          total: pagination.total,
          totalPages: pagination.totalPages,
          limit: pagination.limit,
        }"
        empty-text="ไม่พบข้อมูลผู้ใช้"
        @page-change="handlePageChange"
      >
        <!-- Email Column with Avatar -->
        <template #cell-email="{ row }">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0"
            >
              <Users class="w-4 h-4 text-primary-600" />
            </div>
            <span class="text-sm font-medium truncate">{{ row.email }}</span>
          </div>
        </template>

        <!-- Full Name Column -->
        <template #cell-full_name="{ row }">
          <span class="text-sm text-secondary-600 block truncate">
            {{
              [row.first_name, row.last_name].filter(Boolean).join(" ") || "-"
            }}
          </span>
        </template>

        <!-- Role Column -->
        <template #cell-role="{ row }">
          <BaseSelect
            :model-value="row.role"
            :options="ROLE_OPTIONS_FOR_EDIT"
            @update:model-value="updateUserRole(row.id, $event as string)"
            class="py-1.5 text-xs w-full max-w-[140px]"
          />
        </template>

        <!-- Email Verified Column -->
        <template #cell-is_verified="{ row }">
          <span
            v-if="row.is_verified"
            class="badge badge-green text-xs inline-block"
          >
            ✓ ยืนยันแล้ว
          </span>
          <span v-else class="badge badge-red text-xs inline-block">
            ยังไม่ยืนยัน
          </span>
        </template>

        <!-- Status Column -->
        <template #cell-is_active="{ row }">
          <span
            :class="[
              'badge text-xs inline-block',
              row.is_active ? 'badge-green' : 'badge-red',
            ]"
          >
            {{ row.is_active ? "ใช้งาน" : "ระงับ" }}
          </span>
        </template>

        <!-- Actions Column -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              @click="toggleUserStatus(row.id, row.is_active)"
              :class="[
                'btn-ghost text-xs gap-1 px-2 py-1',
                row.is_active ? 'text-red-600' : 'text-green-600',
              ]"
            >
              {{ row.is_active ? "ระงับ" : "เปิด" }}
            </button>
            <button
              @click="editUser(row)"
              class="btn-ghost text-xs gap-1 px-2 py-1 text-primary-600"
            >
              <Edit class="w-3 h-3" />
            </button>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
