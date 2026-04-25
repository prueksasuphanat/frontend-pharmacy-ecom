<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft, Plus, X, Save } from "lucide-vue-next";
import { BaseSelect, BaseInput, BaseAutocomplete } from "@/components/ui";
import { usersApi } from "@/api/admin/settings/users";
import { productsApi } from "@/api";
import type { User } from "@/api/admin/settings/users";
import type { Product, UpdateProductPricePayload } from "@/types";
import { useToast } from "@/composables";
import { useProductPriceStore } from "@/stores";

const router = useRouter();
const toast = useToast();
const productPriceStore = useProductPriceStore();

// State
const users = ref<User[]>([]);
const products = ref<Product[]>([]);
const selectedProducts = ref<Product[]>([]);
const priceMatrix = ref<Record<string, Record<number, string>>>({});
const isLoading = ref(false);

// Product selection
const availableProducts = computed(() => {
  const selectedIds = selectedProducts.value.map((p) => p.id);
  return products.value.filter((p) => !selectedIds.includes(p.id));
});

const productOptions = computed(() =>
  availableProducts.value.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  })),
);

const selectedProductId = ref<number | null>(null);

// Fetch data
async function fetchUsers() {
  try {
    const response = await usersApi.getAll({
      is_active: true,
      is_delete: false,
    });
    users.value = response.data.data;
    initializePriceMatrix();
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
  }
}

async function fetchProducts() {
  try {
    const response = await productsApi.getProducts({
      is_active: true,
      limit: 1000,
    });
    products.value = response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
  }
}

function initializePriceMatrix() {
  users.value.forEach((user) => {
    const userKey = String(user.id);
    if (!priceMatrix.value[userKey]) {
      priceMatrix.value[userKey] = {};
    }
  });
}

async function addProductColumn() {
  if (!selectedProductId.value) {
    toast.warning("กรุณาเลือกสินค้า");
    return;
  }

  const product = products.value.find(
    (p) => p.id === Number(selectedProductId.value),
  );
  if (!product) return;

  selectedProducts.value.push(product);
  await fetchPricesForProducts();
  selectedProductId.value = null;
}

function removeProductColumn(productId: number) {
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p.id !== productId,
  );

  // Remove prices for this product from local matrix
  users.value.forEach((user) => {
    const userKey = String(user.id);
    if (priceMatrix.value[userKey]) {
      delete priceMatrix.value[userKey][productId];
    }
  });
}

function updatePrice(
  userId: number | string,
  productId: number,
  value: string | number,
) {
  const userKey = String(userId);
  if (!priceMatrix.value[userKey]) {
    priceMatrix.value[userKey] = {};
  }
  priceMatrix.value[userKey][productId] = String(value);
}

function getUserFullName(user: User): string {
  const title = user.title || "";
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  return `${title}${firstName} ${lastName}`.trim() || user.username;
}

async function fetchPricesForProducts() {
  if (selectedProducts.value.length === 0) {
    return;
  }

  const productIds = selectedProducts.value.map((p) => p.id);
  const success = await productPriceStore.fetchProductPrices(productIds);

  if (success) {
    // Update local price matrix from store
    const storePriceMatrix = productPriceStore.priceMatrix;
    users.value.forEach((user) => {
      const userKey = String(user.id);
      if (!priceMatrix.value[userKey]) {
        priceMatrix.value[userKey] = {};
      }

      selectedProducts.value.forEach((product) => {
        const storePrice = storePriceMatrix[userKey]?.[product.id];
        if (storePrice !== undefined) {
          priceMatrix.value[userKey][product.id] = String(storePrice);
        } else {
          // Use default price if no custom price is set
          priceMatrix.value[userKey][product.id] = product.default_price || "0";
        }
      });
    });
  }
}

