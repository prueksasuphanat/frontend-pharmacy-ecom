<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Plus, Edit, Trash2 } from "lucide-vue-next";
import {
  BaseInput,
  BaseSelect,
  BaseTable,
  BaseToggle,
  BaseModal,
} from "@/components/ui";
import type { Column, PaginationConfig } from "@/components/ui/BaseTable.vue";
import type { Category } from "@/types";
import { useCategoryStore } from "@/stores";
import { formatDate } from "@/utils";

// Store
const categoryStore = useCategoryStore();

// State
const searchQuery = ref("");
const statusFilter = ref<string>("all");

// Modal state
const addModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const modalLoading = ref(false);
const categoryForm = ref({
  name: "",
  is_active: true,
});
const selectedCategory = ref<Category | null>(null);

// Computed
const categories = computed(() => categoryStore.categories);
const loading = computed(() => categoryStore.isLoading);
const pagination = computed(() => categoryStore.pagination);

// Table columns
const columns: Column<Category>[] = [
  { key: "name", label: "ชื่อประเภท" },
  { key: "is_active", label: "สถานะ", width: "120px", align: "center" },
  { key: "_count", label: "จำนวนสินค้า", width: "140px", align: "center" },
  { key: "actions", label: "จัดการ", width: "150px", align: "center" },
];

// Status filter options
const statusOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ไม่ใช้งาน" },
];

// Fetch categories
async function fetchCategories() {
  await categoryStore.getCategories({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: searchQuery.value || null,
    is_active:
      statusFilter.value === "all"
        ? undefined
        : statusFilter.value === "active",
  });
}

// Handle page change
function handlePageChange(page: number) {
  categoryStore.pagination.page = page;
  fetchCategories();
}

// Handle search
function handleSearch() {
  categoryStore.pagination.page = 1;
  fetchCategories();
}

// Handle status filter change
function handleStatusFilterChange() {
  categoryStore.pagination.page = 1;
  fetchCategories();
}

// Add category
function handleAddCategory() {
  categoryForm.value.name = "";
  categoryForm.value.is_active = true;
  addModalOpen.value = true;
}

// Close add modal
function closeAddModal() {
  addModalOpen.value = false;
  categoryForm.value.name = "";
  categoryForm.value.is_active = true;
}

// Save new category
async function saveCategory() {
  if (!categoryForm.value.name.trim()) {
    return;
  }

  modalLoading.value = true;
  const success = await categoryStore.createCategory(
    categoryForm.value.name.trim(),
  );
  modalLoading.value = false;

  if (success) {
    closeAddModal();
  }
}

// Edit category
async function handleEditCategory(category: Category) {
  selectedCategory.value = category;
  modalLoading.value = true;
  editModalOpen.value = true;

  // Fetch fresh data
  const fresh = await categoryStore.getCategoryById(category.id);
  modalLoading.value = false;

  if (fresh) {
    selectedCategory.value = fresh;
    categoryForm.value.name = fresh.name;
    categoryForm.value.is_active = fresh.is_active;
  }
}

// Close edit modal
function closeEditModal() {
  editModalOpen.value = false;
  selectedCategory.value = null;
  categoryForm.value.name = "";
  categoryForm.value.is_active = true;
}

// Update category
async function updateCategory() {
  if (!selectedCategory.value) return;

  if (!categoryForm.value.name.trim()) {
    return;
  }

  modalLoading.value = true;
  const success = await categoryStore.updateCategory(
    selectedCategory.value.id,
    {
      name: categoryForm.value.name.trim(),
      is_active: categoryForm.value.is_active,
    },
  );
  modalLoading.value = false;

  if (success) {
    closeEditModal();
  }
}

// Delete category
function handleDeleteCategory(category: Category) {
  selectedCategory.value = category;
  deleteModalOpen.value = true;
}

// Close delete modal
function closeDeleteModal() {
  deleteModalOpen.value = false;
  selectedCategory.value = null;
}

// Confirm delete category
async function confirmDeleteCategory() {
  if (!selectedCategory.value) return;

  modalLoading.value = true;
  const success = await categoryStore.deleteCategory(selectedCategory.value.id);
  modalLoading.value = false;

  if (success) {
    closeDeleteModal();
  }
}

