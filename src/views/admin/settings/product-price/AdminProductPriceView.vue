<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft, Plus, X, Save, ArrowLeftRight } from "lucide-vue-next";
import { BaseInput, BaseMultiSelect, BaseLoading } from "@/components/ui";
import type { User, Product, UpdateProductPricePayload } from "@/types";
import { useToast } from "@/composables";
import { formatUserName, formatNum } from "@/utils/format";
import { useProductPriceStore, useUsersStore, useProductStore } from "@/stores";
import { productsApi, productPricesApi } from "@/api";

const router = useRouter();
const toast = useToast();
const productPriceStore = useProductPriceStore();
const usersStore = useUsersStore();
const productStore = useProductStore();

const allUsers = computed(() => usersStore.users);
const products = ref<Product[]>([]);
const selectedProducts = ref<Product[]>([]);

const priceMatrix = ref<Record<number, Record<number, string>>>({});
const autoCalcMatrix = ref<Record<number, Record<number, boolean>>>({});

const specialMatrix = ref<Record<number, Record<number, boolean>>>({});
const isLoading = ref(false);
const isTransposed = ref(false);

const isCustomUserMode = ref(false);
const selectedUsers = ref<User[]>([]);
// markupPercent[productId][userId] = "10"
const markupPercent = ref<Record<number, Record<number, string>>>({});
const bulkMarkupValues = ref<Record<number, string>>({});

const users = computed(() =>
  isCustomUserMode.value ? selectedUsers.value : allUsers.value,
);

const selectedUserIds = computed({
  get: () => selectedUsers.value.map((u) => u.id),
  set: (newIds) => {
    const currentIds = selectedUsers.value.map((u) => u.id);
    const addedIds = newIds.filter((id) => !currentIds.includes(Number(id)));
    const removedIds = currentIds.filter((id) => !newIds.includes(id));

    // Remove
    selectedUsers.value = selectedUsers.value.filter(
      (u) => !removedIds.includes(u.id),
    );

    // Add
    addedIds.forEach((id) => {
      const user = allUsers.value.find((u) => u.id === Number(id));
      if (user) {
        selectedUsers.value.push(user);
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
      }
    });
  },
});

const userOptions = computed(() =>
  allUsers.value.map((u) => ({
    value: u.id,
    label: `${getUserFullName(u)} (${u.username})`,
  })),
);

function removeUserRow(userId: number) {
  if (!isCustomUserMode.value) {
    isCustomUserMode.value = true;
    selectedUsers.value = allUsers.value.filter((u) => u.id !== userId);
  } else {
    selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId);
  }
}

function onCustomUserModeChange() {
  selectedUsers.value = [];
}

const productOptions = computed(() =>
  products.value.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  })),
);

const allProductUnits = computed(() => {
  return selectedProducts.value.flatMap((product) => {
    const priceData = productPriceStore.productPrices.find(
      (pp) => pp.product_id === product.id,
    );
    const units = priceData?.units ?? [];
    return units.map((unit) => ({
      ...unit,
      productId: product.id,
      costPrice: priceData?.cost_price
        ? parseFloat(priceData.cost_price)
        : null,
    }));
  });
});

interface TransposedMarkupRow {
  type: "markup";
  productId: number;
  product: Product;
  costPrice: number | null;
  isFirstOfProduct: boolean;
  totalRows: number;
}

interface TransposedUnitRow {
  type: "unit";
  productId: number;
  product: Product;
  costPrice: number | null;
  isFirstUnit: boolean;
  unitRowspan: number;
  unit: {
    product_unit_id: number;
    unit_name: string;
    multiplier_to_base: number;
    default_price: number;
  };
}

type TransposedRow = TransposedMarkupRow | TransposedUnitRow;

