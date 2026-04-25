<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  Users,
  Edit,
  Search,
  ChevronLeft,
  CircleCheckBig,
  File,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useUsersStore } from "@/stores";
import { formatDate } from "@/utils";

import type { GetUsersParams } from "@/api";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { User } from "@/types";

import {
  BaseTable,
  BaseInput,
  BaseToggle,
  LoadingOverlay,
  BaseModal,
  BaseDatePicker,
  BaseAutocomplete,
} from "@/components/ui";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
  { value: "CUSTOMER", label: "ลูกค้า" },
];

const TITLE_OPTIONS = [
  { value: "", label: "ไม่ระบุ" },
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "ใช้งาน" },
  { value: "false", label: "ระงับ" },
];

const MOCKFILES = [
  {
    url: "https://pdfobject.com/pdf/sample.pdf",
    name: "ใบไรซักอย่าง.pdf",
  },
  {
    url: "https://pdfobject.com/pdf/sample.pdf",
    name: "ใบไรซักอย่าง2.pdf",
  },
];

const router = useRouter();
const userStore = useUsersStore();

const searchQuery = ref("");
const selectedRole = ref<string | number | null>(null);
const selectedStatus = ref<string | number | null>(null);
const loading = ref(false);

const ROLE_OPTIONS_FOR_EDIT = ROLE_OPTIONS.filter((r) => r.value !== "");

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const pagination = computed(() => userStore.pagination);

const columns: Column<User>[] = [
  { key: "email", label: "อีเมล", minWidth: "20%", align: "left" },
  { key: "full_name", label: "ชื่อ-นามสกุล", width: "18%", align: "left" },
  { key: "role", label: "Role", minWidth: "200px", align: "left" },
  {
    key: "is_verified",
    label: "อีเมลยืนยัน",
    align: "left",
    width: "120px",
  },
  { key: "is_active", label: "สถานะ", align: "left", width: "90px" },
  { key: "actions", label: "", align: "right", width: "10px", fixed: "right" },
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
    if (selectedStatus.value !== null)
      params.is_active = selectedStatus.value === "true";

    await userStore.getUsers(params);
  } finally {
    loading.value = false;
  }
};

function handlePageChange(page: number) {
  fetchUsers(page);
}

const roleChangeModal = ref(false);
const pendingRoleChange = ref<{
  userId: number;
  newRole: string;
  oldRole: string;
} | null>(null);

function updateUserRole(userId: number, newRole: string) {
  const user = users.value.find((u) => u.id === userId);
  if (!user) return;

  // Open confirmation modal
  pendingRoleChange.value = {
    userId,
    newRole,
    oldRole: user.role,
  };
  roleChangeModal.value = true;
}

async function confirmRoleChange() {
  if (!pendingRoleChange.value) return;

  await userStore.adminChangeRole(
    pendingRoleChange.value.userId,
    pendingRoleChange.value.newRole,
  );

  roleChangeModal.value = false;
  pendingRoleChange.value = null;
}

function cancelRoleChange() {
  roleChangeModal.value = false;
  pendingRoleChange.value = null;
}

function toggleUserStatus(userId: number) {
  userStore.toggleActive(userId);
}

const editModalOpen = ref(false);
const selectedUser = ref<User | null>(null);
const isEditMode = ref(false);
const modalLoading = ref(false);

const editForm = ref({
  code: "",
  email: "",
  title: "",
  first_name: "",
  last_name: "",
  phone: "",
  expired_date: "",
});

function editUser(user: User) {
  console.log("Selected user:", user);
  selectedUser.value = user;
  isEditMode.value = false;
  editModalOpen.value = true;
  modalLoading.value = true;

  userStore
    .adminGetUserById(user.id)
    .then((fresh) => {
      if (!fresh) return;
      selectedUser.value = fresh;
      editForm.value = {
        code: fresh.code || "",
        email: fresh.email || "",
        title: fresh.title || "",
        first_name: fresh.first_name || "",
        last_name: fresh.last_name || "",
        phone: fresh.phone || "",
        expired_date: fresh.expired_date ? fresh.expired_date.slice(0, 10) : "",
      };
    })
    .finally(() => {
      modalLoading.value = false;
    });
}

