<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Edit } from "lucide-vue-next";
import {
  BaseInput,
  BaseTable,
  BaseToggle,
  BaseModal,
  LoadingOverlay,
  BaseMultiSelect,
  BaseAutocomplete,
  BaseTextarea,
  ImageUploader,
} from "@/components/ui";
import type { Column } from "@/components/ui/BaseTable.vue";
import type { Product } from "@/types";
import { useProductStore, useCategoryStore } from "@/stores";
import { formatDate } from "@/utils";

// Stores
const productStore = useProductStore();
const categoryStore = useCategoryStore();

// State
const searchQuery = ref("");
const statusFilter = ref<string | number | null>(null);
const categoryFilter = ref<string | number | null>(null);
const specialPricingFilter = ref<string | number | null>(null);

// Modal state
const editModalOpen = ref(false);
const modalLoading = ref(false);
const selectedProduct = ref<Product | null>(null);
const imageFile = ref<File | null>(null);
const removeImage = ref(false);
const productForm = ref({
  code: "",
  name: "",
  generic_name: "",
  unit_name: "",
  using: "",
  warning: "",
  default_price: "",
  quantity: 0,
  category_ids: [] as number[],
  is_special_pricing_enabled: false,
});

// Computed
const products = computed(() => productStore.products);
const loading = computed(() => productStore.isLoading);
const pagination = computed(() => productStore.pagination);
const categories = computed(() => categoryStore.categories);

const currentImageUrl = computed(() => {
  if (removeImage.value) return null;
  const attachments = selectedProduct.value?.attachments;
  if (!attachments || attachments.length === 0) return null;
  return attachments[0].url;
});

// Table columns
const columns: Column<Product>[] = [
  { key: "code", label: "รหัสสินค้า", width: "120px" },
  { key: "name", label: "ชื่อสินค้า", minWidth: "250px" },
  { key: "category", label: "ประเภท", width: "150px" },
  { key: "quantity", label: "คงเหลือ", width: "100px", align: "center" },
  { key: "default_price", label: "ราคากลาง", width: "120px", align: "right" },
  {
    key: "is_special_pricing_enabled",
    label: "ราคาตามผู้ใช้",
    width: "120px",
    align: "center",
  },
  { key: "is_active", label: "สถานะ", width: "100px", align: "center" },
  {
    key: "actions",
    label: "จัดการ",
    width: "100px",
    align: "center",
    fixed: "right",
  },
];

// Filter options
const statusOptions = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ไม่ใช้งาน" },
];

const specialPricingOptions = [
  { value: "enabled", label: "เปิดใช้งาน" },
  { value: "disabled", label: "ปิดใช้งาน" },
];

const categoryOptions = computed(() =>
  categories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
  })),
);

const categoryOptionsForForm = computed(() =>
  categories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
  })),
);

async function fetchProducts() {
  await productStore.getProducts({
    page: pagination.value.page,
    limit: 10,
    search: searchQuery.value || undefined,
    is_active:
      statusFilter.value === null ? undefined : statusFilter.value === "active",
    category_id:
      categoryFilter.value !== null ? Number(categoryFilter.value) : undefined,
    is_special_pricing_enabled:
      specialPricingFilter.value === null
        ? undefined
        : specialPricingFilter.value === "enabled",
  });
}

function handlePageChange(page: number) {
  productStore.pagination.page = page;
  fetchProducts();
}

function handleSearch() {
  productStore.pagination.page = 1;
  fetchProducts();
}

function handleFilterChange() {
  productStore.pagination.page = 1;
  fetchProducts();
}

async function handleToggleStatus(product: Product) {
  await productStore.toggleProductActive(product.id);
}

async function handleEditProduct(product: Product) {
  selectedProduct.value = product;
  modalLoading.value = true;
  editModalOpen.value = true;
  imageFile.value = null;
  removeImage.value = false;

  const fresh = await productStore.getProductById(product.id);
  modalLoading.value = false;

  if (fresh) {
    selectedProduct.value = fresh;
    productForm.value = {
      code: fresh.code,
      name: fresh.name,
      generic_name: fresh.generic_name ?? "",
      unit_name: fresh.unit_name ?? "",
      using: fresh.using ?? "",
      warning: fresh.warning ?? "",
      default_price: fresh.default_price,
      quantity: fresh.quantity,
      category_ids: fresh.categories.map((c) => c.category_id),
      is_special_pricing_enabled: fresh.is_special_pricing_enabled,
    };
  }
}