const transposedRows = computed<TransposedRow[]>(() => {
  return selectedProducts.value.flatMap((product) => {
    const priceData = productPriceStore.productPrices.find(
      (pp) => pp.product_id === product.id,
    );
    const units = priceData?.units ?? [];
    const costPrice = priceData?.cost_price
      ? parseFloat(priceData.cost_price)
      : null;

    const rows: TransposedRow[] = [];
    const totalRows = (units.length > 0 ? 1 : 0) + units.length;

    // 1. % กำไร row first (isFirstOfProduct = true = carries the rowspan sticky cell)
    if (units.length > 0) {
      rows.push({
        type: "markup",
        productId: product.id,
        product,
        costPrice,
        isFirstOfProduct: true,
        totalRows,
      });
    }

    // 2. Unit rows — sticky product cell only spans unit rows
    units.forEach((unit, idx) => {
      rows.push({
        type: "unit",
        productId: product.id,
        product,
        costPrice,
        isFirstUnit: idx === 0,
        unitRowspan: units.length,
        unit: {
          product_unit_id: unit.product_unit_id,
          unit_name: unit.unit_name,
          multiplier_to_base: unit.multiplier_to_base,
          default_price: Number(unit.default_price),
        },
      });
    });

    return rows;
  });
});

const unitProductMap = computed(() => {
  const map: Record<number, number> = {};
  for (const productPrice of productPriceStore.productPrices) {
    for (const unit of productPrice.units) {
      map[unit.product_unit_id] = productPrice.product_id;
    }
  }
  return map;
});

const groupedColumns = computed(() => {
  return selectedProducts.value.map((product) => {
    const priceData = productPriceStore.productPrices.find(
      (pp) => pp.product_id === product.id,
    );
    return {
      product,
      units: priceData?.units ?? [],
      costPrice: priceData?.cost_price
        ? parseFloat(priceData.cost_price)
        : null,
    };
  });
});

async function fetchUsers() {
  await usersStore.getUsers({ is_delete: false, limit: 1000 });
}

async function fetchProducts() {
  await productStore.getProducts({
    is_active: true,
    limit: 100000,
    is_special_pricing_enabled: true,
  });
  products.value = productStore.products;
}

function removeProductColumn(productId: number) {
  const priceData = productPriceStore.productPrices.find(
    (pp) => pp.product_id === productId,
  );
  priceData?.units.forEach((unit) => {
    delete priceMatrix.value[unit.product_unit_id];
    delete specialMatrix.value[unit.product_unit_id];
  });
  delete markupPercent.value[productId];
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p.id !== productId,
  );
}

const selectedProductIds = computed({
  get: () => selectedProducts.value.map((p) => p.id),
  set: async (newIds) => {
    const currentIds = selectedProducts.value.map((p) => p.id);
    const addedIds = newIds.filter((id) => !currentIds.includes(Number(id)));
    const removedIds = currentIds.filter((id) => !newIds.includes(id));

    removedIds.forEach((id) => {
      removeProductColumn(id);
    });

    addedIds.forEach((id) => {
      const product = products.value.find((p) => p.id === Number(id));
      if (product) {
        selectedProducts.value.push(product);
      }
    });

    if (addedIds.length > 0) {
      await fetchPricesForProducts();
    }
  },
});

function updatePrice(
  userId: number,
  productUnitId: number,
  value: string | number | null,
) {
  if (!priceMatrix.value[productUnitId]) {
    priceMatrix.value[productUnitId] = {};
  }
  priceMatrix.value[productUnitId][userId] = value != null ? String(value) : "";

  if (!autoCalcMatrix.value[productUnitId]) {
    autoCalcMatrix.value[productUnitId] = {};
  }
  autoCalcMatrix.value[productUnitId][userId] = false;
}

