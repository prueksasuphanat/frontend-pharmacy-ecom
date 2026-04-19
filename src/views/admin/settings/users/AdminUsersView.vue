<script setup lang="ts">
import { ref, computed } from "vue";
import { MOCK_ROLES, MOCK_USERS } from "@/__mocks__/users";
import type { User as MockUser } from "@/__mocks__/users";
import { BaseTable, BaseInput, BaseSelect } from "@/components/ui";
import type { Column, PaginationConfig } from "@/components/ui/BaseTable.vue";
import { Users, Edit, Search, ChevronLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

// TODO: GET /admin/users, GET /admin/roles

type User = MockUser;

const router = useRouter();
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const loading = ref(false);

// Pagination
const pagination = ref<PaginationConfig>({
  currentPage: 1,
  pageSize: 10,
  total: MOCK_USERS.length,
});

// Table columns
const columns: Column<User>[] = [
  { key: "email", label: "อีเมล", width: "25%" },
  { key: "full_name", label: "ชื่อ-นามสกุล", width: "20%" },
  { key: "role_name", label: "Role", width: "15%" },
  {
    key: "is_email_verified",
    label: "อีเมลยืนยัน",
    align: "center",
    width: "15%",
  },
  { key: "is_active", label: "สถานะ", align: "center", width: "10%" },
  { key: "actions", label: "จัดการ", align: "center", width: "15%" },
];

// Filtered and paginated data
const filteredUsers = computed(() => {
  let result = [...MOCK_USERS];

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        u.full_name?.toLowerCase().includes(query),
    );
  }

  // Filter by role
  if (selectedRole.value) {
    result = result.filter((u) => u.role_name === selectedRole.value);
  }

  // Filter by status
  if (selectedStatus.value === "active") {
    result = result.filter((u) => u.is_active);
  } else if (selectedStatus.value === "inactive") {
    result = result.filter((u) => !u.is_active);
  }

  // Update total count
  pagination.value.total = result.length;

  return result;
});

const paginatedUsers = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filteredUsers.value.slice(start, end);
});

function handlePageChange(page: number) {
  pagination.value.currentPage = page;
  // TODO: Fetch data from API
}

function updateUserRole(userId: string, newRole: string) {
  // TODO: PATCH /admin/users/:id/role { role_id: newRole }
  alert(`TODO: เปลี่ยน role user ${userId} → ${newRole}`);
}

function toggleUserStatus(userId: string, currentStatus: boolean) {
  // TODO: PATCH /admin/users/:id/status { is_active: !currentStatus }
  alert(`TODO: ${currentStatus ? "ระงับ" : "เปิดใช้งาน"} user ${userId}`);
}

function editUser(user: User) {
  // TODO: Open edit modal
  alert(`TODO: แก้ไขผู้ใช้ ${user.email}`);
}
</script>

<template>
  <div>
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

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ผู้ใช้งานทั้งหมด</p>
        <p class="text-2xl font-bold text-secondary-900">
          {{ MOCK_USERS.length }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ใช้งานอยู่</p>
        <p class="text-2xl font-bold text-green-600">
          {{ MOCK_USERS.filter((u) => u.is_active).length }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ระงับ</p>
        <p class="text-2xl font-bold text-red-600">
          {{ MOCK_USERS.filter((u) => !u.is_active).length }}
        </p>
      </div>
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ยืนยันอีเมลแล้ว</p>
        <p class="text-2xl font-bold text-primary-600">
          {{ MOCK_USERS.filter((u) => u.is_email_verified).length }}
        </p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="card mb-6">
      <div class="flex items-center gap-4">
        <BaseInput
          v-model="searchQuery"
          placeholder="ค้นหาด้วยอีเมล หรือชื่อ..."
          :icon="Search"
          class="flex-1"
        />

        <BaseSelect
          v-model="selectedRole"
          placeholder="ทุก Role"
          :options="[
            { value: '', label: 'ทุก Role' },
            ...MOCK_ROLES.map((r) => ({ value: r.name, label: r.label })),
          ]"
          class="w-48"
        />

        <BaseSelect
          v-model="selectedStatus"
          placeholder="ทุกสถานะ"
          :options="[
            { value: '', label: 'ทุกสถานะ' },
            { value: 'active', label: 'ใช้งาน' },
            { value: 'inactive', label: 'ระงับ' },
          ]"
          class="w-40"
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="mb-[100px]">
      <BaseTable
        :columns="columns"
        :data="paginatedUsers"
        :loading="loading"
        :pagination="pagination"
        empty-text="ไม่พบข้อมูลผู้ใช้"
        @page-change="handlePageChange"
      >
        <!-- Email Column with Avatar -->
        <template #cell-email="{ row }">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0"
            >
              <Users class="w-4 h-4 text-primary-600" />
            </div>
            <span class="text-sm font-medium">{{ row.email }}</span>
          </div>
        </template>

        <!-- Full Name Column -->
        <template #cell-full_name="{ row }">
          <span class="text-sm text-secondary-600">
            {{ row.full_name || "-" }}
          </span>
        </template>

        <!-- Role Column with Select -->
        <template #cell-role_name="{ row }">
          <BaseSelect
            :model-value="row.role_name"
            :options="
              MOCK_ROLES.map((r) => ({ value: r.name, label: r.label }))
            "
            @update:model-value="updateUserRole(row.id, $event as string)"
            class="py-1.5 text-xs w-auto min-w-[120px]"
          />
        </template>

        <!-- Email Verified Column -->
        <template #cell-is_email_verified="{ row }">
          <span
            v-if="row.is_email_verified"
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
          <div class="flex items-center justify-center gap-2">
            <button
              @click="toggleUserStatus(row.id, row.is_active)"
              :class="[
                'btn-ghost text-xs gap-1',
                row.is_active ? 'text-red-600' : 'text-green-600',
              ]"
            >
              {{ row.is_active ? "ระงับ" : "เปิดใช้งาน" }}
            </button>
            <button
              @click="editUser(row)"
              class="btn-ghost text-xs gap-1 text-primary-600"
            >
              <Edit class="w-3 h-3" />
            </button>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
