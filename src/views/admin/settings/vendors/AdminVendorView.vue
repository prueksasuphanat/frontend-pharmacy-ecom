<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Plus, Edit, Trash2 } from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseToggle,
  BaseModal,
  BaseAutocomplete,
  BaseTextarea,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { Vendor } from "@/types";
import { useVendorStore } from "@/stores";
import { formatDate, formatNum } from "@/utils";

const vendorStore = useVendorStore();

const searchQuery = ref("");
const statusFilter = ref<string | number | null>(null);

const addModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const modalLoading = ref(false);

const vendorForm = ref({
  name: "",
  seller_code: "",
  address: "",
  phone: "",
  is_active: true,
});

const selectedVendor = ref<Vendor | null>(null);

const vendors = computed(() => vendorStore.vendors);
const loading = computed(() => vendorStore.isLoading);
const pagination = computed(() => vendorStore.pagination);

const columns: Column<Vendor>[] = [
  { key: "name", label: "ชื่อผู้จำหน่าย", minWidth: "180px" },
  { key: "seller_code", label: "รหัสผู้ขาย", width: "110px" },
  { key: "pmc_vendor_id", label: "PMC ID", width: "90px", align: "center" },
  { key: "phone", label: "เบอร์โทรศัพท์", width: "130px" },
  { key: "_count", label: "จำนวนสินค้า", width: "120px", align: "center" },
  { key: "is_active", label: "สถานะ", width: "100px", align: "center" },
  { key: "actions", label: "จัดการ", width: "120px", align: "center" },
];

const statusOptions = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ไม่ใช้งาน" },
];

async function fetchVendors() {
  await vendorStore.getVendors({
    page: pagination.value.page,
    limit: pagination.value.limit,
    search: searchQuery.value || undefined,
    is_active:
      statusFilter.value === null ? undefined : statusFilter.value === "active",
  });
}

function handlePageChange(page: number) {
  vendorStore.pagination.page = page;
  fetchVendors();
}

function handleSearch() {
  vendorStore.pagination.page = 1;
  fetchVendors();
}

function handleStatusFilterChange() {
  vendorStore.pagination.page = 1;
  fetchVendors();
}

function handleAddVendor() {
  vendorForm.value = {
    name: "",
    seller_code: "",
    address: "",
    phone: "",
    is_active: true,
  };
  addModalOpen.value = true;
}

function closeAddModal() {
  addModalOpen.value = false;
}

async function saveVendor() {
  if (!vendorForm.value.name.trim()) return;

  modalLoading.value = true;
  const success = await vendorStore.createVendor({
    name: vendorForm.value.name.trim(),
    seller_code: vendorForm.value.seller_code.trim() || undefined,
    address: vendorForm.value.address.trim() || undefined,
    phone: vendorForm.value.phone.trim() || undefined,
  });
  modalLoading.value = false;

  if (success) {
    closeAddModal();
  }
}

async function handleEditVendor(vendor: Vendor) {
  selectedVendor.value = vendor;
  modalLoading.value = true;
  editModalOpen.value = true;

  const fresh = await vendorStore.getVendorById(vendor.id);
  modalLoading.value = false;

  if (fresh) {
    selectedVendor.value = fresh;
    vendorForm.value = {
      name: fresh.name,
      seller_code: fresh.seller_code || "",
      address: fresh.address || "",
      phone: fresh.phone || "",
      is_active: fresh.is_active,
    };
  }
}

function closeEditModal() {
  editModalOpen.value = false;
  selectedVendor.value = null;
}

async function updateVendor() {
  if (!selectedVendor.value) return;
  if (!vendorForm.value.name.trim()) return;

  modalLoading.value = true;
  const success = await vendorStore.updateVendor(selectedVendor.value.id, {
    name: vendorForm.value.name.trim(),
    seller_code: vendorForm.value.seller_code.trim() || undefined,
    address: vendorForm.value.address.trim() || undefined,
    phone: vendorForm.value.phone.trim() || undefined,
    is_active: vendorForm.value.is_active,
  });
  modalLoading.value = false;

  if (success) {
    closeEditModal();
  }
}

function handleDeleteVendor(vendor: Vendor) {
  selectedVendor.value = vendor;
  deleteModalOpen.value = true;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  selectedVendor.value = null;
}

async function confirmDeleteVendor() {
  if (!selectedVendor.value) return;

  modalLoading.value = true;
  const success = await vendorStore.deleteVendor(selectedVendor.value.id);
  modalLoading.value = false;

  if (success) {
    closeDeleteModal();
  }
}

async function handleToggleStatus(vendor: Vendor) {
  await vendorStore.toggleVendorActive(vendor.id);
}