function handlePriceBlur(userId: number, productUnitId: number) {
  const editedUnit = allProductUnits.value.find(
    (u) => u.product_unit_id === productUnitId,
  );
  if (!editedUnit || editedUnit.multiplier_to_base !== 1) return;

  const rawVal = priceMatrix.value[productUnitId]?.[userId];
  if (rawVal == null || rawVal === "") return;
  const numValue = Number(rawVal);

  const productId = unitProductMap.value[productUnitId];
  if (!productId) return;

  // Calculate and update markup percentage if cost is available
  const group = productPriceStore.productPrices.find(
    (g) => g.product_id === productId,
  );
  if (group) {
    const costPrice = group.cost_price ? parseFloat(group.cost_price) : null;
    if (costPrice !== null && costPrice > 0) {
      const pct = ((numValue - costPrice) / costPrice) * 100;
      if (!markupPercent.value[productId]) {
        markupPercent.value[productId] = {};
      }
      markupPercent.value[productId][userId] = pct.toFixed(2);
    }
  }

  const siblingUnits = allProductUnits.value.filter(
    (u) =>
      unitProductMap.value[u.product_unit_id] === productId &&
      u.product_unit_id !== productUnitId,
  );

  for (const sibling of siblingUnits) {
    const currentVal = priceMatrix.value[sibling.product_unit_id]?.[userId];
    const wasAutoCalc =
      autoCalcMatrix.value[sibling.product_unit_id]?.[userId] ?? false;
    if (currentVal && Number(currentVal) > 0 && !wasAutoCalc) continue;

    if (!priceMatrix.value[sibling.product_unit_id]) {
      priceMatrix.value[sibling.product_unit_id] = {};
    }
    if (!autoCalcMatrix.value[sibling.product_unit_id]) {
      autoCalcMatrix.value[sibling.product_unit_id] = {};
    }
    priceMatrix.value[sibling.product_unit_id][userId] = String(
      numValue * sibling.multiplier_to_base,
    );
    autoCalcMatrix.value[sibling.product_unit_id][userId] = true;
  }
}

function updateMarkup(
  productId: number,
  userId: number,
  value: string | number | null,
) {
  if (!markupPercent.value[productId]) markupPercent.value[productId] = {};
  markupPercent.value[productId][userId] = value != null ? String(value) : "";
}

function handleMarkupBlur(userId: number, productId: number) {
  const pct = parseFloat(markupPercent.value[productId]?.[userId]);
  if (isNaN(pct) || pct < 0) return;

  const group = productPriceStore.productPrices.find(
    (g) => g.product_id === productId,
  );
  if (!group) return;

  const costPrice = group.cost_price ? parseFloat(group.cost_price) : null;
  if (costPrice === null) return;

  const baseUnit = group.units.find((u) => u.multiplier_to_base === 1);
  if (!baseUnit) return;

  for (const unit of group.units) {
    if (unit.product_unit_id === baseUnit.product_unit_id) continue;
    if (!autoCalcMatrix.value[unit.product_unit_id])
      autoCalcMatrix.value[unit.product_unit_id] = {};
    autoCalcMatrix.value[unit.product_unit_id][userId] = true;
  }

  const basePrice = costPrice * (1 + pct / 100);
  if (!priceMatrix.value[baseUnit.product_unit_id])
    priceMatrix.value[baseUnit.product_unit_id] = {};
  if (!autoCalcMatrix.value[baseUnit.product_unit_id])
    autoCalcMatrix.value[baseUnit.product_unit_id] = {};
  priceMatrix.value[baseUnit.product_unit_id][userId] = basePrice.toFixed(2);
  autoCalcMatrix.value[baseUnit.product_unit_id][userId] = false;
  handlePriceBlur(userId, baseUnit.product_unit_id);
}

function updateLocalCostPrice(
  productId: number,
  value: string | number | null,
) {
  const pp = productPriceStore.productPrices.find(
    (p) => p.product_id === productId,
  );
  if (!pp) return;
  pp.cost_price = value === null || value === "" ? null : String(value);

  // Recalculate prices for all users based on this new cost price and their existing markupPercent
  const costPrice = value != null && value !== "" ? Number(value) : null;
  if (costPrice !== null && costPrice > 0) {
    const baseUnit = pp.units.find((u) => u.multiplier_to_base === 1);
    if (!baseUnit) return;

    users.value.forEach((user) => {
      const pctStr = markupPercent.value[productId]?.[user.id];
      if (pctStr !== undefined && pctStr !== "") {
        const pct = parseFloat(pctStr);
        if (!isNaN(pct)) {
          const basePrice = costPrice * (1 + pct / 100);
          if (!priceMatrix.value[baseUnit.product_unit_id]) {
            priceMatrix.value[baseUnit.product_unit_id] = {};
          }
          priceMatrix.value[baseUnit.product_unit_id][user.id] =
            basePrice.toFixed(2);
          handlePriceBlur(user.id, baseUnit.product_unit_id);
        }
      }
    });
  }
}

