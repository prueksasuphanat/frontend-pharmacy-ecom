<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft, Plus, X, Save, ArrowLeftRight } from "lucide-vue-next";
import { BaseInput, BaseAutocomplete } from "@/components/ui";
import type { User, Product, UpdateProductPricePayload } from "@/types";
import { useToast } from "@/composables";
import { useProductPriceStore, useUsersStore, useProductStore } from "@/stores";

const router = useRouter();
const toast = useToast();
const productPriceStore = useProductPriceStore();
const usersStore = useUsersStore();
const productStore = useProductStore();

// State
const allUsers = computed(() => usersStore.users);
const products = ref<Product[]>([]);
const selectedProducts = ref<Product[]>([]);
// Task 1.1: key is product_unit_id → user_id → price string
const priceMatrix = ref<Record<number, Record<number, string>>>({});
// Task 1.2: track is_special per cell (product_unit_id → user_id → boolean)
const specialMatrix = ref<Record<number, Record<number, boolean>>>({});
const isLoading = ref(false);
const isTransposed = ref(false);

// Custom user selection
const isCustomUserMode = ref(false);
const selectedUsers = ref<User[]>([]);
const selectedUserId = ref<number | null>(null);

const users = computed(() =>
  isCustomUserMode.value ? selectedUsers.value : allUsers.value,
);

const availableUsers = computed(() => {
  const selectedIds = selectedUsers.value.map((u) => u.id);
  return allUsers.value.filter((u) => !selectedIds.includes(u.id));
});

const userOptions = computed(() =>
  availableUsers.value.map((u) => ({
    value: u.id,
    label: `${getUserFullName(u)} (${u.username})`,
  })),
);

function addUserRow() {
  if (!selectedUserId.value) return;
  const user = allUsers.value.find(
    (u) => u.id === Number(selectedUserId.value),
  );
  if (!user) return;

  selectedUsers.value.push(user);

  // Task 1.9: initialize priceMatrix with product_unit_id keys
  allProductUnits.value.forEach((unit) => {
    if (!priceMatrix.value[unit.product_unit_id]) {
      priceMatrix.value[unit.product_unit_id] = {};
    }
    if (priceMatrix.value[unit.product_unit_id][user.id] === undefined) {
      priceMatrix.value[unit.product_unit_id][user.id] = String(
        unit.default_price,
      );
    }
  });

  selectedUserId.value = null;
}

function removeUserRow(userId: number) {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId);
}

function onCustomUserModeChange() {
  selectedUsers.value = [];
  selectedUserId.value = null;
  initializePriceMatrix();
}

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

// Task 1.3: flatten units from all selectedProducts
const allProductUnits = computed(() => {
  return selectedProducts.value.flatMap((product) => {
    const priceData = productPriceStore.productPrices.find(
      (pp) => pp.product_id === product.id,
    );
    return priceData?.units ?? [];
  });
});

// Task 1.4: grouped columns: product → units[] for rendering grouped headers
const groupedColumns = computed(() => {
  return selectedProducts.value.map((product) => {
    const priceData = productPriceStore.productPrices.find(
      (pp) => pp.product_id === product.id,
    );
    return {
      product,
      units: priceData?.units ?? [],
    };
  });
});

// Fetch data
async function fetchUsers() {
  await usersStore.getUsers({ is_delete: false, limit: 1000 });
  initializePriceMatrix();
}

async function fetchProducts() {
  await productStore.getProducts({
    is_active: true,
    limit: 100000,
    is_special_pricing_enabled: true,
  });
  products.value = productStore.products;
}

function initializePriceMatrix() {
  // priceMatrix is now keyed by product_unit_id → user_id
  // No pre-initialization needed; populated by fetchPricesForProducts
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

// Task 1.7: delete all product_unit_id keys for that product from priceMatrix and specialMatrix
function removeProductColumn(productId: number) {
  const priceData = productPriceStore.productPrices.find(
    (pp) => pp.product_id === productId,
  );
  priceData?.units.forEach((unit) => {
    delete priceMatrix.value[unit.product_unit_id];
    delete specialMatrix.value[unit.product_unit_id];
  });
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p.id !== productId,
  );
}