function closeEditModal() {
  editModalOpen.value = false;
  selectedProduct.value = null;
  imageFile.value = null;
  removeImage.value = false;
  productForm.value = {
    code: "",
    name: "",
    generic_name: "",
    unit_name: "",
    using: "",
    warning: "",
    default_price: "",
    quantity: 0,
    category_ids: [],
    is_special_pricing_enabled: false,
  };
}

function handleImageChange(file: File | File[] | null) {
  imageFile.value = Array.isArray(file) ? (file[0] ?? null) : file;
}

async function updateProduct() {
  if (!selectedProduct.value) return;
  if (!productForm.value.code.trim() || !productForm.value.name.trim()) return;

  modalLoading.value = true;
  const success = await productStore.updateProduct(
    selectedProduct.value.id,
    {
      name: productForm.value.name.trim(),
      default_price: productForm.value.default_price,
      quantity: productForm.value.quantity,
      category_ids: productForm.value.category_ids,
      is_special_pricing_enabled: productForm.value.is_special_pricing_enabled,
      generic_name: productForm.value.generic_name || undefined,
      unit_name: productForm.value.unit_name || undefined,
      using: productForm.value.using || undefined,
      warning: productForm.value.warning || undefined,
    },
    imageFile.value,
    removeImage.value,
  );
  modalLoading.value = false;

  if (success) {
    closeEditModal();
  }
}

function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return numPrice.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

onMounted(async () => {
  await categoryStore.getCategories({ limit: 100 });
  await fetchProducts();
});
</script>

