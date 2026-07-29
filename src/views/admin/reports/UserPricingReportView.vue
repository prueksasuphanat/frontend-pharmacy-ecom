<script setup lang="ts">
import { onMounted, computed } from 'vue';
import {
  useUserPricingReportStore,
  type UserPricingDetailItem
} from '@/stores/admin/reports/user-pricing-report.store';
import {
  BaseInput,
  BaseSelect,
  BaseMultiSelect,
  BaseTable,
  LoadingOverlay,
  type SelectOption,
  type MultiSelectOption,
  type Column
} from '@/components/ui';
import { formatNum } from '@/utils';
import { CheckCircle2, Download, RefreshCw, Search, Info } from 'lucide-vue-next';

const store = useUserPricingReportStore();

onMounted(() => {
  store.fetchCustomerOptions();
  store.fetchProductOptions();
  store.fetchReport(1);
});

// Format customer options for BaseMultiSelect
const userOptions = computed<MultiSelectOption[]>(() =>
  store.customerOptions.map((opt) => {
    const displayName =
      opt.pmc_name || [opt.first_name, opt.last_name].filter(Boolean).join(' ') || opt.name || `User #${opt.id}`;
    return {
      value: opt.id,
      label: `${displayName}`
    };
  })
);

// Format product options for BaseMultiSelect
const productOptions = computed<MultiSelectOption[]>(() =>
  store.productOptions.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.code})`
  }))
);

// Options for item pricing status filter
const itemStatusOptions: SelectOption[] = [
  { value: 'SET', label: 'เฉพาะสินค้าที่ตั้งราคา' },
  { value: 'UNSET', label: 'เฉพาะสินค้าที่ยังไม่ได้ตั้งราคา' },
  { value: 'ALL', label: 'สินค้าทั้งหมดในระบบ' }
];

// Options for user status filter
const userStatusOptions: SelectOption[] = [
  { value: 'ALL', label: 'ผู้ใช้งานทั้งหมด' },
  { value: 'UNSET', label: 'ผู้ใช้งานที่ยังไม่ได้ตั้งราคา' },
  { value: 'SET', label: 'ผู้ใช้งานที่มีการตั้งราคาแล้ว' }
];

// Table Columns Definition for Product Pricing Details View
const detailColumns: Column<UserPricingDetailItem>[] = [
  { key: 'user_id', label: 'User ID', width: '100px' },
  { key: 'customer_name', label: 'ชื่อลูกค้า / ร้านค้า', minWidth: '180px' },
  { key: 'product_code', label: 'รหัสสินค้า', width: '120px' },
  { key: 'product_name', label: 'ชื่อสินค้า', minWidth: '220px' },
  { key: 'unit_name', label: 'หน่วยขาย', width: '100px' },
  { key: 'special_price', label: 'ราคาที่ตั้งไว้ (บาท)', width: '150px', align: 'right' },
  { key: 'status_label', label: 'สถานะรายการ', width: '160px', align: 'center' }
];

// Computed Pagination for BaseTable
const tablePagination = computed(() => ({
  page: store.pagination.page,
  limit: store.pagination.limit,
  total: store.pagination.totalItems,
  totalPages: store.pagination.totalPages
}));

function handlePageChange(page: number) {
  store.fetchReport(page);
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    store.fetchReport(1);
  }, 350);
}

function handleStatusChange() {
  store.fetchReport(1);
}

function handleUserSelectChange() {
  store.fetchReport(1);
}

function handleProductSelectChange() {
  store.fetchReport(1);
}

function handleReset() {
  store.resetFilters();
}
</script>

<template>
  <div class="relative space-y-6">
    <LoadingOverlay :loading="store.isLoading" />

    <!-- Page Header -->
    <div class="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="page-title">รายงานการตั้งราคา</h1>
        <p class="text-sm text-secondary-500 mt-1">ตรวจสอบและติดตามรายการราคาสินค้าสำหรับผู้ใช้งานแต่ละราย</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="store.exportExcel"
          :disabled="store.isExporting"
          class="btn-primary flex items-center gap-2 text-sm px-4 py-2 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          <Download v-if="!store.isExporting" class="w-4 h-4" />
          <RefreshCw v-else class="w-4 h-4 animate-spin" />
          {{ store.isExporting ? 'กำลังส่งออก...' : 'Export Excel (.xlsx)' }}
        </button>
      </div>
    </div>

    <!-- Stat Cards (Standard Admin Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ลูกค้าทั้งหมด</p>
        <p class="text-2xl font-bold text-secondary-900">
          {{ formatNum(store.stats.totalCustomers) }} <span class="text-xs font-normal text-secondary-400">คน</span>
        </p>
      </div>

      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ยังไม่ได้ตั้งราคา</p>
        <p class="text-2xl font-bold text-amber-600">
          {{ formatNum(store.stats.totalUnset) }} <span class="text-xs font-normal text-secondary-400">คน</span>
        </p>
      </div>

      <div class="card">
        <p class="text-xs text-secondary-400 mb-1">ตั้งราคา</p>
        <p class="text-2xl font-bold text-teal-600">
          {{ formatNum(store.stats.totalSet) }} <span class="text-xs font-normal text-secondary-400">คน</span>
        </p>
      </div>
    </div>

    <!-- Filters & Action Bar Card -->
    <div class="card space-y-4">
      <div class="flex items-center justify-between border-b border-secondary-100 pb-3">
        <span class="text-xs font-semibold text-secondary-700 uppercase tracking-wider">ตัวกรองค้นหาข้อมูล</span>
        <button
          @click="handleReset"
          class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Filters Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <!-- Search Input -->
        <div class="flex flex-col justify-end min-w-0">
          <BaseInput
            label="ค้นหา"
            v-model="store.searchQuery"
            placeholder="ค้นหาชื่อผู้ใช้, รหัสสินค้า..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>

        <!-- BaseSelect สำหรับกรองสถานะสินค้ารายชิ้น -->
        <div class="flex flex-col justify-end min-w-0">
          <BaseSelect
            v-model="store.itemStatusFilter"
            label="กรองสถานะสินค้ารายชิ้น"
            :options="itemStatusOptions"
            @change="handleStatusChange"
          />
        </div>

        <!-- BaseSelect สำหรับกรองกลุ่มผู้ใช้งาน -->
        <div class="flex flex-col justify-end min-w-0">
          <BaseSelect
            v-model="store.statusFilter"
            label="กรองกลุ่มผู้ใช้งาน"
            :options="userStatusOptions"
            @change="handleStatusChange"
          />
        </div>

        <!-- BaseMultiSelect สำหรับเลือกผู้ใช้เฉพาะรายบุคคล -->
        <div class="flex flex-col justify-end min-w-0">
          <BaseMultiSelect
            v-model="store.selectedUserIds"
            label="เลือกผู้ใช้เฉพาะรายบุคคล"
            placeholder="เลือกผู้ใช้งาน..."
            :options="userOptions"
            hide-tags
            @change="handleUserSelectChange"
          />
        </div>

        <!-- BaseMultiSelect สำหรับเลือกสินค้าเฉพาะรายชิ้น -->
        <div class="flex flex-col justify-end min-w-0">
          <BaseMultiSelect
            v-model="store.selectedProductIds"
            label="เลือกสินค้าเฉพาะรายชิ้น"
            placeholder="เลือกสินค้า..."
            :options="productOptions"
            hide-tags
            @change="handleProductSelectChange"
          />
        </div>
      </div>
    </div>

    <!-- Data Table: DETAILS TABLE (รายการสินค้าและราคาสินค้า) -->
    <div>
      <BaseTable
        :columns="detailColumns"
        :data="store.detailItems"
        :loading="store.isLoading"
        :pagination="tablePagination"
        @page-change="handlePageChange"
        empty-text="ไม่พบรายการสินค้าราคาพิเศษตามเงื่อนไขที่เลือก"
      >
        <template #cell-user_id="{ value }">
          <span class="font-mono font-semibold text-secondary-800">#{{ value }}</span>
        </template>

        <template #cell-customer_name="{ row }">
          <div>
            <div class="font-medium text-secondary-900">{{ row.customer_name }}</div>
            <div class="text-[11px] text-secondary-400 font-mono">PMC: {{ row.pmc_customer_id }}</div>
          </div>
        </template>

        <template #cell-product_code="{ value }">
          <span class="font-mono font-medium text-secondary-700">{{ value }}</span>
        </template>

        <template #cell-product_name="{ value }">
          <span class="font-medium text-secondary-900">{{ value }}</span>
        </template>

        <template #cell-special_price="{ row }">
          <span class="font-mono font-bold" :class="row.is_custom_price ? 'text-teal-700' : 'text-secondary-400'">
            {{
              typeof row.special_price === 'number'
                ? `฿${row.special_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : row.special_price
            }}
          </span>
        </template>

        <template #cell-status_label="{ row }">
          <div class="flex justify-center">
            <span
              v-if="row.is_custom_price"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200"
            >
              <CheckCircle2 class="w-3 h-3" />
              ตั้งราคา
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
            >
              <Info class="w-3 h-3" />
              ยังไม่ได้ตั้งราคา
            </span>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
