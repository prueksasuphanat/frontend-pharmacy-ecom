<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  sortable?: boolean;
}

export interface PaginationConfig {
  page: number;
  totalPages: number;
  total: number;
  limit?: number; // Items per page (optional, will be calculated if not provided)
}

interface Props {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  pagination?: PaginationConfig;
  hoverable?: boolean;
  striped?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: "ไม่มีข้อมูล",
  hoverable: true,
  striped: false,
});

const emit = defineEmits<{
  pageChange: [page: number];
  sort: [column: keyof T | string, direction: "asc" | "desc"];
}>();

// Pagination calculations
const totalPages = computed(() => {
  if (!props.pagination) return 0;
  return props.pagination.totalPages;
});

const itemsPerPage = computed(() => {
  if (!props.pagination) return 10;
  return (
    props.pagination.limit ||
    Math.ceil(props.pagination.total / props.pagination.totalPages) ||
    10
  );
});

const startItem = computed(() => {
  if (!props.pagination || props.data.length === 0) return 0;
  return (props.pagination.page - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  if (!props.pagination) return props.data.length;
  return Math.min(
    props.pagination.page * itemsPerPage.value,
    props.pagination.total,
  );
});

const visiblePages = computed(() => {
  if (!props.pagination) return [];
  const current = props.pagination.page;
  const total = totalPages.value;
  const pages: (number | string)[] = [];

  if (total <= 5) {
    // Show all pages if 5 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 2) {
      pages.push("...");
    }

    // Show pages around current (only 1 page on each side)
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 1) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});

function goToPage(page: number) {
  if (!props.pagination) return;
  if (page < 1 || page > totalPages.value) return;
  if (page === props.pagination.page) return;
  emit("pageChange", page);
}

function getColumnAlign(align?: "left" | "center" | "right") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
</script>

<template>
  <div class="base-table-wrapper">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table
        :class="[
          'table',
          { 'table-hover': hoverable, 'table-striped': striped },
        ]"
      >
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="String(column.key)"
              :class="getColumnAlign(column.align)"
              :style="column.width ? { width: column.width } : undefined"
            >
              <slot :name="`header-${String(column.key)}`" :column="column">
                {{ column.label }}
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center py-12">
              <div class="flex items-center justify-center gap-2">
                <div
                  class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"
                ></div>
                <span class="text-sm text-secondary-500">กำลังโหลด...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length" class="text-center py-12">
              <slot name="empty">
                <div class="text-secondary-400">
                  <p class="text-sm">{{ emptyText }}</p>
                </div>
              </slot>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr v-else v-for="(row, index) in data" :key="index">
            <td
              v-for="column in columns"
              :key="String(column.key)"
              :class="getColumnAlign(column.align)"
              class="whitespace-nowrap"
            >
              <slot
                :name="`cell-${String(column.key)}`"
                :row="row"
                :value="row[column.key]"
                :index="index"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination"
      class="flex items-center justify-between px-6 py-4 border-t border-secondary-100"
    >
      <!-- Info -->
      <div class="text-sm text-secondary-500">
        แสดง
        <span class="font-medium text-secondary-900">{{ startItem }}</span>
        ถึง
        <span class="font-medium text-secondary-900">{{ endItem }}</span>
        จาก
        <span class="font-medium text-secondary-900">{{
          pagination.total
        }}</span>
        รายการ
      </div>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <!-- Previous Button -->
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="pagination-btn"
          :class="{
            'opacity-50 cursor-not-allowed': pagination.page === 1,
          }"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <!-- Page Numbers -->
        <button
          v-for="(page, idx) in visiblePages"
          :key="idx"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="page === '...'"
          :class="[
            'pagination-btn',
            {
              'pagination-btn-active': page === pagination.page,
              'cursor-default': page === '...',
            },
          ]"
        >
          {{ page }}
        </button>

        <!-- Next Button -->
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === totalPages"
          class="pagination-btn"
          :class="{
            'opacity-50 cursor-not-allowed': pagination.page === totalPages,
          }"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-table-wrapper {
  @apply bg-white rounded-xl border border-secondary-100 overflow-hidden;
}

.table-hover tbody tr:hover {
  @apply bg-secondary-50;
}

.table-striped tbody tr:nth-child(even) {
  @apply bg-secondary-50/50;
}

.pagination-btn {
  @apply min-w-[36px] h-9 px-3 flex items-center justify-center rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100 transition-colors;
}

.pagination-btn-active {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}
</style>