function closeEditModal() {
  editModalOpen.value = false;
  selectedUser.value = null;
  isEditMode.value = false;
}

function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
}

async function saveUserChanges() {
  if (!selectedUser.value) return;
  modalLoading.value = true;

  const ok = await userStore.adminUpdateUserById(selectedUser.value.id, {
    code: editForm.value.code || undefined,
    email: editForm.value.email || undefined,
    title: editForm.value.title || null,
    first_name: editForm.value.first_name || undefined,
    last_name: editForm.value.last_name || undefined,
    phone: editForm.value.phone || undefined,
    expired_date: editForm.value.expired_date || null,
  });

  if (ok) {
    // Refresh selectedUser with latest data from API
    const fresh = await userStore.adminGetUserById(selectedUser.value.id);
    if (fresh) selectedUser.value = fresh;
    isEditMode.value = false;
  }

  modalLoading.value = false;
}

function verifyUser() {
  if (!selectedUser.value) return;

  userStore.verifiredUser(selectedUser.value.id).then((ok) => {
    if (ok && selectedUser.value) {
      selectedUser.value = { ...selectedUser.value, is_verified: true };
    }
  });
}

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
        <p class="text-xs text-secondary-400 mb-1">ยืนยันอีเมล</p>
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

        <BaseAutocomplete
          v-model="selectedRole"
          :options="ROLE_OPTIONS"
          placeholder="ทุก Role"
          clearable
          class="w-full sm:w-48 shrink-0"
        />

        <BaseAutocomplete
          v-model="selectedStatus"
          :options="STATUS_OPTIONS"
          placeholder="ทุกสถานะ"
          clearable
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
          <BaseAutocomplete
            :model-value="row.role"
            :options="ROLE_OPTIONS_FOR_EDIT"
            class="max-w-[140px]"
            @update:model-value="updateUserRole(row.id, $event as string)"
          />
        </template>

        <!-- Email Verified Column -->
        <template #cell-is_verified="{ row }">
          <span
            v-if="row.is_verified"
            class="badge badge-green text-xs inline-block"
          >
            ✓ ยืนยัน
          </span>
          <span v-else class="badge badge-red text-xs inline-block">
            ยังไม่ยืนยัน
          </span>
        </template>

        <!-- Status Column -->
        <template #cell-is_active="{ row }">
          <BaseToggle
            :model-value="row.is_active"
            active-color="primary"
            @change="toggleUserStatus(row.id)"
          />
        </template>

        <!-- Actions Column -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              @click="editUser(row)"
              class="btn-ghost text-xs gap-1 px-2 py-1 text-primary-600"
            >
              <Edit class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal
      v-if="editModalOpen && selectedUser"
      title="แก้ไขผู้ใช้งาน"
      size="md"
      @close="closeEditModal"
    >
      <!-- Loading overlay -->
      <div class="relative min-h-[120px]">
        <LoadingOverlay :loading="modalLoading" text="กำลังโหลดข้อมูล..." />

        <!-- Mock profile avatar -->
        <div
          class="flex items-center gap-3 mb-4 pb-4 border-b border-secondary-100"
        >
          <div
            class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl select-none shrink-0"
          >
            {{ selectedUser.first_name?.charAt(0).toUpperCase()
            }}{{ selectedUser.last_name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-semibold text-secondary-900">
              {{ selectedUser.first_name }} {{ selectedUser.last_name }}
            </p>
            <p class="text-sm text-secondary-400">{{ selectedUser.email }}</p>
          </div>
        </div>

        <!-- View Mode -->
        <dl v-if="!isEditMode" class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt class="text-secondary-400">ID</dt>
          <dd class="text-secondary-900 font-medium">{{ selectedUser.id }}</dd>

          <dt class="text-secondary-400">รหัสผู้ใช้</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.code || "-" }}
          </dd>

          <dt class="text-secondary-400">อีเมล</dt>
          <dd class="text-secondary-900 font-medium break-all">
            {{ selectedUser.email }}
          </dd>

          <dt class="text-secondary-400">Username</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.username }}
          </dd>

          <dt class="text-secondary-400">ชื่อ-นามสกุล</dt>
          <dd class="text-secondary-900 font-medium">
            {{
              [
                selectedUser.title,
                selectedUser.first_name,
                selectedUser.last_name,
              ]
                .filter(Boolean)
                .join(" ") || "-"
            }}
          </dd>

          <dt class="text-secondary-400">เบอร์โทร</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.phone || "-" }}
          </dd>

          <dt class="text-secondary-400">วันเกิด</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.birthdate || "-" }}
          </dd>

          <dt class="text-secondary-400">ที่อยู่</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.address || "-" }}
          </dd>

          <dt class="text-secondary-400">Role</dt>
          <dd class="text-secondary-900 font-medium">
            {{ selectedUser.role }}
          </dd>

          <dt class="text-secondary-400">สถานะ</dt>
          <dd>
            <span
              :class="
                selectedUser.is_active ? 'badge badge-green' : 'badge badge-red'
              "
              class="text-xs"
            >
              {{ selectedUser.is_active ? "ใช้งาน" : "ระงับ" }}
            </span>
          </dd>

          <dt class="text-secondary-400">ยืนยันอีเมล</dt>
          <dd>
            <span
              :class="
                selectedUser.is_verified
                  ? 'badge badge-green'
                  : 'badge badge-red'
              "
              class="text-xs"
            >
              {{ selectedUser.is_verified ? "✓ ยืนยัน" : "ยังไม่ยืนยัน" }}
            </span>
          </dd>

          <dt class="text-secondary-400">วันหมดอายุผู้ใช้งาน</dt>
          <dd class="text-secondary-900 font-medium">
            {{ formatDate(selectedUser.expired_date, "DD MMM BBBB") }}
          </dd>

          <dt class="text-secondary-400">สร้างโดย</dt>
          <dd class="text-secondary-900 font-medium">
            {{ userStore.getFullName(selectedUser.created_by) || "-" }}
          </dd>

          <dt class="text-secondary-400">อัปเดตโดย</dt>
          <dd class="text-secondary-900 font-medium">
            {{ userStore.getFullName(selectedUser.updated_by) || "-" }}
          </dd>

          <dt class="text-secondary-400">สร้างเมื่อ</dt>
          <dd class="text-secondary-900 font-medium">
            {{ formatDate(selectedUser.created_at, "DD MMM BBBB HH:mm") }}
          </dd>

          <dt class="text-secondary-400">อัปเดตล่าสุด</dt>
          <dd class="text-secondary-900 font-medium">
            {{ formatDate(selectedUser.updated_at, "DD MMM BBBB HH:mm") }}
          </dd>

          <dt
            class="text-secondary-400 col-span-2 pt-2 border-t border-secondary-100"
          >
            เอกสารแนบ
          </dt>
          <dd class="col-span-2">
            <div v-if="MOCKFILES.length" class="flex flex-col gap-2">
              <a
                v-for="file in MOCKFILES"
                :key="file.url"
                :href="file.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition-colors group"
              >
                <!-- Icon: PDF or Image -->

                <span
                  class="text-sm text-secondary-700 group-hover:text-primary-600 truncate flex-1"
                >
                  {{ file.name }}
                </span>
                <File class="w-4 h-4 text-primary-600" />
              </a>
            </div>
            <p v-else class="text-secondary-400 text-sm">-</p>
          </dd>
        </dl>

        <!-- Edit Mode -->
        <div v-else class="flex flex-col gap-4">
          <!-- Read-only info -->
          <div
            class="bg-secondary-50 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
          >
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ID</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedUser.id }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">Username</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedUser.username }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">Role</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedUser.role }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">สถานะ</p>
              <span
                :class="
                  selectedUser.is_active
                    ? 'badge badge-green'
                    : 'badge badge-red'
                "
                class="text-xs"
              >
                {{ selectedUser.is_active ? "ใช้งาน" : "ระงับ" }}
              </span>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ยืนยันอีเมล</p>
              <span
                :class="
                  selectedUser.is_verified
                    ? 'badge badge-green'
                    : 'badge badge-red'
                "
                class="text-xs"
              >
                {{ selectedUser.is_verified ? "✓ ยืนยัน" : "ยังไม่ยืนยัน" }}
              </span>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">สร้างเมื่อ</p>
              <p class="text-secondary-900 font-medium">
                {{ formatDate(selectedUser.created_at, "DD/MM/BBBB HH:mm") }}
              </p>
            </div>
          </div>

          <BaseInput
            v-model="editForm.code"
            label="รหัสผู้ใช้"
            placeholder="กรอกรหัสผู้ใช้"
          />
          <BaseInput
            v-model="editForm.email"
            label="อีเมล"
            type="email"
            placeholder="กรอกอีเมล"
          />
          <div>
            <p class="label mb-1">ชื่อ-นามสกุล</p>
            <div class="flex gap-2">
              <BaseAutocomplete
                v-model="editForm.title"
                :options="TITLE_OPTIONS"
                placeholder="คำนำหน้า"
                class="w-32 shrink-0"
              />
              <BaseInput
                v-model="editForm.first_name"
                placeholder="ชื่อ"
                class="flex-1"
              />
              <BaseInput
                v-model="editForm.last_name"
                placeholder="นามสกุล"
                class="flex-1"
              />
            </div>
          </div>
          <BaseInput
            v-model="editForm.phone"
            label="เบอร์โทร"
            type="tel"
            placeholder="กรอกเบอร์โทร"
          />

          <BaseDatePicker
            v-model="editForm.expired_date"
            label="วันหมดอายุผู้ใช้งาน"
            placeholder="เลือกวันหมดอายุผู้ใช้งาน"
          />
        </div>
      </div>
      <!-- end relative wrapper -->

      <template #footer>
        <div class="flex justify-between w-full">
          <button
            class="btn-primary text-sm"
            v-if="selectedUser.code && !selectedUser.is_verified"
            :class="{ 'opacity-40 cursor-not-allowed': !selectedUser.code }"
            @click="verifyUser"
          >
            ยืนยันผู้ใช้งาน
          </button>
          <div
            v-else-if="selectedUser.is_verified"
            class="w-5 h-5 text-primary-600"
          >
            <CircleCheckBig />
          </div>
          <button
            class="btn-primary text-sm opacity-40 cursor-not-allowed"
            v-else
            disabled
          >
            ยืนยันผู้ใช้งาน
          </button>

          <div class="flex gap-2">
            <!-- Edit mode: บันทึก / ยกเลิก | View mode: แก้ไข / ปิด -->
            <template v-if="isEditMode">
              <button class="btn-secondary text-sm" @click="toggleEditMode">
                ยกเลิก
              </button>
              <button class="btn-primary text-sm" @click="saveUserChanges">
                บันทึก
              </button>
            </template>
            <template v-else>
              <button class="btn-secondary text-sm" @click="closeEditModal">
                ปิด
              </button>
              <button class="btn-primary text-sm" @click="toggleEditMode">
                แก้ไข
              </button>
            </template>
          </div>
        </div>
      </template>
    </BaseModal>

    <!-- Role Change Confirmation Modal -->
    <BaseModal
      v-if="roleChangeModal && pendingRoleChange"
      title="ยืนยันการเปลี่ยน Role"
      size="sm"
      @close="cancelRoleChange"
    >
      <div class="text-center py-2">
        <p class="text-secondary-600 mb-4">คุณต้องการเปลี่ยน Role จาก</p>
        <div class="flex items-center justify-center gap-3 mb-4">
          <span class="badge badge-primary text-sm px-4 py-2">
            {{ pendingRoleChange.oldRole }}
          </span>
          <span class="text-secondary-400">→</span>
          <span class="badge badge-green text-sm px-4 py-2">
            {{ pendingRoleChange.newRole }}
          </span>
        </div>
        <p class="text-sm text-secondary-500">การเปลี่ยนแปลงนี้จะมีผลทันที</p>
      </div>

      <template #footer>
        <button class="btn-secondary text-sm" @click="cancelRoleChange">
          ยกเลิก
        </button>
        <button class="btn-primary text-sm" @click="confirmRoleChange">
          ยืนยัน
        </button>
      </template>
    </BaseModal>
  </div>
</template>