onMounted(() => {
  fetchVendors();
});
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">ผู้จำหน่าย (Vendors)</h1>

      <button class="btn-primary text-sm gap-1.5" @click="handleAddVendor">
        <Plus class="w-4 h-4" /> เพิ่ม
      </button>
    </div>

    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <BaseInput
            v-model="searchQuery"
            placeholder="ค้นหาชื่อผู้จำหน่าย หรือรหัสผู้ขาย..."
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
      :data="vendors"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลผู้จำหน่าย"
    >
      <template #cell-pmc_vendor_id="{ row }">
        <span class="text-xs font-mono text-secondary-500">{{ row.pmc_vendor_id ?? '—' }}</span>
      </template>

      <template #cell-is_active="{ row }">
        <BaseToggle
          :model-value="row.is_active"
          active-color="primary"
          @change="handleToggleStatus(row)"
        />
      </template>

      <template #cell-_count="{ value }">
        {{ formatNum((value as { products: number })?.products || 0) }} รายการ
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="handleEditVendor(row)"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไข"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            @click="handleDeleteVendor(row)"
            class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="ลบ"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal เพิ่มผู้จำหน่าย -->
    <BaseModal
      v-if="addModalOpen"
      title="เพิ่มผู้จำหน่าย"
      size="md"
      @close="closeAddModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <BaseInput
          v-model="vendorForm.name"
          label="ชื่อผู้จำหน่าย *"
          placeholder="กรอกชื่อผู้จำหน่าย"
          :disabled="modalLoading"
        />

        <BaseInput
          v-model="vendorForm.seller_code"
          label="รหัสผู้ขาย (Seller Code)"
          placeholder="กรอกรหัสผู้ขาย"
          :disabled="modalLoading"
        />

        <BaseInput
          v-model="vendorForm.phone"
          label="เบอร์โทรศัพท์"
          placeholder="กรอกเบอร์โทรศัพท์"
          :disabled="modalLoading"
        />

        <BaseTextarea
          v-model="vendorForm.address"
          label="ที่อยู่"
          placeholder="กรอกที่อยู่ผู้จำหน่าย"
          :rows="3"
          :disabled="modalLoading"
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
          @click="saveVendor"
          :disabled="modalLoading || !vendorForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal แก้ไขผู้จำหน่าย -->
    <BaseModal
      v-if="editModalOpen && selectedVendor"
      title="แก้ไขผู้จำหน่าย"
      size="md"
      @close="closeEditModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <BaseInput
          v-model="vendorForm.name"
          label="ชื่อผู้จำหน่าย *"
          placeholder="กรอกชื่อผู้จำหน่าย"
          :disabled="modalLoading"
        />

        <BaseInput
          v-model="vendorForm.seller_code"
          label="รหัสผู้ขาย (Seller Code)"
          placeholder="กรอกรหัสผู้ขาย"
          :disabled="modalLoading"
        />

        <BaseInput
          v-model="vendorForm.phone"
          label="เบอร์โทรศัพท์"
          placeholder="กรอกเบอร์โทรศัพท์"
          :disabled="modalLoading"
        />

        <BaseTextarea
          v-model="vendorForm.address"
          label="ที่อยู่"
          placeholder="กรอกที่อยู่ผู้จำหน่าย"
          :rows="3"
          :disabled="modalLoading"
        />

        <div class="flex items-center justify-between">
          <label class="label">สถานะการใช้งาน</label>
          <BaseToggle
            v-model="vendorForm.is_active"
            active-color="primary"
            :disabled="modalLoading"
          />
        </div>

        <div
          class="pt-4 mt-4 border-t border-secondary-100 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
        >
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">รหัส PMC Vendor ID</p>
            <p class="text-secondary-900 font-medium">
              {{ selectedVendor.pmc_vendor_id }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">จำนวนสินค้าในระบบ</p>
            <p class="text-secondary-900 font-medium">
              {{ formatNum(selectedVendor._count?.products || 0) }} รายการ
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สร้างเมื่อ</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedVendor.created_at, "DD MMM BBBB HH:mm") }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">อัปเดตล่าสุด</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedVendor.updated_at, "DD MMM BBBB HH:mm") }}
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
          @click="updateVendor"
          :disabled="modalLoading || !vendorForm.name.trim()"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal ยืนยันการลบ -->
    <BaseModal
      v-if="deleteModalOpen && selectedVendor"
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
          คุณต้องการลบผู้จำหน่ายนี้หรือไม่?
        </p>
        <p class="text-sm text-secondary-600 mb-1">
          <span class="font-medium">{{ selectedVendor.name }}</span>
        </p>
        <p class="text-xs text-red-600 mt-3">
          การดำเนินการนี้ไม่สามารถย้อนกลับได้ และจะเป็นการปิดการเชื่อมโยงผู้จำหน่ายรายนี้
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
          @click="confirmDeleteVendor"
          :disabled="modalLoading"
        >
          {{ modalLoading ? "กำลังลบ..." : "ลบ" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