function applyBulkMarkup(productId: number, value: string | number | null) {
  const pct = value !== null && value !== "" ? parseFloat(String(value)) : null;
  if (pct === null || isNaN(pct) || pct < 0) return;

  const group = productPriceStore.productPrices.find(
    (g) => g.product_id === productId,
  );
  if (!group) return;

  const costPrice = group.cost_price ? parseFloat(group.cost_price) : null;
  if (costPrice === null) {
    toast.warning("กรุณากรอกราคาทุนก่อนตั้ง % กำไร");
    return;
  }

  const baseUnit = group.units.find((u) => u.multiplier_to_base === 1);
  if (!baseUnit) return;

  if (!markupPercent.value[productId]) {
    markupPercent.value[productId] = {};
  }

  users.value.forEach((user) => {
    markupPercent.value[productId][user.id] = String(pct);

    const basePrice = costPrice * (1 + pct / 100);
    if (!priceMatrix.value[baseUnit.product_unit_id]) {
      priceMatrix.value[baseUnit.product_unit_id] = {};
    }
    priceMatrix.value[baseUnit.product_unit_id][user.id] = basePrice.toFixed(2);

    for (const unit of group.units) {
      if (unit.product_unit_id === baseUnit.product_unit_id) continue;
      if (!autoCalcMatrix.value[unit.product_unit_id]) {
        autoCalcMatrix.value[unit.product_unit_id] = {};
      }
      autoCalcMatrix.value[unit.product_unit_id][user.id] = true;
    }

    handlePriceBlur(user.id, baseUnit.product_unit_id);
  });

  toast.success("ปรับ % กำไรให้ทุกลูกค้าเรียบร้อยแล้ว");
}

function getUserFullName(user: User): string {
  return formatUserName(user);
}

async function fetchPricesForProducts() {
  if (selectedProducts.value.length === 0) {
    return;
  }

  const productIds = selectedProducts.value.map((p) => p.id);
  await productPriceStore.fetchProductPrices(productIds);

  productPriceStore.productPrices.forEach((productPrice) => {
    if (!markupPercent.value[productPrice.product_id]) {
      markupPercent.value[productPrice.product_id] = {};
    }
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
        if (
          userPrice.markup_percent !== null &&
          userPrice.markup_percent !== undefined
        ) {
          markupPercent.value[productPrice.product_id][userPrice.user_id] =
            String(userPrice.markup_percent);
        }
      });
    });
  });
}

async function saveAllPrices() {
  if (selectedProducts.value.length === 0) {
    toast.warning("ไม่มีข้อมูลที่จะบันทึก");
    return;
  }

  const prices: UpdateProductPricePayload[] = [];

  users.value.forEach((user) => {
    allProductUnits.value.forEach((unit) => {
      const priceValue = priceMatrix.value[unit.product_unit_id]?.[user.id];
      // Skip entries that have no value or are zero — avoid overwriting with 0
      if (
        priceValue === undefined ||
        priceValue === "" ||
        Number(priceValue) <= 0
      )
        return;
      prices.push({
        product_unit_id: unit.product_unit_id,
        user_id: user.id,
        price: Number(priceValue),
      });
    });
  });

  try {
    const priceSuccess = await productPriceStore.updateProductPrices(prices);
    if (!priceSuccess) return; // store already showed error toast

    await Promise.all(
      selectedProducts.value.map(async (product) => {
        const pp = productPriceStore.productPrices.find(
          (x) => x.product_id === product.id,
        );
        if (!pp) return;
        const costPrice =
          pp.cost_price != null ? parseFloat(pp.cost_price) : null;
        await productsApi.updateProduct(product.id, { cost_price: costPrice });
      }),
    );

    const markupPayload: {
      user_id: number;
      product_id: number;
      markup_percent: number;
    }[] = [];
    for (const [productIdStr, userMap] of Object.entries(markupPercent.value)) {
      for (const [userIdStr, pctStr] of Object.entries(userMap)) {
        const pct = parseFloat(pctStr);
        if (!isNaN(pct)) {
          markupPayload.push({
            user_id: Number(userIdStr),
            product_id: Number(productIdStr),
            markup_percent: pct,
          });
        }
      }
    }
    if (markupPayload.length > 0) {
      await productPricesApi.upsertMarkups(markupPayload);
    }
  } catch (err: unknown) {
    const msg =
      (err as any)?.response?.data?.message ||
      "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
    toast.error(msg);
  }
}