// Task 1.6: use productUnitId as key instead of productId
function updatePrice(
  userId: number,
  productUnitId: number,
  value: string | number,
) {
  if (!priceMatrix.value[productUnitId]) {
    priceMatrix.value[productUnitId] = {};
  }
  priceMatrix.value[productUnitId][userId] = String(value);
}

function getUserFullName(user: User): string {
  const title = user.title || "";
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  return `${title}${firstName} ${lastName}`.trim() || user.username;
}

// Task 1.5: read from storePriceMatrix[product_unit_id][user_id] and populate both priceMatrix and specialMatrix
async function fetchPricesForProducts() {
  if (selectedProducts.value.length === 0) {
    return;
  }

  const productIds = selectedProducts.value.map((p) => p.id);
  await productPriceStore.fetchProductPrices(productIds);

  productPriceStore.productPrices.forEach((productPrice) => {
    productPrice.units.forEach((unitPrice) => {
      if (!priceMatrix.value[unitPrice.product_unit_id]) {
        priceMatrix.value[unitPrice.product_unit_id] = {};
      }
      if (!specialMatrix.value[unitPrice.product_unit_id]) {
        specialMatrix.value[unitPrice.product_unit_id] = {};
      }
      unitPrice.users.forEach((userPrice) => {
        priceMatrix.value[unitPrice.product_unit_id][userPrice.user_id] =
          String(userPrice.price);
        specialMatrix.value[unitPrice.product_unit_id][userPrice.user_id] =
          userPrice.is_special;
      });
    });
  });
}