<template>
  <div>
    <LoadingOverlay :loading="loading && products.length > 0" />

    <!-- Header -->
    <div class="page-header mb-6">
      <h1 class="page-title">สินค้า</h1>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col gap-4">
        <div class="flex-1">
          <BaseInput
            label="ค้นหา"
            v-model="searchQuery"
            placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า..."
            @input="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-secondary-400" />
            </template>
          </BaseInput>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-48">
            <BaseAutocomplete
              label="ประเภทสินค้า"
              v-model="categoryFilter"
              :options="categoryOptions"
              placeholder="ทุกประเภท"
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="w-full sm:w-48">
            <BaseAutocomplete
              label="ประเภทการตั้งราคา"
              v-model="specialPricingFilter"
              :options="specialPricingOptions"
              placeholder="ราคาตามผู้ใช้ทั้งหมด"
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="w-full sm:w-48">
            <BaseAutocomplete
              label="สถานะ"
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="สถานะทั้งหมด"
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="products"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      empty-text="ไม่พบข้อมูลสินค้า"
    >
      <template #cell-category="{ row }">
        <div v-if="row.categories?.length" class="flex flex-wrap gap-1">
          <span
            v-for="c in row.categories"
            :key="c.category_id"
            class="badge badge-teal text-xs"
          >
            {{ c.category.name }}
          </span>
        </div>
        <span v-else class="text-sm text-secondary-400">-</span>
      </template>

      <template #cell-quantity="{ value }">
        <span
          :class="[
            'font-medium',
            (value as number) === 0
              ? 'text-red-600'
              : (value as number) < 10
                ? 'text-yellow-600'
                : 'text-green-600',
          ]"
        >
          {{ value }}
        </span>
      </template>

      <template #cell-default_price="{ value }">
        <span class="text-sm font-medium text-secondary-900">
          ฿{{ formatPrice(value as string) }}
        </span>
      </template>

      <template #cell-is_special_pricing_enabled="{ value }">
        <span
          v-if="value"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
        >
          เปิดใช้งาน
        </span>
        <span v-else class="text-sm text-secondary-400">-</span>
      </template>

      <template #cell-is_active="{ row }">
        <BaseToggle
          :model-value="row.is_active"
          active-color="primary"
          @change="handleToggleStatus(row)"
        />
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center">
          <button
            @click="handleEditProduct(row)"
            class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไข"
          >
            <Edit class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Edit Product Modal -->
    <BaseModal
      v-if="editModalOpen && selectedProduct"
      title="แก้ไขสินค้า"
      size="lg"
      @close="closeEditModal"
    >
      <div class="relative min-h-[200px]">
        <LoadingOverlay :loading="modalLoading" text="กำลังโหลดข้อมูล..." />

        <div class="grid grid-cols-2 gap-5 py-2">
          <!-- รูปภาพ -->
          <div class="">
            <ImageUploader
              class="w-[300px] h-[300px]"
              :model-value="imageFile"
              :current-image-url="currentImageUrl"
              :disabled="modalLoading"
              :max-size-mb="5"
              @update:model-value="
                (f) => {
                  imageFile = f;
                  removeImage = false;
                }
              "
              @remove="
                () => {
                  imageFile = null;
                  removeImage = true;
                }
              "
            />
          </div>

          <div class="flex flex-col gap-4">
            <BaseInput
              v-model="productForm.code"
              label="รหัสสินค้า"
              placeholder="รหัสสินค้า"
              :disabled="modalLoading"
            />

            <BaseInput
              v-model="productForm.name"
              label="ชื่อสินค้า"
              placeholder="ชื่อสินค้า"
              :disabled="modalLoading"
            />

            <BaseInput
              v-model="productForm.generic_name"
              label="ชื่อสามัญ"
              placeholder="ชื่อสามัญ"
              :disabled="modalLoading"
            />

            <BaseInput
              v-model="productForm.unit_name"
              label="หน่วยนับ"
              placeholder="เม็ด, ขวด, กล่อง"
              :disabled="modalLoading"
            />
          </div>

          <BaseMultiSelect
            v-model="productForm.category_ids"
            label="ประเภทสินค้า"
            placeholder="เลือกประเภทสินค้า"
            :options="categoryOptionsForForm"
            :disabled="modalLoading"
          />

          <!-- ราคา + จำนวน + ราคาพิเศษ -->
          <BaseInput
            v-model="productForm.default_price"
            label="ราคากลาง (บาท)"
            type="number"
            step="0.01"
            placeholder="0.00"
            :disabled="modalLoading"
          />
          <BaseInput
            v-model.number="productForm.quantity"
            label="จำนวนคงเหลือ"
            type="number"
            placeholder="0"
            :disabled="modalLoading"
          />
          <div
            class="flex items-center justify-between border border-secondary-200 rounded-[15px] px-3 mt-6 h-[42px]"
          >
            <span class="text-sm text-secondary-700">ราคาตามผู้ใช้</span>
            <BaseToggle
              v-model="productForm.is_special_pricing_enabled"
              active-color="primary"
              :disabled="modalLoading"
            />
          </div>

          <!-- วิธีใช้ + คำเตือน -->
          <BaseTextarea
            v-model="productForm.using"
            label="วิธีใช้"
            placeholder="กรอกวิธีใช้"
            :rows="3"
            :disabled="modalLoading"
          />
          <BaseTextarea
            v-model="productForm.warning"
            label="คำเตือน"
            placeholder="กรอกคำเตือน"
            :rows="3"
            :disabled="modalLoading"
          />

          <!-- Metadata -->

          <div>
            <p class="text-secondary-400 text-xs mb-0.5">PMC Product ID</p>
            <p class="text-secondary-900 font-medium">
              {{ selectedProduct.pmc_product_id ?? "-" }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สถานะ</p>
            <span
              :class="
                selectedProduct.is_active
                  ? 'badge badge-green'
                  : 'badge badge-red'
              "
              class="text-xs"
            >
              {{ selectedProduct.is_active ? "ใช้งาน" : "ไม่ใช้งาน" }}
            </span>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">สร้างเมื่อ</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedProduct.created_at, "DD MMM BBBB") }}
            </p>
          </div>
          <div>
            <p class="text-secondary-400 text-xs mb-0.5">อัปเดตล่าสุด</p>
            <p class="text-secondary-900 font-medium">
              {{ formatDate(selectedProduct.updated_at, "DD MMM BBBB") }}
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
          @click="updateProduct"
          :disabled="
            modalLoading || !productForm.code.trim() || !productForm.name.trim()
          "
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