// Toggle category status
async function handleToggleStatus(category: Category) {
  await categoryStore.toggleCategoryActive(category.id);
}

// Initialize
onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-6">
      <h1 class="page-title">ประเภทสินค้า</h1>

      <button class="btn-primary text-sm gap-1.5" @click="handleAddCategory">
        <Plus class="w-4 h-4" /> เพิ่ม
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <BaseInput
            v-model="searchQuery"
            placeholder="ค้นหาชื่อประเภท..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>

        <!-- Status Filter -->
        <div class="w-full sm:w-48">
          <BaseSelect
            v-model="statusFilter"
            :options="statusOptions"
            @change="handleStatusFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="categories"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลประเภทสินค้า"
    >
      <!-- Status Toggle -->
      <template #cell-is_active="{ row }">
        <BaseToggle
          :model-value="row.is_active"
          active-color="primary"
          @change="handleToggleStatus(row)"
        />
      </template>

      <!-- Product Count -->
      <template #cell-_count="{ value }">
        {{ (value as { products: number }).products }} รายการ
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="handleEditCategory(row)"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไข"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            @click="handleDeleteCategory(row)"
            class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ลบ"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Add Category Modal -->
    <BaseModal
      v-if="addModalOpen"
      title="เพิ่มประเภทสินค้า"
      size="sm"
      @close="closeAddModal"
    >
      <div class="py-2">
        <BaseInput
          v-model="categoryForm.name"
          label="ชื่อประเภท"
          placeholder="กรอกชื่อประเภทสินค้า"
          :disabled="modalLoading"
          @keyup.enter="saveCategory"
        />
      </div>

      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeAddModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-primary text-sm"
          @click="saveCategory"
          :disabled="modalLoading || !categoryForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <!-- Edit Category Modal -->
    <BaseModal
      v-if="editModalOpen && selectedCategory"
      title="แก้ไขประเภทสินค้า"
      size="sm"
      @close="closeEditModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <BaseInput
          v-model="categoryForm.name"
          label="ชื่อประเภท"
          placeholder="กรอกชื่อประเภทสินค้า"
          :disabled="modalLoading"
          @keyup.enter="updateCategory"
        />

        <div class="flex items-center justify-between">
          <label class="label">สถานะ</label>
          <BaseToggle
            v-model="categoryForm.is_active"
            active-color="primary"
            :disabled="modalLoading"
          />
        </div>

        <!-- Metadata -->
        <div
          class="pt-4 mt-4 border-t border-secondary-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
        >
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สร้างโดย</p>
            <p class="text-secondary-900 font-medium">
              {{ selectedCategory.created_by || "-" }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">อัปเดตโดย</p>
            <p class="text-secondary-900 font-medium">
              {{ selectedCategory.updated_by || "-" }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สร้างเมื่อ</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedCategory.created_at, "DD MMM BBBB HH:mm") }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">อัปเดตล่าสุด</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedCategory.updated_at, "DD MMM BBBB HH:mm") }}
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeEditModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-primary text-sm"
          @click="updateCategory"
          :disabled="modalLoading || !categoryForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-if="deleteModalOpen && selectedCategory"
      title="ยืนยันการลบ"
      size="sm"
      @close="closeDeleteModal"
    >
      <div class="text-center py-4">
        <div
          class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
        >
          <Trash2 class="w-6 h-6 text-red-600" />
        </div>
        <p class="text-secondary-900 font-medium mb-2">
          คุณต้องการลบประเภทสินค้านี้หรือไม่?
        </p>
        <p class="text-sm text-secondary-600 mb-1">
          <span class="font-medium">{{ selectedCategory.name }}</span>
        </p>
        <p class="text-xs text-red-600 mt-3">
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </div>

      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeDeleteModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-danger text-sm"
          @click="confirmDeleteCategory"
          :disabled="modalLoading"
        >
          {{ modalLoading ? "กำลังลบ..." : "ลบ" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