async function saveAllPrices() {
  if (selectedProducts.value.length === 0) {
    toast.warning("ไม่มีข้อมูลที่จะบันทึก");
    return;
  }

  // Build prices array
  const prices: UpdateProductPricePayload[] = [];

  users.value.forEach((user) => {
    const userKey = String(user.id);
    selectedProducts.value.forEach((product) => {
      const priceValue = priceMatrix.value[userKey]?.[product.id];
      if (priceValue !== undefined) {
        prices.push({
          product_id: product.id,
          user_id: Number(user.id),
          price: Number(priceValue) || 0,
        });
      }
    });
  });

  await productPriceStore.updateProductPrices(prices);
}

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([fetchUsers(), fetchProducts()]);
  isLoading.value = false;
});
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

    <div class="mb-6">
      <h1 class="page-title">ราคาสินค้า</h1>
      <p class="text-sm text-secondary-500 mt-1">
        กำหนดราคาสินค้าตาม Role และส่วนลด
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="card">
      <div class="flex items-center justify-center py-12">
        <div
          class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="ml-3 text-secondary-600">กำลังโหลดข้อมูล...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="card">
      <!-- Add Product Column Section -->
      <div class="mb-6 pb-6 border-b border-secondary-100">
        <h3 class="text-sm font-semibold text-secondary-900 mb-3">
          เพิ่มสินค้า
        </h3>
        <div class="flex gap-3">
          <div class="flex-1 max-w-md">
            <BaseAutocomplete
              v-model="selectedProductId"
              :options="productOptions"
              placeholder="ค้นหาและเลือกสินค้า..."
              clearable
              :disabled="availableProducts.length === 0"
            />
          </div>
          <button
            @click="addProductColumn"
            :disabled="!selectedProductId || availableProducts.length === 0"
            class="btn btn-primary flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>เพิ่มสินค้า</span>
          </button>
        </div>
        <p
          v-if="availableProducts.length === 0"
          class="text-xs text-secondary-500 mt-2"
        >
          ไม่มีสินค้าที่สามารถเพิ่มได้แล้ว
        </p>
      </div>

      <!-- Price Matrix Table -->
      <div v-if="selectedProducts.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-secondary-900">
            ตารางราคาสินค้า
          </h3>
          <button
            @click="saveAllPrices"
            :disabled="productPriceStore.isSaving"
            class="btn btn-primary flex items-center gap-2"
          >
            <Save class="w-4 h-4" />
            <span>{{
              productPriceStore.isSaving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"
            }}</span>
          </button>
        </div>

        <div class="overflow-x-auto -mx-6 px-6">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b-2 border-secondary-200">
                <th
                  class="sticky left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 min-w-[200px] border-r border-secondary-200"
                >
                  ผู้ใช้
                </th>
                <th
                  v-for="product in selectedProducts"
                  :key="product.id"
                  class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 min-w-[250px] border-r border-secondary-200 last:border-r-0"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-secondary-900 truncate">
                        {{ product.name }}
                      </div>
                      <div class="text-xs text-secondary-500 mt-0.5">
                        รหัส: {{ product.code }}
                      </div>
                      <div class="text-xs text-secondary-500">
                        ราคาเริ่มต้น: ฿{{ product.default_price }}
                      </div>
                    </div>
                    <button
                      @click="removeProductColumn(product.id)"
                      class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="ลบสินค้า"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                <td
                  class="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-secondary-900 border-r border-secondary-200 hover:bg-secondary-50"
                >
                  <div>
                    <div class="font-medium">{{ getUserFullName(user) }}</div>
                    <div class="text-xs text-secondary-500 mt-0.5">
                      {{ user.username }}
                    </div>
                    <div class="text-xs text-secondary-500">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        :class="{
                          'bg-purple-100 text-purple-800':
                            user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800':
                            user.role === 'PHARMACIST',
                          'bg-green-100 text-green-800':
                            user.role === 'CUSTOMER',
                          'bg-orange-100 text-orange-800': user.role === 'DEMO',
                        }"
                      >
                        {{ user.role }}
                      </span>
                    </div>
                  </div>
                </td>
                <td
                  v-for="product in selectedProducts"
                  :key="product.id"
                  class="px-4 py-3 border-r border-secondary-200 last:border-r-0"
                >
                  <BaseInput
                    :model-value="
                      priceMatrix[String(user.id)]?.[product.id] || ''
                    "
                    @update:model-value="
                      (value: string | number) =>
                        updatePrice(user.id, product.id, value)
                    "
                    type="number"
                    placeholder="0.00"
                    class="w-full"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="mt-4 p-4 bg-secondary-50 rounded-lg">
          <div class="text-sm text-secondary-600">
            <span class="font-medium">สรุป:</span>
            กำลังตั้งราคาสำหรับ
            <span class="font-semibold text-secondary-900">{{
              selectedProducts.length
            }}</span>
            สินค้า และ
            <span class="font-semibold text-secondary-900">{{
              users.length
            }}</span>
            ผู้ใช้
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 text-secondary-400 border-2 border-dashed border-secondary-200 rounded-lg"
      >
        <Plus class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm font-medium">ยังไม่มีสินค้าในตาราง</p>
        <p class="text-xs mt-1">เริ่มต้นด้วยการเพิ่มสินค้าด้านบน</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure sticky column works properly */
.sticky {
  position: sticky;
}

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Table styling */
table {
  border-spacing: 0;
}

th,
td {
  white-space: nowrap;
}

/* Ensure hover effect works with sticky column */
tr:hover .sticky {
  background-color: rgb(248 250 252);
}
</style>