// ---- Bulk markup apply (shared handler) ----
function handleApplyBulkMarkup(productId: number) {
  const val = bulkMarkupValues.value[productId];
  if (val) {
    applyBulkMarkup(productId, val);
    bulkMarkupValues.value[productId] = "";
  }
}

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([fetchUsers(), fetchProducts()]);
  isLoading.value = false;
});
</script>

<template>
  <div>
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

    <BaseLoading v-if="isLoading" />

    <div v-else class="card">
      <div class="mb-4 pb-4 border-b border-secondary-100 space-y-2">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <span class="text-sm font-medium text-secondary-700 sm:w-16 shrink-0"
            >สินค้า</span
          >
          <div class="flex items-center gap-2 flex-1">
            <BaseMultiSelect
              v-model="selectedProductIds"
              :options="productOptions"
              placeholder="ค้นหาและเลือกสินค้า..."
              :disabled="products.length === 0"
              hide-tags
              class="flex-1 sm:max-w-sm"
            />
          </div>
        </div>

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
              <BaseMultiSelect
                v-model="selectedUserIds"
                :options="userOptions"
                placeholder="ค้นหาและเลือกลูกค้า..."
                :disabled="allUsers.length === 0"
                hide-tags
                class="flex-1 sm:max-w-sm"
              />
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
          <table
            v-if="!isTransposed"
            class="w-full border-collapse"
            style="min-width: 500px"
          >
            <thead>
              <tr class="border-b border-secondary-200">
                <th
                  class="sticky-col left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 w-[160px] sm:min-w-[200px]"
                  rowspan="2"
                >
                  ผู้ใช้
                </th>
                <template
                  v-for="group in groupedColumns"
                  :key="group.product.id"
                >
                  <th
                    v-if="group.units.length === 0"
                    class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 min-w-[180px] border-r border-secondary-200 last:border-r-0"
                  >
                    <div
                      class="relative flex flex-col p-1 justify-between min-h-[95px]"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <div
                            class="font-bold text-secondary-900 truncate text-sm"
                          >
                            {{ group.product.name }}
                          </div>
                          <div
                            class="text-xs text-secondary-500 font-mono mt-0.5"
                          >
                            {{ group.product.code }}
                          </div>
                        </div>
                        <button
                          @click="removeProductColumn(group.product.id)"
                          class="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลบสินค้า"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                      <div
                        class="mt-2 pt-2 border-t border-secondary-100 flex flex-col gap-2 w-full"
                      >
                        <div class="flex flex-col gap-1 w-[180px]">
                          <label class="label !text-xs !mb-1">ราคาทุน</label>
                          <BaseInput
                            :model-value="
                              group.costPrice != null
                                ? String(group.costPrice.toFixed(2))
                                : ''
                            "
                            @update:model-value="
                              updateLocalCostPrice(group.product.id, $event)
                            "
                            type="number"
                            size="sm"
                            placeholder="0.00"
                            suffix="บาท"
                            class="w-full text-xs"
                          />
                        </div>
                        <div class="text-xs text-amber-600 font-medium">
                          สินค้านี้ยังไม่มีหน่วยขาย
                        </div>
                      </div>
                    </div>
                  </th>

                  <th
                    v-else
                    :colspan="group.units.length + 1"
                    class="px-4 py-3 text-left text-sm font-semibold text-secondary-900 border-r border-r-secondary-200 last:border-r-0 border-b border-b-secondary-100 min-w-[240px]"
                  >
                    <div
                      class="relative flex flex-col p-1 justify-between min-h-[95px]"
                    >
                      <!-- Top Row: Name, Code & Remove Button -->
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <div
                            class="font-bold text-secondary-900 truncate text-sm"
                          >
                            {{ group.product.name }}
                          </div>
                          <div
                            class="text-xs text-secondary-500 font-mono mt-0.5"
                          >
                            {{ group.product.code }}
                          </div>
                        </div>
                        <button
                          @click="removeProductColumn(group.product.id)"
                          class="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลบสินค้า"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>

                      <!-- Bottom Row: Cost Input & Bulk Markup (aligned vertically, same width) -->
                      <div
                        class="mt-2 pt-2 border-t border-secondary-100 flex flex-col gap-2"
                      >
                        <!-- Cost Price -->
                        <div class="flex flex-col gap-1 w-[180px]">
                          <label class="label !text-xs !mb-1">ราคาทุน</label>
                          <BaseInput
                            :model-value="
                              group.costPrice != null
                                ? String(group.costPrice.toFixed(2))
                                : ''
                            "
                            @update:model-value="
                              updateLocalCostPrice(group.product.id, $event)
                            "
                            type="number"
                            size="sm"
                            placeholder="0.00"
                            suffix="บาท"
                            class="w-full text-xs"
                          />
                        </div>

                        <!-- Bulk Markup -->
                        <div class="flex flex-col gap-1 w-[180px]">
                          <label class="label !text-xs !mb-1"
                            >ตั้ง % กำไรทุกผู้ใช้</label
                          >
                          <div class="flex items-center gap-1.5 w-full">
                            <BaseInput
                              :model-value="
                                bulkMarkupValues[group.product.id] ?? ''
                              "
                              @update:model-value="
                                (val) =>
                                  (bulkMarkupValues[group.product.id] =
                                    val != null ? String(val) : '')
                              "
                              type="number"
                              size="sm"
                              placeholder="0.00"
                              suffix="%"
                              class="flex-1 min-w-0 text-xs"
                              @keydown.enter="
                                handleApplyBulkMarkup(group.product.id)
                              "
                            />
                            <button
                              type="button"
                              class="btn btn-primary btn-sm shrink-0"
                              @click="handleApplyBulkMarkup(group.product.id)"
                            >
                              ใช้
                            </button>
                          </div>
                        </div>
                      </div>
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
                  <template
                    v-for="(unit, uIdx) in group.units"
                    :key="unit.product_unit_id"
                  >
                    <!-- % กำไร column header placed before base unit (index 0) -->
                    <th
                      v-if="uIdx === 0"
                      class="px-4 py-2 text-center text-xs font-semibold text-amber-700 bg-amber-50 w-[120px] min-w-[120px] max-w-[120px] border-r border-amber-200"
                    >
                      % กำไร
                    </th>

                    <!-- Unit Column Header -->
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-secondary-700 min-w-[140px] sm:min-w-[160px] border-r border-secondary-200"
                    >
                      <div class="font-medium">{{ unit.unit_name }}</div>
                      <div
                        class="text-secondary-500 flex flex-col gap-0.5 mt-0.5"
                      >
                        <span
                          >ราคากลาง
                          {{ formatNum(unit.default_price, 2) }} บาท</span
                        >
                        <span
                          v-if="group.costPrice !== null"
                          class="text-emerald-600 text-[10px]"
                        >
                          ทุน:
                          {{
                            formatNum(
                              group.costPrice * unit.multiplier_to_base,
                              2,
                            )
                          }}
                          บาท
                        </span>
                      </div>
                    </th>
                  </template>
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
                  class="sticky-col left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-secondary-900 hover:bg-secondary-50"
                >
                  <div class="flex items-start justify-between gap-1">
                    <div class="min-w-0">
                      <div
                        class="font-medium truncate max-w-[140px] sm:max-w-none"
                      >
                        {{ getUserFullName(user) }}
                      </div>
                      <div
                        class="text-xs text-secondary-500 mt-0.5 truncate max-w-[140px] sm:max-w-[180px]"
                      >
                        {{ user.username }}
                      </div>
                    </div>
                    <button
                      @click="removeUserRow(user.id)"
                      class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="ลบลูกค้า"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <template
                  v-for="group in groupedColumns"
                  :key="group.product.id"
                >
                  <!-- Empty cell if product has no units -->
                  <td
                    v-if="group.units.length === 0"
                    class="px-4 py-3 border-r border-secondary-200 text-center text-xs text-secondary-400 bg-secondary-50/50"
                  >
                    -
                  </td>

                  <template v-else>
                    <template
                      v-for="(unit, uIdx) in group.units"
                      :key="unit.product_unit_id"
                    >
                      <td
                        v-if="uIdx === 0"
                        class="px-4 py-3 border-r border-amber-200 bg-amber-50 text-center w-[120px] min-w-[120px] max-w-[120px]"
                      >
                        <BaseInput
                          :model-value="
                            markupPercent[group.product.id]?.[user.id] ?? ''
                          "
                          @update:model-value="
                            (val) =>
                              updateMarkup(group.product.id, user.id, val)
                          "
                          @blur="handleMarkupBlur(user.id, group.product.id)"
                          type="number"
                          size="sm"
                          placeholder="0.00"
                          suffix="%"
                          class="w-full text-xs [&_input]:text-right"
                        />
                      </td>

                      <!-- Render Unit cell -->
                      <td class="px-4 py-3 border-r border-secondary-200">
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
                              (value: string | number | null) =>
                                updatePrice(
                                  user.id,
                                  unit.product_unit_id,
                                  value,
                                )
                            "
                            @blur="
                              handlePriceBlur(user.id, unit.product_unit_id)
                            "
                            type="number"
                            size="sm"
                            :placeholder="String(unit.default_price)"
                            class="w-full min-w-[120px]"
                          />
                        </div>
                      </td>
                    </template>
                  </template>
                </template>
              </tr>
            </tbody>
          </table>

          <!-- Transposed: product_units = rows, users = columns -->
          <table v-else class="w-full border-collapse" style="min-width: 500px">
            <thead>
              <tr class="border-b-2 border-secondary-200">
                <th
                  class="sticky-col left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 w-[400px] min-w-[400px] max-w-[400px]"
                  colspan="2"
                >
                  สินค้า / หน่วย
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
                    </div>
                    <button
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
                v-for="row in transposedRows"
                :key="
                  row.type === 'markup'
                    ? `markup-${row.productId}`
                    : `unit-${row.unit.product_unit_id}`
                "
                class="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                <!-- markup row: sticky product name cell + % กำไร label + inputs -->
                <template v-if="row.type === 'markup'">
                  <td
                    class="sticky-col left-0 z-10 bg-white hover:bg-secondary-50 align-middle"
                    style="width: 240px; min-width: 240px; max-width: 240px"
                  >
                    <div
                      class="flex items-start justify-between gap-1 px-3 py-2"
                    >
                      <div class="flex-1 min-w-0">
                        <div
                          class="font-bold text-secondary-900 text-sm truncate leading-tight"
                        >
                          {{ row.product.name }}
                        </div>
                        <div class="text-xs text-secondary-500 font-mono">
                          {{ row.product.code }}
                        </div>
                      </div>
                      <button
                        @click="removeProductColumn(row.productId)"
                        class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="ลบสินค้า"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td
                    class="sticky-col left-[240px] z-10 px-4 py-2 align-middle text-sm font-semibold text-amber-700 bg-amber-50 text-center w-[160px] min-w-[160px] max-w-[160px] border-r border-amber-200"
                  >
                    % กำไร
                  </td>
                  <td
                    v-for="user in users"
                    :key="user.id"
                    class="px-4 py-2 align-middle border-r border-amber-200 last:border-r-0 bg-amber-50 text-center"
                  >
                    <BaseInput
                      :model-value="
                        markupPercent[row.productId]?.[user.id] ?? ''
                      "
                      @update:model-value="
                        (val) => updateMarkup(row.productId, user.id, val)
                      "
                      @blur="handleMarkupBlur(user.id, row.productId)"
                      type="number"
                      size="sm"
                      placeholder="0.00"
                      suffix="%"
                      class="w-full text-xs [&_input]:text-right"
                    />
                  </td>
                </template>

                <!-- unit rows: sticky product cell (rowspan = unit count, first unit only) + unit label cell + value cells -->
                <template v-else>
                  <!-- Sticky cost + markup cell: only on first unit row -->
                  <td
                    v-if="row.isFirstUnit"
                    :rowspan="row.unitRowspan"
                    class="sticky-col left-0 z-10 bg-white hover:bg-secondary-50 align-top"
                    style="width: 240px; min-width: 240px; max-width: 240px"
                  >
                    <div class="px-3 py-2 flex flex-col gap-1.5">
                      <div>
                        <label class="label !text-xs !mb-0.5 whitespace-nowrap"
                          >ราคาทุน</label
                        >
                        <BaseInput
                          :model-value="
                            row.costPrice != null
                              ? String(row.costPrice.toFixed(2))
                              : ''
                          "
                          @update:model-value="
                            updateLocalCostPrice(row.productId, $event)
                          "
                          type="number"
                          size="sm"
                          placeholder="0.00"
                          suffix="บาท"
                          class="w-full text-xs"
                        />
                      </div>
                      <div>
                        <label class="label !text-xs !mb-0.5 whitespace-nowrap"
                          >ตั้ง % กำไร</label
                        >
                        <div class="flex gap-0.5">
                          <BaseInput
                            :model-value="bulkMarkupValues[row.productId] ?? ''"
                            @update:model-value="
                              (val) =>
                                (bulkMarkupValues[row.productId] =
                                  val != null ? String(val) : '')
                            "
                            type="number"
                            size="sm"
                            placeholder="0.00"
                            suffix="%"
                            class="flex-1 min-w-0 text-xs"
                            @keydown.enter="
                              handleApplyBulkMarkup(row.productId)
                            "
                          />
                          <button
                            type="button"
                            class="btn btn-primary btn-sm shrink-0 h-[32px] flex items-center justify-center"
                            @click="handleApplyBulkMarkup(row.productId)"
                          >
                            ใช้
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Unit label cell -->
                  <td
                    class="sticky-col left-[240px] z-10 px-4 py-3 align-middle text-sm font-medium text-secondary-700 bg-white w-[160px] min-w-[160px] max-w-[160px]"
                  >
                    <div class="font-semibold text-secondary-900">
                      {{ row.unit.unit_name }}
                    </div>
                    <div class="text-xs text-secondary-400 mt-0.5">
                      ราคากลาง {{ formatNum(row.unit.default_price, 2) }} บาท
                    </div>
                    <div
                      v-if="row.costPrice !== null"
                      class="text-[10px] text-emerald-600 mt-0.5"
                    >
                      ทุน:
                      {{
                        formatNum(
                          row.costPrice * row.unit.multiplier_to_base,
                          2,
                        )
                      }}
                      บาท
                    </div>
                  </td>

                  <!-- Value cells -->
                  <td
                    v-for="user in users"
                    :key="user.id"
                    class="px-4 py-3 align-middle border-r border-secondary-200 last:border-r-0"
                  >
                    <div
                      :class="
                        specialMatrix[row.unit.product_unit_id]?.[user.id]
                          ? 'rounded ring-1 ring-blue-300 bg-blue-50'
                          : ''
                      "
                    >
                      <BaseInput
                        :model-value="
                          priceMatrix[row.unit.product_unit_id]?.[user.id] ?? ''
                        "
                        @update:model-value="
                          (value: string | number | null) =>
                            updatePrice(
                              user.id,
                              row.unit.product_unit_id,
                              value,
                            )
                        "
                        @blur="
                          handlePriceBlur(user.id, row.unit.product_unit_id)
                        "
                        type="number"
                        size="sm"
                        :placeholder="String(row.unit.default_price)"
                        class="w-full min-w-[120px]"
                      />
                    </div>
                  </td>
                </template>
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
              formatNum(selectedProducts.length)
            }}</span>
            สินค้า (
            <span class="font-semibold text-secondary-900">{{
              formatNum(allProductUnits.length)
            }}</span>
            หน่วย) และ
            <span class="font-semibold text-secondary-900">{{
              formatNum(users.length)
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
.sticky {
  position: sticky;
}

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

table {
  border-spacing: 0;
}

th,
td {
  white-space: nowrap;
}

tr:hover .sticky {
  background-color: rgb(248 250 252);
}

/* Sticky column right-border via box-shadow — stays visible when scrolling */
.sticky-col {
  position: sticky;
  box-shadow: 1px 0 0 0 #e2e8f0;
}

tr:hover .sticky-col {
  background-color: rgb(248 250 252);
}
</style>