// Task 1.8: generate payload { product_unit_id, user_id, price } instead of { product_id, user_id, price }
async function saveAllPrices() {
  if (selectedProducts.value.length === 0) {
    toast.warning("ไม่มีข้อมูลที่จะบันทึก");
    return;
  }

  const prices: UpdateProductPricePayload[] = [];

  users.value.forEach((user) => {
    allProductUnits.value.forEach((unit) => {
      const priceValue = priceMatrix.value[unit.product_unit_id]?.[user.id];
      if (priceValue !== undefined) {
        prices.push({
          product_unit_id: unit.product_unit_id,
          user_id: user.id,
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
      <!-- Filters Row -->
      <div class="mb-4 pb-4 border-b border-secondary-100 space-y-2">
        <!-- Product -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <span class="text-sm font-medium text-secondary-700 sm:w-16 shrink-0"
            >สินค้า</span
          >
          <div class="flex items-center gap-2 flex-1">
            <BaseAutocomplete
              v-model="selectedProductId"
              :options="productOptions"
              placeholder="ค้นหาและเลือกสินค้า..."
              clearable
              :disabled="availableProducts.length === 0"
              class="flex-1 sm:max-w-sm"
            />
            <button
              @click="addProductColumn"
              :disabled="!selectedProductId || availableProducts.length === 0"
              class="btn btn-primary flex items-center gap-1.5 shrink-0 px-3 py-2 text-sm"
            >
              <Plus class="w-3.5 h-3.5" />
              <span class="hidden xs:inline">เพิ่ม</span>
            </button>
          </div>
        </div>

        <!-- User -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <div class="sm:w-16 shrink-0 flex items-center gap-1.5">
            <input
              id="custom-user-mode"
              v-model="isCustomUserMode"
              type="checkbox"
              class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              @change="onCustomUserModeChange"
            />
            <label
              for="custom-user-mode"
              class="text-sm font-medium text-secondary-700 cursor-pointer select-none"
            >
              ลูกค้า
            </label>
          </div>
          <div class="flex items-center gap-2 flex-1">
            <template v-if="isCustomUserMode">
              <BaseAutocomplete
                v-model="selectedUserId"
                :options="userOptions"
                placeholder="ค้นหาและเลือกลูกค้า..."
                clearable
                :disabled="availableUsers.length === 0"
                class="flex-1 sm:max-w-sm"
              />
              <button
                @click="addUserRow"
                :disabled="!selectedUserId || availableUsers.length === 0"
                class="btn btn-primary flex items-center gap-1.5 shrink-0 px-3 py-2 text-sm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span class="hidden xs:inline">เพิ่ม</span>
              </button>
            </template>
            <span v-else class="text-sm text-secondary-400"
              >แสดงลูกค้าทั้งหมด</span
            >
          </div>
        </div>
      </div>

      <div v-if="selectedProducts.length > 0" class="space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-secondary-900">
            ตารางราคาสินค้า
          </h3>
          <div class="flex items-center gap-2">
            <button
              @click="isTransposed = !isTransposed"
              class="btn btn-secondary flex items-center justify-center gap-2"
              title="สลับแถว/คอลัมน์"
            >
              <ArrowLeftRight class="w-4 h-4" />
              <span class="hidden sm:inline">{{
                isTransposed ? "ผู้ใช้ × สินค้า" : "สินค้า × ผู้ใช้"
              }}</span>
            </button>
            <button
              @click="saveAllPrices"
              :disabled="productPriceStore.isSaving"
              class="btn btn-primary flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" />
              <span class="hidden sm:inline">{{
                productPriceStore.isSaving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"
              }}</span>
              <span class="sm:hidden">{{
                productPriceStore.isSaving ? "..." : "บันทึก"
              }}</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto -mx-6 px-6">
          <!-- Normal: users = rows, product_units = columns -->
          <table
            v-if="!isTransposed"
            class="w-full border-collapse"
            style="min-width: 500px"
          >
            <thead>
              <!-- Row 1: Product group headers -->
              <tr class="border-b border-secondary-200">
                <th
                  class="sticky left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 w-[160px] sm:min-w-[200px] border-r border-secondary-200"
                  rowspan="2"
                >
                  ผู้ใช้
                </th>
                <template
                  v-for="group in groupedColumns"
                  :key="group.product.id"
                >
                  <!-- Empty state: product has no units -->
                  <th
                    v-if="group.units.length === 0"
                    class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 min-w-[180px] border-r border-secondary-200 last:border-r-0"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-secondary-900 truncate">
                          {{ group.product.name }}
                        </div>
                        <div class="text-xs text-secondary-500 mt-0.5">
                          {{ group.product.code }}
                        </div>
                        <div class="text-xs text-amber-600 mt-0.5">
                          สินค้านี้ยังไม่มีหน่วยขาย
                        </div>
                      </div>
                      <button
                        @click="removeProductColumn(group.product.id)"
                        class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบสินค้า"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                  <!-- Normal: product has units -->
                  <th
                    v-else
                    :colspan="group.units.length"
                    class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 border-r border-secondary-200 last:border-r-0 border-b border-secondary-100"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-secondary-900 truncate">
                          {{ group.product.name }}
                        </div>
                        <div class="text-xs text-secondary-500 mt-0.5">
                          {{ group.product.code }}
                        </div>
                      </div>
                      <button
                        @click="removeProductColumn(group.product.id)"
                        class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบสินค้า"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                </template>
              </tr>
              <!-- Row 2: Unit name + default_price sub-headers -->
              <tr class="border-b-2 border-secondary-200">
                <template
                  v-for="group in groupedColumns"
                  :key="group.product.id"
                >
                  <th
                    v-for="unit in group.units"
                    :key="unit.product_unit_id"
                    class="px-4 py-2 text-left text-xs font-medium text-secondary-700 min-w-[140px] sm:min-w-[160px] border-r border-secondary-200 last:border-r-0"
                  >
                    <div class="font-medium">{{ unit.unit_name }}</div>
                    <div class="text-secondary-500">
                      ฿{{ unit.default_price }}
                    </div>
                  </th>
                </template>
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
                  <div class="flex items-start justify-between gap-1">
                    <div class="min-w-0">
                      <div
                        class="font-medium truncate max-w-[140px] sm:max-w-none"
                      >
                        {{ getUserFullName(user) }}
                      </div>
                      <div
                        class="text-xs text-secondary-500 mt-0.5 truncate max-w-[140px] sm:max-w-none"
                      >
                        {{ user.username }}
                      </div>
                      <span
                        class="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium"
                        :class="{
                          'bg-purple-100 text-purple-800':
                            user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800':
                            user.role === 'PHARMACIST',
                          'bg-green-100 text-green-800':
                            user.role === 'CUSTOMER',
                          'bg-orange-100 text-orange-800': user.role === 'DEMO',
                        }"
                        >{{ user.role }}</span
                      >
                    </div>
                    <button
                      v-if="isCustomUserMode"
                      @click="removeUserRow(user.id)"
                      class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="ลบลูกค้า"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td
                  v-for="unit in allProductUnits"
                  :key="unit.product_unit_id"
                  class="px-4 py-3 border-r border-secondary-200 last:border-r-0"
                >
                  <div
                    :class="
                      specialMatrix[unit.product_unit_id]?.[user.id]
                        ? 'rounded ring-1 ring-blue-300 bg-blue-50'
                        : ''
                    "
                  >
                    <BaseInput
                      :model-value="
                        priceMatrix[unit.product_unit_id]?.[user.id] ?? ''
                      "
                      @update:model-value="
                        (value: string | number) =>
                          updatePrice(user.id, unit.product_unit_id, value)
                      "
                      type="number"
                      :placeholder="String(unit.default_price)"
                      class="w-full min-w-[120px]"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Transposed: product_units = rows, users = columns -->
          <table v-else class="w-full border-collapse" style="min-width: 500px">
            <thead>
              <tr class="border-b-2 border-secondary-200">
                <th
                  class="sticky left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 w-[160px] sm:min-w-[200px] border-r border-secondary-200"
                >
                  สินค้า
                </th>
                <th
                  v-for="user in users"
                  :key="user.id"
                  class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 min-w-[160px] sm:min-w-[180px] border-r border-secondary-200 last:border-r-0"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="font-semibold truncate">
                        {{ getUserFullName(user) }}
                      </div>
                      <div class="text-xs text-secondary-500 mt-0.5">
                        {{ user.username }}
                      </div>
                      <span
                        class="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium"
                        :class="{
                          'bg-purple-100 text-purple-800':
                            user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800':
                            user.role === 'PHARMACIST',
                          'bg-green-100 text-green-800':
                            user.role === 'CUSTOMER',
                          'bg-orange-100 text-orange-800': user.role === 'DEMO',
                        }"
                        >{{ user.role }}</span
                      >
                    </div>
                    <button
                      v-if="isCustomUserMode"
                      @click="removeUserRow(user.id)"
                      class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="ลบลูกค้า"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="unit in allProductUnits"
                :key="unit.product_unit_id"
                class="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                <td
                  class="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-secondary-900 border-r border-secondary-200 hover:bg-secondary-50"
                >
                  <div class="min-w-0">
                    <div
                      class="font-medium truncate max-w-[140px] sm:max-w-none"
                    >
                      {{
                        groupedColumns.find((g) =>
                          g.units.some(
                            (u) => u.product_unit_id === unit.product_unit_id,
                          ),
                        )?.product.name
                      }}
                    </div>
                    <div class="text-xs text-secondary-500 mt-0.5">
                      {{ unit.unit_name }}
                    </div>
                    <div class="text-xs text-secondary-400">
                      ฿{{ unit.default_price }}
                    </div>
                  </div>
                </td>
                <td
                  v-for="user in users"
                  :key="user.id"
                  class="px-4 py-3 border-r border-secondary-200 last:border-r-0"
                >
                  <div
                    :class="
                      specialMatrix[unit.product_unit_id]?.[user.id]
                        ? 'rounded ring-1 ring-blue-300 bg-blue-50'
                        : ''
                    "
                  >
                    <BaseInput
                      :model-value="
                        priceMatrix[unit.product_unit_id]?.[user.id] ?? ''
                      "
                      @update:model-value="
                        (value: string | number) =>
                          updatePrice(user.id, unit.product_unit_id, value)
                      "
                      type="number"
                      :placeholder="String(unit.default_price)"
                      class="w-full min-w-[120px]"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="mt-4 p-4 bg-secondary-50 rounded-lg">
          <div class="text-sm text-secondary-600">
            <span class="font-medium">สรุป:</span>
            ตั้งราคาสำหรับ
            <span class="font-semibold text-secondary-900">{{
              selectedProducts.length
            }}</span>
            สินค้า (
            <span class="font-semibold text-secondary-900">{{
              allProductUnits.length
            }}</span>
            หน่วย) และ
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
