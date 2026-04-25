<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  User as UserIcon,
  X,
  FileSpreadsheet,
} from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseDatePicker,
  LoadingOverlay,
  BaseModal,
  BaseAutocomplete,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { PricingType } from "@/types";
import { usePricingLogStore } from "@/stores";
import { formatDateTime } from "@/utils";
import { usersApi } from "@/api/admin/settings/users";
import type { User } from "@/api/admin/settings/users";

const store = usePricingLogStore();

const pricingType = computed({
  get: () => store.pricingType,
  set: (value: PricingType) => store.setPricingType(value),
});
const searchQuery = ref("");
const dateFilter = ref("");
const userFilter = ref<string | number | null>(null);
const users = ref<User[]>([]);

const pricingTypeOptions = [
  { value: "default", label: "ราคากลาง" },
  { value: "user", label: "ราคาตามผู้ใช้" },
];

const userOptions = computed(() =>
  users.value.map((u) => ({
    value: u.id,
    label: `${u.first_name || ""} ${u.last_name || ""} (${u.username})`.trim(),
  })),
);

const showProductModal = ref(false);
const showUserModal = ref(false);

const isDefault = computed(() => pricingType.value === "default");
const loading = computed(() => store.isLoading);
const modalLoading = computed(() => store.isModalLoading);
const pagination = computed(() => store.pagination);
const modalPagination = computed(() => store.modalPagination);
const selectedProduct = computed(() => store.selectedProduct);
const selectedUser = computed(() => store.selectedUser);

const logs = computed(() =>
  isDefault.value ? store.defaultLogs : store.specialLogs,
);

const defaultColumns: Column<any>[] = [
  { key: "changed_at", label: "วันที่เปลี่ยน", width: "160px" },
  { key: "product", label: "สินค้า", minWidth: "200px" },
  { key: "category", label: "ประเภท", width: "130px" },
  { key: "old_price", label: "ราคาเดิม", width: "120px", align: "right" },
  { key: "new_price", label: "ราคาใหม่", width: "120px", align: "right" },
  { key: "diff", label: "ส่วนต่าง", width: "120px", align: "right" },
  { key: "user", label: "ผู้เปลี่ยน", width: "160px" },
  { key: "actions", label: "", width: "50px", align: "center" },
];

const specialColumns: Column<any>[] = [
  { key: "changed_at", label: "วันที่เปลี่ยน", width: "160px" },
  { key: "product", label: "สินค้า", minWidth: "180px" },
  { key: "target_user", label: "ผู้ใช้ที่ตั้งราคา", width: "160px" },
  { key: "old_price", label: "ราคาเดิม", width: "110px", align: "right" },
  { key: "new_price", label: "ราคาใหม่", width: "110px", align: "right" },
  { key: "diff", label: "ส่วนต่าง", width: "110px", align: "right" },
  { key: "changed_by_user", label: "ผู้เปลี่ยน", width: "150px" },
  { key: "actions", label: "", width: "80px", align: "center" },
];

const columns = computed(() =>
  isDefault.value ? defaultColumns : specialColumns,
);

const defaultProductModalColumns: Column<any>[] = [
  { key: "changed_at", label: "วันที่เปลี่ยน", width: "180px" },
  { key: "old_price", label: "ราคาเดิม", width: "130px", align: "right" },
  { key: "new_price", label: "ราคาใหม่", width: "130px", align: "right" },
  { key: "diff", label: "ส่วนต่าง", width: "130px", align: "right" },
  { key: "user", label: "ผู้เปลี่ยน", minWidth: "160px" },
];

const specialProductModalColumns: Column<any>[] = [
  { key: "changed_at", label: "วันที่เปลี่ยน", width: "160px" },
  { key: "target_user", label: "ผู้ใช้", width: "150px" },
  { key: "old_price", label: "ราคาเดิม", width: "110px", align: "right" },
  { key: "new_price", label: "ราคาใหม่", width: "110px", align: "right" },
  { key: "diff", label: "ส่วนต่าง", width: "110px", align: "right" },
  { key: "changed_by_user", label: "ผู้เปลี่ยน", minWidth: "150px" },
];

const userModalColumns: Column<any>[] = [
  { key: "changed_at", label: "วันที่เปลี่ยน", width: "160px" },
  { key: "product", label: "สินค้า", minWidth: "200px" },
  { key: "old_price", label: "ราคาเดิม", width: "110px", align: "right" },
  { key: "new_price", label: "ราคาใหม่", width: "110px", align: "right" },
  { key: "diff", label: "ส่วนต่าง", width: "110px", align: "right" },
  { key: "changed_by_user", label: "ผู้เปลี่ยน", minWidth: "150px" },
];

