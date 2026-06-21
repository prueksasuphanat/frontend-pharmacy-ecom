<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Plus, Edit, Trash2 } from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseToggle,
  BaseModal,
  BaseAutocomplete,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { Unit } from "@/types";
import { useUnitStore } from "@/stores";
import { formatDate, formatNum } from "@/utils";

const unitStore = useUnitStore();

const searchQuery = ref("");
const statusFilter = ref<string | number | null>(null);

const addModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const modalLoading = ref(false);
const unitForm = ref({ name: "", is_active: true });
const selectedUnit = ref<Unit | null>(null);

const units = computed(() => unitStore.units);
const loading = computed(() => unitStore.isLoading);
const pagination = computed(() => unitStore.pagination);

const columns: Column<Unit>[] = [
  { key: "name", label: "ชื่อหน่วย" },
  { key: "is_active", label: "สถานะ", width: "120px", align: "center" },
  { key: "_count", label: "ใช้งาน", width: "160px", align: "center" },
  { key: "actions", label: "จัดการ", width: "150px", align: "center" },
];

const statusOptions = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ไม่ใช้งาน" },
];

async function fetchUnits() {
  await unitStore.getUnits({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: searchQuery.value || null,
    is_active:
      statusFilter.value === null ? undefined : statusFilter.value === "active",
  });
}

function handlePageChange(page: number) {
  unitStore.pagination.page = page;
  fetchUnits();
}

function handleSearch() {
  unitStore.pagination.page = 1;
  fetchUnits();
}

function handleStatusFilterChange() {
  unitStore.pagination.page = 1;
  fetchUnits();
}

function handleAddUnit() {
  unitForm.value = { name: "", is_active: true };
  addModalOpen.value = true;
}

function closeAddModal() {
  addModalOpen.value = false;
  unitForm.value = { name: "", is_active: true };
}

async function saveUnit() {
  if (!unitForm.value.name.trim()) return;
  modalLoading.value = true;
  const success = await unitStore.createUnit(unitForm.value.name.trim());
  modalLoading.value = false;
  if (success) closeAddModal();
}

async function handleEditUnit(unit: Unit) {
  selectedUnit.value = unit;
  editModalOpen.value = true;
  modalLoading.value = true;
  const fresh = await unitStore.getUnitById(unit.id);
  modalLoading.value = false;
  if (fresh) {
    selectedUnit.value = fresh;
    unitForm.value = { name: fresh.name, is_active: fresh.is_active };
  }
}

function closeEditModal() {
  editModalOpen.value = false;
  selectedUnit.value = null;
  unitForm.value = { name: "", is_active: true };
}

async function updateUnit() {
  if (!selectedUnit.value || !unitForm.value.name.trim()) return;
  modalLoading.value = true;
  const success = await unitStore.updateUnit(selectedUnit.value.id, {
    name: unitForm.value.name.trim(),
    is_active: unitForm.value.is_active,
  });
  modalLoading.value = false;
  if (success) closeEditModal();
}

function handleDeleteUnit(unit: Unit) {
  selectedUnit.value = unit;
  deleteModalOpen.value = true;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  selectedUnit.value = null;
}

async function confirmDeleteUnit() {
  if (!selectedUnit.value) return;
  modalLoading.value = true;
  const success = await unitStore.deleteUnit(selectedUnit.value.id);
  modalLoading.value = false;
  if (success) closeDeleteModal();
}

async function handleToggleStatus(unit: Unit) {
  await unitStore.toggleUnitActive(unit.id);
}

onMounted(() => {
  fetchUnits();
});
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">จัดการหน่วย</h1>
      <button class="btn-primary text-sm gap-1.5" @click="handleAddUnit">
        <Plus class="w-4 h-4" /> เพิ่มหน่วย
      </button>
    </div>

    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BaseInput
            v-model="searchQuery"
            placeholder="ค้นหาชื่อหน่วย..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>
        <div class="w-full sm:w-48">
          <BaseAutocomplete
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="สถานะทั้งหมด"
            clearable
            @update:model-value="handleStatusFilterChange"
          />
        </div>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="units"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลหน่วย"
    >
      <template #cell-is_active="{ row }">
        <BaseToggle
          :model-value="row.is_active"
          active-color="primary"
          @change="handleToggleStatus(row)"
        />
      </template>

      <template #cell-_count="{ value }">
        <span class="text-xs text-secondary-500">
          สินค้า {{ formatNum((value as Unit["_count"]).base_products) }} / หน่วยขาย
          {{ formatNum((value as Unit["_count"]).product_units) }}
        </span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="handleEditUnit(row)"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไข"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            @click="handleDeleteUnit(row)"
            class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ลบ"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal
      v-if="addModalOpen"
      title="เพิ่มหน่วย"
      size="sm"
      @close="closeAddModal"
    >
      <div class="py-2">
        <BaseInput
          v-model="unitForm.name"
          label="ชื่อหน่วย"
          placeholder="เช่น ซอง, กล่อง, ลัง"
          :disabled="modalLoading"
          @keyup.enter="saveUnit"
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
          @click="saveUnit"
          :disabled="modalLoading || !unitForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-if="editModalOpen && selectedUnit"
      title="แก้ไขหน่วย"
      size="sm"
      @close="closeEditModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <BaseInput
          v-model="unitForm.name"
          label="ชื่อหน่วย"
          placeholder="เช่น ซอง, กล่อง, ลัง"
          :disabled="modalLoading"
          @keyup.enter="updateUnit"
        />
        <div class="flex items-center justify-between">
          <label class="label">สถานะ</label>
          <BaseToggle
            v-model="unitForm.is_active"
            active-color="primary"
            :disabled="modalLoading"
          />
        </div>
        <div
          class="pt-4 mt-4 border-t border-secondary-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
        >
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สร้างเมื่อ</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedUnit.created_at, "DD MMM BBBB HH:mm") }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">อัปเดตล่าสุด</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedUnit.updated_at, "DD MMM BBBB HH:mm") }}
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
          @click="updateUnit"
          :disabled="modalLoading || !unitForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-if="deleteModalOpen && selectedUnit"
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
          คุณต้องการลบหน่วยนี้หรือไม่?
        </p>
        <p class="text-sm text-secondary-600 mb-1">
          <span class="font-medium">{{ selectedUnit.name }}</span>
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
          @click="confirmDeleteUnit"
          :disabled="modalLoading"
        >
          {{ modalLoading ? "กำลังลบ..." : "ลบ" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