function priceDiff(oldPrice: string, newPrice: string): number {
  return parseFloat(newPrice) - parseFloat(oldPrice);
}

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fullName(user: {
  title: string | null;
  first_name: string;
  last_name: string;
}): string {
  return [user.title, user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ");
}

async function fetchLogs() {
  await store.fetchLogs({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: searchQuery.value || undefined,
    changed_at: dateFilter.value || undefined,
    user_id: userFilter.value !== null ? Number(userFilter.value) : undefined,
  });
}

async function fetchUsers() {
  try {
    const res = await usersApi.getAll({ limit: 100, is_active: true });
    users.value = res.data.data;
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
}

function clearDateFilter() {
  dateFilter.value = "";
  handleFilterChange();
}

function handlePageChange(page: number) {
  store.pagination.page = page;
  fetchLogs();
}

function handleSearch() {
  store.pagination.page = 1;
  fetchLogs();
}

function handleFilterChange() {
  store.pagination.page = 1;
  fetchLogs();
}

function handlePricingTypeChange(value: string | number) {
  const newType = value as PricingType;
  store.setPricingType(newType);
  searchQuery.value = "";
  dateFilter.value = "";
  userFilter.value = "all";
  fetchLogs();
}

function exportToCSV() {
  const headers = isDefault.value
    ? [
        "วันที่เปลี่ยน",
        "สินค้า",
        "รหัส",
        "ประเภท",
        "ราคาเดิม",
        "ราคาใหม่",
        "ส่วนต่าง",
        "ผู้เปลี่ยน",
      ]
    : [
        "วันที่เปลี่ยน",
        "สินค้า",
        "รหัส",
        "ผู้ใช้ที่ตั้งราคา",
        "ราคาเดิม",
        "ราคาใหม่",
        "ส่วนต่าง",
        "ผู้เปลี่ยน",
      ];

  const rows = logs.value.map((log: any) => {
    const base = [
      formatDateTime(log.changed_at),
      log.product.name,
      log.product.code,
    ];

    if (isDefault.value) {
      return [
        ...base,
        log.product.categories?.map((c: any) => c.category.name).join(", ") ||
          "-",
        log.old_price,
        log.new_price,
        priceDiff(log.old_price, log.new_price).toFixed(2),
        fullName(log.user),
      ];
    } else {
      return [
        ...base,
        fullName(log.target_user),
        log.old_price,
        log.new_price,
        priceDiff(log.old_price, log.new_price).toFixed(2),
        fullName(log.changed_by_user),
      ];
    }
  });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pricing-logs-${isDefault.value ? "default" : "special"}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

async function openProductDetail(productId: number) {
  showProductModal.value = true;
  if (isDefault.value) {
    await store.fetchDefaultLogsByProduct(productId);
  } else {
    await store.fetchSpecialLogsByProduct(productId);
  }
}

function closeProductModal() {
  showProductModal.value = false;
  store.clearModal();
}

function handleProductModalPageChange(page: number) {
  if (!selectedProduct.value) return;
  if (isDefault.value) {
    store.fetchDefaultLogsByProduct(selectedProduct.value.id, {
      page,
      limit: 10,
    });
  } else {
    store.fetchSpecialLogsByProduct(selectedProduct.value.id, {
      page,
      limit: 10,
    });
  }
}

async function openUserDetail(userId: number) {
  showUserModal.value = true;
  await store.fetchSpecialLogsByUser(userId);
}

function closeUserModal() {
  showUserModal.value = false;
  store.clearModal();
}

function handleUserModalPageChange(page: number) {
  if (!selectedUser.value) return;
  store.fetchSpecialLogsByUser(selectedUser.value.id, { page, limit: 10 });
}

onMounted(async () => {
  if (store.pricingType === "user") {
    await fetchUsers();
  }
  await fetchLogs();
});

watch(
  () => store.pricingType,
  (newType) => {
    if (newType === "user" && users.value.length === 0) {
      fetchUsers();
    }
  },
);
</script>

<template>
  <div class="overflow-y-visible">
    <LoadingOverlay :loading="loading && logs.length > 0" />

    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">บันทึกการตั้งราคา</h1>
        <p class="text-sm text-secondary-400 mt-1">
          ติดตามการเปลี่ยนแปลงราคาสินค้าทั้งหมดในระบบ
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
      <div class="flex flex-col gap-4">
        <!-- Row 1: Pricing type + Search -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-56">
            <BaseAutocomplete
              v-model="pricingType"
              label="ประเภทการตั้งราคา"
              :options="pricingTypeOptions"
              @update:model-value="handlePricingTypeChange"
            />
          </div>
          <div class="flex-1">
            <BaseInput
              v-model="searchQuery"
              label="ค้นหา"
              placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า..."
              @input="handleSearch"
            >
              <template #prefix>
                <Search class="w-4 h-4 text-secondary-400" />
              </template>
            </BaseInput>
          </div>
        </div>

        <!-- Row 2: Date + User filter (special only) -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-52 relative">
            <BaseDatePicker
              v-model="dateFilter"
              label="วันที่เปลี่ยน"
              placeholder="เลือกวันที่"
              @update:model-value="handleFilterChange"
            />
            <button
              v-if="dateFilter"
              @click="clearDateFilter"
              class="absolute right-10 top-[38px] p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
              title="ล้างตัวกรอง"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- User filter (special pricing only) -->
          <div v-if="!isDefault" class="w-full sm:flex-1 relative">
            <BaseAutocomplete
              v-model="userFilter"
              label="กรองตามผู้ใช้"
              placeholder="ค้นหาผู้ใช้..."
              :options="userOptions"
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div v-else class="w-full sm:flex-1"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="logs"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลบันทึกการตั้งราคา"
    >
      <!-- Date -->
      <template #cell-changed_at="{ value }">
        <span class="text-sm text-secondary-600 whitespace-nowrap">
          {{ formatDateTime(value as string) }}
        </span>
      </template>

      <!-- Product -->
      <template #cell-product="{ row }">
        <div>
          <p class="text-sm font-medium text-secondary-900">
            {{ row.product.name }}
          </p>
          <p class="text-xs text-secondary-400">{{ row.product.code }}</p>
        </div>
      </template>

      <!-- Category (default only) -->
      <template #cell-category="{ row }">
        <span class="text-sm text-secondary-600">
          {{
            row.product.categories
              ?.map((c: any) => c.category.name)
              .join(", ") || "-"
          }}
        </span>
      </template>

      <!-- Target user (special only) -->
      <template #cell-target_user="{ row }">
        <div v-if="row.target_user">
          <p class="text-sm text-secondary-700">
            {{ fullName(row.target_user) }}
          </p>
          <p class="text-xs text-secondary-400">{{ row.target_user.role }}</p>
        </div>
        <span v-else class="text-sm text-secondary-400">-</span>
      </template>

      <!-- Old Price -->
      <template #cell-old_price="{ value }">
        <span class="text-sm text-secondary-600">
          ฿{{ formatPrice(value as string) }}
        </span>
      </template>

      <!-- New Price -->
      <template #cell-new_price="{ value }">
        <span class="text-sm font-medium text-secondary-900">
          ฿{{ formatPrice(value as string) }}
        </span>
      </template>

      <!-- Diff -->
      <template #cell-diff="{ row }">
        <span
          :class="[
            'text-sm font-medium inline-flex items-center gap-0.5',
            priceDiff(row.old_price, row.new_price) > 0
              ? 'text-red-600'
              : priceDiff(row.old_price, row.new_price) < 0
                ? 'text-green-600'
                : 'text-secondary-400',
          ]"
        >
          <ArrowUpRight
            v-if="priceDiff(row.old_price, row.new_price) > 0"
            class="w-3.5 h-3.5"
          />
          <ArrowDownRight
            v-else-if="priceDiff(row.old_price, row.new_price) < 0"
            class="w-3.5 h-3.5"
          />
          {{ priceDiff(row.old_price, row.new_price) > 0 ? "+" : ""
          }}{{ formatPrice(priceDiff(row.old_price, row.new_price)) }}
        </span>
      </template>

      <!-- User / changed_by_user (default) -->
      <template #cell-user="{ row }">
        <div>
          <p class="text-sm text-secondary-700">{{ fullName(row.user) }}</p>
          <p class="text-xs text-secondary-400">{{ row.user.role }}</p>
        </div>
      </template>

      <!-- Changed by user (special) -->
      <template #cell-changed_by_user="{ row }">
        <div v-if="row.changed_by_user">
          <p class="text-sm text-secondary-700">
            {{ fullName(row.changed_by_user) }}
          </p>
          <p class="text-xs text-secondary-400">
            {{ row.changed_by_user.role }}
          </p>
        </div>
        <span v-else class="text-sm text-secondary-400">-</span>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-1">
          <!-- View product history -->
          <button
            @click="openProductDetail(row.product_id)"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="ดูประวัติสินค้า"
          >
            <Eye class="w-4 h-4" />
          </button>
          <!-- View user history (special only) -->
          <button
            v-if="!isDefault && row.target_user"
            @click="openUserDetail(row.target_user.id)"
            class="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="ดูประวัติผู้ใช้"
          >
            <UserIcon class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- ─── Product Detail Modal ─────────────────────────────────────────── -->
    <BaseModal
      v-if="showProductModal"
      :title="
        selectedProduct
          ? `ประวัติราคา — ${selectedProduct.name}`
          : 'ประวัติราคาสินค้า'
      "
      size="lg"
      @close="closeProductModal"
    >
      <div class="relative min-h-[200px]">
        <LoadingOverlay :loading="modalLoading" />

        <!-- Product info with pricing type badge -->
        <div v-if="selectedProduct" class="mb-4 p-4 bg-secondary-50 rounded-lg">
          <div class="flex items-start justify-between mb-3">
            <span
              :class="[
                'badge text-xs',
                isDefault ? 'badge-blue' : 'badge-purple',
              ]"
            >
              {{ isDefault ? "ราคากลาง" : "ราคาตามผู้ใช้" }}
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">รหัสสินค้า</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedProduct.code }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ชื่อสินค้า</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedProduct.name }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ประเภท</p>
              <p class="text-secondary-900 font-medium">
                {{
                  selectedProduct.categories
                    ?.map((c: any) => c.category.name)
                    .join(", ") || "-"
                }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ราคาปัจจุบัน</p>
              <p class="font-semibold text-primary-600">
                ฿{{ formatPrice(selectedProduct.default_price) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Default: product logs -->
        <BaseTable
          v-if="isDefault"
          :columns="defaultProductModalColumns"
          :data="store.defaultProductLogs"
          :loading="modalLoading"
          :pagination="modalPagination"
          @page-change="handleProductModalPageChange"
          empty-text="ไม่พบข้อมูลบันทึกราคา"
        >
          <template #cell-changed_at="{ value }">
            <span class="text-sm text-secondary-600 whitespace-nowrap">
              {{ formatDateTime(value as string) }}
            </span>
          </template>
          <template #cell-old_price="{ value }">
            <span class="text-sm text-secondary-600">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-new_price="{ value }">
            <span class="text-sm font-medium text-secondary-900">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-diff="{ row }">
            <span
              :class="[
                'text-sm font-medium inline-flex items-center gap-0.5',
                priceDiff(row.old_price, row.new_price) > 0
                  ? 'text-red-600'
                  : priceDiff(row.old_price, row.new_price) < 0
                    ? 'text-green-600'
                    : 'text-secondary-400',
              ]"
            >
              <ArrowUpRight
                v-if="priceDiff(row.old_price, row.new_price) > 0"
                class="w-3.5 h-3.5"
              />
              <ArrowDownRight
                v-else-if="priceDiff(row.old_price, row.new_price) < 0"
                class="w-3.5 h-3.5"
              />
              {{ priceDiff(row.old_price, row.new_price) > 0 ? "+" : ""
              }}{{ formatPrice(priceDiff(row.old_price, row.new_price)) }}
            </span>
          </template>
          <template #cell-user="{ row }">
            <p class="text-sm text-secondary-700">{{ fullName(row.user) }}</p>
          </template>
        </BaseTable>

        <!-- Special: product logs -->
        <BaseTable
          v-else
          :columns="specialProductModalColumns"
          :data="store.specialProductLogs"
          :loading="modalLoading"
          :pagination="modalPagination"
          @page-change="handleProductModalPageChange"
          empty-text="ไม่พบข้อมูลบันทึกราคา"
        >
          <template #cell-changed_at="{ value }">
            <span class="text-sm text-secondary-600 whitespace-nowrap">
              {{ formatDateTime(value as string) }}
            </span>
          </template>
          <template #cell-target_user="{ row }">
            <p class="text-sm text-secondary-700">
              {{ fullName(row.target_user) }}
            </p>
          </template>
          <template #cell-old_price="{ value }">
            <span class="text-sm text-secondary-600">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-new_price="{ value }">
            <span class="text-sm font-medium text-secondary-900">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-diff="{ row }">
            <span
              :class="[
                'text-sm font-medium inline-flex items-center gap-0.5',
                priceDiff(row.old_price, row.new_price) > 0
                  ? 'text-red-600'
                  : priceDiff(row.old_price, row.new_price) < 0
                    ? 'text-green-600'
                    : 'text-secondary-400',
              ]"
            >
              <ArrowUpRight
                v-if="priceDiff(row.old_price, row.new_price) > 0"
                class="w-3.5 h-3.5"
              />
              <ArrowDownRight
                v-else-if="priceDiff(row.old_price, row.new_price) < 0"
                class="w-3.5 h-3.5"
              />
              {{ priceDiff(row.old_price, row.new_price) > 0 ? "+" : ""
              }}{{ formatPrice(priceDiff(row.old_price, row.new_price)) }}
            </span>
          </template>
          <template #cell-changed_by_user="{ row }">
            <p class="text-sm text-secondary-700">
              {{ fullName(row.changed_by_user) }}
            </p>
          </template>
        </BaseTable>
      </div>

      <template #footer>
        <button class="btn-secondary text-sm" @click="closeProductModal">
          ปิด
        </button>
      </template>
    </BaseModal>

    <!-- ─── User Detail Modal (Special only) ─────────────────────────────── -->
    <BaseModal
      v-if="showUserModal"
      :title="
        selectedUser
          ? `ประวัติราคาผู้ใช้ — ${fullName(selectedUser)}`
          : 'ประวัติราคาผู้ใช้'
      "
      size="lg"
      @close="closeUserModal"
    >
      <div class="relative min-h-[200px]">
        <LoadingOverlay :loading="modalLoading" />

        <!-- User info with badge -->
        <div v-if="selectedUser" class="mb-4 p-4 bg-secondary-50 rounded-lg">
          <div class="flex items-start justify-between mb-3">
            <span class="badge badge-purple text-xs">ราคาตามผู้ใช้</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ชื่อผู้ใช้</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedUser.username }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">ชื่อ-นามสกุล</p>
              <p class="text-secondary-900 font-medium">
                {{ fullName(selectedUser) }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">อีเมล</p>
              <p class="text-secondary-900 font-medium">
                {{ selectedUser.email }}
              </p>
            </div>
            <div>
              <p class="text-secondary-400 text-xs mb-0.5">บทบาท</p>
              <span class="badge badge-blue text-xs">
                {{ selectedUser.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- User logs table -->
        <BaseTable
          :columns="userModalColumns"
          :data="store.specialUserLogs"
          :loading="modalLoading"
          :pagination="modalPagination"
          @page-change="handleUserModalPageChange"
          empty-text="ไม่พบข้อมูลบันทึกราคา"
        >
          <template #cell-changed_at="{ value }">
            <span class="text-sm text-secondary-600 whitespace-nowrap">
              {{ formatDateTime(value as string) }}
            </span>
          </template>
          <template #cell-product="{ row }">
            <div>
              <p class="text-sm font-medium text-secondary-900">
                {{ row.product.name }}
              </p>
              <p class="text-xs text-secondary-400">{{ row.product.code }}</p>
            </div>
          </template>
          <template #cell-old_price="{ value }">
            <span class="text-sm text-secondary-600">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-new_price="{ value }">
            <span class="text-sm font-medium text-secondary-900">
              ฿{{ formatPrice(value as string) }}
            </span>
          </template>
          <template #cell-diff="{ row }">
            <span
              :class="[
                'text-sm font-medium inline-flex items-center gap-0.5',
                priceDiff(row.old_price, row.new_price) > 0
                  ? 'text-red-600'
                  : priceDiff(row.old_price, row.new_price) < 0
                    ? 'text-green-600'
                    : 'text-secondary-400',
              ]"
            >
              <ArrowUpRight
                v-if="priceDiff(row.old_price, row.new_price) > 0"
                class="w-3.5 h-3.5"
              />
              <ArrowDownRight
                v-else-if="priceDiff(row.old_price, row.new_price) < 0"
                class="w-3.5 h-3.5"
              />
              {{ priceDiff(row.old_price, row.new_price) > 0 ? "+" : ""
              }}{{ formatPrice(priceDiff(row.old_price, row.new_price)) }}
            </span>
          </template>
          <template #cell-changed_by_user="{ row }">
            <p class="text-sm text-secondary-700">
              {{ fullName(row.changed_by_user) }}
            </p>
          </template>
        </BaseTable>
      </div>

      <template #footer>
        <button class="btn-secondary text-sm" @click="closeUserModal">
          ปิด
        </button>
      </template>
    </BaseModal>
  </div>
</template>
