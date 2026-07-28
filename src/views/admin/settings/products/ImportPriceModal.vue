<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  FileSpreadsheet,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckSquare,
  Square,
  Check,
  TrendingUp,
} from "lucide-vue-next";
import { useToast } from "@/composables";
import { formatPrice, formatNum } from "@/utils/format";
import { productsApi, productPricesApi, usersApi } from "@/api";
import { useProductPriceStore } from "@/stores";
import { BaseLoading } from "@/components/ui";
import type { Product, User } from "@/types";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    autoSave?: boolean;
  }>(),
  {
    autoSave: true,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "imported"): void;
  (e: "applyToMatrix", items: ParsedItem[]): void;
}>();

const toast = useToast();
const productPriceStore = useProductPriceStore();

export interface CalculatedUnit {
  product_unit_id: number;
  unit_name: string;
  multiplier_to_base: number;
  price: number;
}

export interface ParsedItem {
  id: string;
  product_code: string;
  product_name: string;
  user_code: string;
  user_name: string;
  excel_price: number;

  matchedProduct?: Product;
  matchedUser?: User;
  baseUnitName?: string;
  costPrice: number | null;
  markupPercent: number | null;

  hasExistingPrice: boolean;
  existingPriceValue?: number | null;

  isMatched: boolean;
  matchErrorReason?: string;
  isBelowCost: boolean;

  isIncluded: boolean;
  calculatedUnits: CalculatedUnit[];
  expanded?: boolean;
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isProcessing = ref(false);
const processingMessage = ref("กำลังอ่านไฟล์ Excel...");
const processingProgress = ref(0);
const processingCountText = ref("");

const isSaving = ref(false);
const isLoadingMasterData = ref(false);

const allProducts = ref<Product[]>([]);
const allUsers = ref<User[]>([]);

const parsedItems = ref<ParsedItem[]>([]);
const activeTab = ref<"all" | "importable" | "has_existing_price" | "below_cost" | "errors">("importable");
const searchQuery = ref("");

// Helper: Case-insensitive & flexible header key lookup
function getRowValue(row: any, candidateKeys: string[]): any {
  if (!row || typeof row !== "object") return "";

  const normMap = new Map<string, any>();
  for (const [key, val] of Object.entries(row)) {
    if (val !== undefined && val !== null) {
      const cleanKey = key.toString().toLowerCase().trim().replace(/[\s_]+/g, "");
      normMap.set(cleanKey, val);
    }
  }

  for (const cand of candidateKeys) {
    const cleanCand = cand.toLowerCase().trim().replace(/[\s_]+/g, "");
    if (normMap.has(cleanCand)) {
      return normMap.get(cleanCand);
    }
  }

  return "";
}

// Helper: Flexible number parsing (handles numbers, strings like "13.00", strings with commas like "1,234.50" or currency)
function parseFlexibleNumber(val: any): number {
  if (val === null || val === undefined || val === "") return NaN;
  if (typeof val === "number") return val;

  const strVal = String(val).trim();
  if (!strVal) return NaN;

  // Clean commas, currency signs e.g. "1,234.50" -> "1234.50", "฿13.00" -> "13.00"
  const cleanedStr = strVal.replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  const parsed = parseFloat(cleanedStr);
  return isNaN(parsed) ? NaN : parsed;
}

const summaryStats = computed(() => {
  const total = parsedItems.value.length;
  const matched = parsedItems.value.filter((i) => i.isMatched).length;
  const belowCost = parsedItems.value.filter((i) => i.isBelowCost).length;
  const errors = parsedItems.value.filter((i) => !i.isMatched).length;
  const included = parsedItems.value.filter((i) => i.isIncluded && i.isMatched && !i.isBelowCost).length;
  const hasExistingPrice = parsedItems.value.filter((i) => i.isMatched && !i.isBelowCost && i.hasExistingPrice).length;

  return {
    total,
    matched,
    belowCost,
    errors,
    included,
    hasExistingPrice,
  };
});

const filteredItems = computed(() => {
  let result = parsedItems.value;

  if (activeTab.value === "importable") {
    result = result.filter((i) => i.isMatched && !i.isBelowCost);
  } else if (activeTab.value === "has_existing_price") {
    result = result.filter((i) => i.isMatched && !i.isBelowCost && i.hasExistingPrice);
  } else if (activeTab.value === "below_cost") {
    result = result.filter((i) => i.isBelowCost);
  } else if (activeTab.value === "errors") {
    result = result.filter((i) => !i.isMatched);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    result = result.filter(
      (i) =>
        i.product_code.toLowerCase().includes(q) ||
        i.product_name.toLowerCase().includes(q) ||
        i.user_code.toLowerCase().includes(q) ||
        i.user_name.toLowerCase().includes(q),
    );
  }

  return result;
});

const isAllFilteredSelected = computed(() => {
  if (filteredItems.value.length === 0) return false;
  return filteredItems.value.every((i) => !i.isMatched || i.isBelowCost || i.isIncluded);
});

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      resetModalState();
      await loadMasterData();
    }
  },
);

function resetModalState() {
  selectedFile.value = null;
  parsedItems.value = [];
  isProcessing.value = false;
  processingMessage.value = "กำลังอ่านไฟล์ Excel...";
  processingProgress.value = 0;
  processingCountText.value = "";
  isSaving.value = false;
  activeTab.value = "importable";
  searchQuery.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
}

async function loadMasterData() {
  if (allProducts.value.length > 0 && allUsers.value.length > 0) return;
  isLoadingMasterData.value = true;
  try {
    const [prodRes, userRes] = await Promise.all([
      productsApi.getProducts({ limit: 10000 }),
      usersApi.getAll({ limit: 10000 }),
    ]);

    if (prodRes && prodRes.data) {
      allProducts.value = prodRes.data;
    }
    if (userRes && userRes.data && userRes.data.success) {
      allUsers.value = userRes.data.data;
    }
  } catch (err) {
    toast.error("ไม่สามารถโหลดข้อมูล Master Data สินค้าและผู้ใช้ได้");
  } finally {
    isLoadingMasterData.value = false;
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFile(target.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0]);
  }
}

async function processFile(file: File) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    toast.error("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
    return;
  }

  selectedFile.value = file;
  isProcessing.value = true;
  processingMessage.value = "กำลังเตรียมอ่านไฟล์ Excel...";
  processingProgress.value = 5;
  processingCountText.value = "";

  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    const data = await file.arrayBuffer();
    processingProgress.value = 15;
    processingMessage.value = "กำลังถอดรหัสข้อมูลตาราง...";
    await new Promise((resolve) => setTimeout(resolve, 50));

    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      toast.error("ไฟล์ Excel ไม่มีข้อมูล");
      isProcessing.value = false;
      return;
    }

    const totalRows = rawRows.length;
    processingMessage.value = `กำลังประมวลผลและค้นหาข้อมูล (${formatNum(totalRows)} รายการ)...`;
    processingProgress.value = 25;
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Pre-build O(1) lookup maps for instant product and user matching
    const productByCodeMap = new Map<string, Product>();
    const productByNameMap = new Map<string, Product>();
    allProducts.value.forEach((p) => {
      if (p.code) productByCodeMap.set(p.code.toLowerCase().trim(), p);
      if (p.name) productByNameMap.set(p.name.toLowerCase().trim(), p);
    });

    const userByCodeMap = new Map<string, User>();
    const userByNameMap = new Map<string, User>();
    allUsers.value.forEach((u) => {
      if (u.code) userByCodeMap.set(u.code.toLowerCase().trim(), u);
      if (u.pmc_customer_id) userByCodeMap.set(u.pmc_customer_id.toLowerCase().trim(), u);
      if (u.username) userByCodeMap.set(u.username.toLowerCase().trim(), u);

      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim().toLowerCase();
      if (fullName) userByNameMap.set(fullName, u);
      if (u.pmc_name) userByNameMap.set(u.pmc_name.toLowerCase().trim(), u);
    });

    // Build existing prices Map: `${productId}_${userId}` -> price
    const existingPricesMap = new Map<string, number>();
    productPriceStore.productPrices.forEach((pp) => {
      pp.units.forEach((u) => {
        u.users.forEach((usr) => {
          if (usr.price != null && Number(usr.price) > 0) {
            existingPricesMap.set(`${pp.product_id}_${usr.user_id}`, Number(usr.price));
          }
        });
      });
    });

    const items: ParsedItem[] = [];
    const chunkSize = 400;

    for (let index = 0; index < totalRows; index += chunkSize) {
      const chunkEnd = Math.min(index + chunkSize, totalRows);

      for (let i = index; i < chunkEnd; i++) {
        const row = rawRows[i];

        // Flexible case-insensitive header extraction
        const productCodeRaw = getRowValue(row, ["product_code", "productcode", "code", "รหัสสินค้า", "รหัส"]);
        const productNameRaw = getRowValue(row, ["product_name", "productname", "name", "ชื่อสินค้า", "ชื่อ"]);
        const userCodeRaw = getRowValue(row, ["user_code", "usercode", "customer_code", "customercode", "รหัสผู้ใช้", "รหัสลูกค้า", "รหัสผู้ซื้อ"]);
        const userNameRaw = getRowValue(row, ["user_name", "username", "customer_name", "customername", "ชื่อผู้ใช้", "ชื่อลูกค้า", "ชื่อผู้ซื้อ"]);
        const priceRaw = getRowValue(row, ["price", "excel_price", "ราคา", "ราคาเสนอขาย", "ราคาขาย"]);

        const productCode = String(productCodeRaw || "").trim();
        const productName = String(productNameRaw || "").trim();
        const userCode = String(userCodeRaw || "").trim();
        const userName = String(userNameRaw || "").trim();

        // Flexible type parsing for price (handles numbers, strings "13.00", strings with commas "1,234.50")
        const priceVal = parseFlexibleNumber(priceRaw);

        if (!productCode && !productName && !userCode) continue;

        // 1. Match Product (O(1) Map lookup)
        let product = productCode ? productByCodeMap.get(productCode.toLowerCase()) : undefined;
        if (!product && productName) {
          product = productByNameMap.get(productName.toLowerCase());
        }

        // 2. Match User (O(1) Map lookup with fallback)
        let user = userCode ? userByCodeMap.get(userCode.toLowerCase()) : undefined;
        if (!user && userName) {
          user = userByNameMap.get(userName.toLowerCase());
          if (!user) {
            user = allUsers.value.find(
              (u) =>
                (u.pmc_name && u.pmc_name.toLowerCase().includes(userName.toLowerCase())) ||
                (`${u.first_name || ""} ${u.last_name || ""}`.trim().toLowerCase().includes(userName.toLowerCase())),
            );
          }
        }

        const costPrice = product && product.cost_price != null ? Number(product.cost_price) : null;
        const hasCostPrice = costPrice !== null && !isNaN(costPrice) && costPrice > 0;

        const errors: string[] = [];
        if (!product) errors.push(`ไม่พบรหัสสินค้า "${productCode || productName}"`);
        if (!user) errors.push(`ไม่พบรหัสลูกค้า/ผู้ใช้ "${userCode || userName}"`);
        if (isNaN(priceVal) || priceVal <= 0) errors.push("ระบุราคาไม่ถูกต้อง");
        if (product && !hasCostPrice) errors.push("สินค้านี้ยังไม่มีราคาทุนในระบบ");

        const isMatched = errors.length === 0 && !!product && !!user && hasCostPrice;
        const isBelowCost = hasCostPrice && priceVal < costPrice!;

        // Calculate Markup Percent
        let markupPercent: number | null = null;
        if (hasCostPrice && priceVal > 0) {
          markupPercent = Number((((priceVal - costPrice!) / costPrice!) * 100).toFixed(2));
        }

        // Check Existing Price
        let hasExistingPrice = false;
        let existingPriceValue: number | null = null;
        if (product && user) {
          const exPrice = existingPricesMap.get(`${product.id}_${user.id}`);
          if (exPrice != null && exPrice > 0) {
            hasExistingPrice = true;
            existingPriceValue = exPrice;
          }
        }

        // Base Unit finding
        let baseUnitName = "-";
        const calculatedUnits: CalculatedUnit[] = [];

        if (product && product.units) {
          const basePu =
            product.units.find((pu) => pu.unit_id === product.base_unit_id) ||
            product.units.find((pu) => pu.multiplier_to_base === 1) ||
            product.units[0];

          if (basePu) {
            baseUnitName = basePu.unit?.name || "หน่วยย่อย";
          }

          // Calculate for each unit
          product.units.forEach((pu) => {
            const multiplier = pu.multiplier_to_base || 1;
            calculatedUnits.push({
              product_unit_id: pu.id,
              unit_name: pu.unit?.name || "หน่วย",
              multiplier_to_base: multiplier,
              price: Number((priceVal * multiplier).toFixed(2)),
            });
          });
        }

        // Rule: If isBelowCost or !isMatched -> isIncluded MUST BE FALSE (cannot import)
        const isIncluded = isMatched && !isBelowCost;

        items.push({
          id: `row-${i}-${Date.now()}`,
          product_code: productCode,
          product_name: productName || (product ? product.name : "-"),
          user_code: userCode,
          user_name: userName || (user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "" : "-"),
          excel_price: isNaN(priceVal) ? 0 : priceVal,
          matchedProduct: product,
          matchedUser: user,
          baseUnitName,
          costPrice,
          markupPercent,
          hasExistingPrice,
          existingPriceValue,
          isMatched,
          matchErrorReason: errors.join(", "),
          isBelowCost,
          isIncluded,
          calculatedUnits,
          expanded: false,
        });
      }

      // Update progress bar & count
      const pct = 25 + Math.round((chunkEnd / totalRows) * 75);
      processingProgress.value = Math.min(pct, 99);
      processingCountText.value = `${formatNum(chunkEnd)} / ${formatNum(totalRows)} รายการ`;

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    parsedItems.value = items;

    if (items.some((i) => i.isMatched && !i.isBelowCost)) {
      activeTab.value = "importable";
    } else if (items.some((i) => i.isBelowCost)) {
      activeTab.value = "below_cost";
    } else {
      activeTab.value = "errors";
    }
  } catch (err: any) {
    toast.error(`ไม่สามารถอ่านไฟล์ Excel ได้: ${err?.message || "ไฟล์ไม่ถูกต้อง"}`);
  } finally {
    isProcessing.value = false;
  }
}

function excludeItemFromImport(item: ParsedItem) {
  item.isIncluded = false;
}

function includeItemInImport(item: ParsedItem) {
  if (item.isMatched && !item.isBelowCost) {
    item.isIncluded = true;
  }
}

function toggleIncludeAllCurrentFiltered(include: boolean) {
  filteredItems.value.forEach((item) => {
    if (item.isMatched && !item.isBelowCost) {
      item.isIncluded = include;
    }
  });
}

async function handleConfirmImport() {
  // ONLY import items that are matched AND NOT below cost AND marked as included
  const itemsToImport = parsedItems.value.filter((i) => i.isMatched && !i.isBelowCost && i.isIncluded);
  if (itemsToImport.length === 0) {
    toast.error("ไม่มีรายการที่สามารถนำเข้าได้");
    return;
  }

  isSaving.value = true;

  if (!props.autoSave) {
    toast.success(
      `ใส่ข้อมูลลงในตารางเรียบร้อยแล้ว ${formatNum(itemsToImport.length)} รายการ (ยังไม่ได้บันทึกลงฐานข้อมูล)`,
    );
    emit("applyToMatrix", itemsToImport);
    emit("close");
    isSaving.value = false;
    return;
  }

  try {
    const pricesPayload: { product_unit_id: number; user_id: number; price: number }[] = [];

    for (const item of itemsToImport) {
      const userId = item.matchedUser!.id;
      for (const cu of item.calculatedUnits) {
        pricesPayload.push({
          product_unit_id: cu.product_unit_id,
          user_id: userId,
          price: cu.price,
        });
      }
    }

    const res = await productPricesApi.updateProductPrices({ prices: pricesPayload });

    if (res && res.data && res.data.success) {
      toast.success(
        `นำเข้าการตั้งราคาสำเร็จ ${formatNum(itemsToImport.length)} รายการ (${formatNum(pricesPayload.length)} หน่วยขาย)`,
      );
      emit("imported");
      emit("close");
    } else {
      toast.error(res?.data?.message || "เกิดข้อผิดพลาดในการบันทึกราคา");
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลราคาได้");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-200 relative"
      >
        <!-- Full Loading Overlay during Processing -->
        <div
          v-if="isProcessing || isLoadingMasterData"
          class="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-200"
        >
          <div class="relative flex items-center justify-center">
            <div class="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <FileSpreadsheet class="w-7 h-7 text-teal-600 absolute" />
          </div>

          <div class="max-w-md w-full">
            <h3 class="text-base font-bold text-secondary-900">
              {{ processingMessage || "กำลังประมวลผลไฟล์..." }}
            </h3>
            <p v-if="processingCountText" class="text-xs font-semibold text-teal-700 mt-1 font-mono">
              {{ processingCountText }}
            </p>

            <!-- Progress Bar -->
            <div v-if="isProcessing && processingProgress > 0" class="w-full bg-secondary-100 h-2.5 rounded-full mt-4 overflow-hidden">
              <div
                class="bg-teal-600 h-full rounded-full transition-all duration-200 ease-out"
                :style="{ width: `${processingProgress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"
            >
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-secondary-900">
                นำเข้าการตั้งราคาจากไฟล์ Excel
              </h2>
              <p class="text-xs text-secondary-500">
                อัปโหลดไฟล์ Excel เพื่ออัปเดตราคาสินค้าตามรายผู้ใช้
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content Body -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-h-0">
          <!-- Step 1: Upload Box when no file parsed -->
          <div v-if="parsedItems.length === 0" class="flex flex-col gap-4">
            <div
              @dragover.prevent
              @drop="handleDrop"
              @click="triggerFileSelect"
              class="border-2 border-dashed border-secondary-200 hover:border-teal-500 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-secondary-50/30 hover:bg-teal-50/20 cursor-pointer transition-all text-center group"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".xlsx, .xls"
                class="hidden"
                @change="handleFileChange"
              />

              <div
                class="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform flex items-center justify-center"
              >
                <Upload class="w-8 h-8" />
              </div>

              <div>
                <p class="font-semibold text-secondary-800 text-base">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p class="text-xs text-secondary-400 mt-1">
                  รองรับไฟล์รูปแบบ .xlsx และ .xls
                </p>
              </div>
            </div>

            <!-- Template Download link -->
            <div
              class="flex items-center justify-between p-4 bg-teal-50/60 border border-teal-100 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <FileSpreadsheet class="w-5 h-5 text-teal-600 shrink-0" />
                <div class="text-xs text-teal-900">
                  <span class="font-bold">ไฟล์ตัวอย่างการตั้งราคา:</span>
                  ต้องมีคอลัมน์ product_code, product_name, user_code, user_name, price
                </div>
              </div>
              <a
                href="/download/ราคาเสนอขาย_รวม.xlsx"
                download
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-teal-700 hover:bg-teal-100/80 border border-teal-200 rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Download class="w-3.5 h-3.5" />
                ดาวน์โหลดตัวอย่างไฟล์
              </a>
            </div>
          </div>

          <!-- Step 2: Parsed Preview State -->
          <div v-else class="flex flex-col gap-4 flex-1 min-h-0">
            <!-- Summary Stats Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div class="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
                <p class="text-[11px] font-medium text-secondary-500">แถบข้อมูลทั้งหมด</p>
                <p class="text-lg font-bold text-secondary-900 mt-0.5">
                  {{ formatNum(summaryStats.total) }} <span class="text-[10px] font-normal text-secondary-500">รายการ</span>
                </p>
              </div>

              <div class="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p class="text-[11px] font-medium text-green-700">พร้อมนำเข้า</p>
                <p class="text-lg font-bold text-green-900 mt-0.5">
                  {{ formatNum(summaryStats.included) }} <span class="text-[10px] font-normal text-green-700">รายการ</span>
                </p>
              </div>

              <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p class="text-[11px] font-medium text-blue-700">มีราคาอยู่แล้ว</p>
                <p class="text-lg font-bold text-blue-900 mt-0.5">
                  {{ formatNum(summaryStats.hasExistingPrice) }} <span class="text-[10px] font-normal text-blue-700">รายการ</span>
                </p>
              </div>

              <div
                class="p-3 rounded-xl border transition-colors"
                :class="
                  summaryStats.belowCost > 0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-secondary-50 border-secondary-200'
                "
              >
                <div class="flex items-center justify-between">
                  <p
                    class="text-[11px] font-medium"
                    :class="summaryStats.belowCost > 0 ? 'text-amber-800' : 'text-secondary-500'"
                  >
                    ต่ำกว่าราคาทุน
                  </p>
                  <AlertTriangle
                    v-if="summaryStats.belowCost > 0"
                    class="w-3.5 h-3.5 text-amber-600 shrink-0"
                  />
                </div>
                <p
                  class="text-lg font-bold mt-0.5"
                  :class="summaryStats.belowCost > 0 ? 'text-amber-900' : 'text-secondary-900'"
                >
                  {{ formatNum(summaryStats.belowCost) }} <span class="text-[10px] font-normal">รายการ</span>
                </p>
              </div>

              <div
                class="p-3 rounded-xl border transition-colors"
                :class="
                  summaryStats.errors > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-secondary-50 border-secondary-200'
                "
              >
                <p
                  class="text-[11px] font-medium"
                  :class="summaryStats.errors > 0 ? 'text-red-700' : 'text-secondary-500'"
                >
                  ไม่พบข้อมูล / ข้อผิดพลาด
                </p>
                <p
                  class="text-lg font-bold mt-0.5"
                  :class="summaryStats.errors > 0 ? 'text-red-900' : 'text-secondary-900'"
                >
                  {{ formatNum(summaryStats.errors) }} <span class="text-[10px] font-normal">รายการ</span>
                </p>
              </div>
            </div>

            <!-- Toolbar & 5 Filter Tabs -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-1.5 bg-secondary-100 p-1 rounded-xl">
                <button
                  type="button"
                  @click="activeTab = 'all'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeTab === 'all'
                      ? 'bg-white text-secondary-900 shadow-xs'
                      : 'text-secondary-600 hover:text-secondary-900',
                  ]"
                >
                  ทั้งหมด ({{ formatNum(summaryStats.total) }})
                </button>
                <button
                  type="button"
                  @click="activeTab = 'importable'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
                    activeTab === 'importable'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-teal-700 hover:bg-teal-100/60',
                  ]"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  สามารถนำเข้าได้ ({{ formatNum(summaryStats.included) }})
                </button>
                <button
                  type="button"
                  @click="activeTab = 'has_existing_price'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                    activeTab === 'has_existing_price'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-700 hover:bg-blue-100/50',
                  ]"
                >
                  <RefreshCw class="w-3.5 h-3.5" />
                  มีราคาอยู่แล้ว ({{ formatNum(summaryStats.hasExistingPrice) }})
                </button>
                <button
                  type="button"
                  @click="activeTab = 'below_cost'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                    activeTab === 'below_cost'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-700 hover:bg-amber-100/50',
                  ]"
                >
                  <AlertTriangle class="w-3.5 h-3.5" />
                  ต่ำกว่าทุน ({{ formatNum(summaryStats.belowCost) }})
                </button>
                <button
                  type="button"
                  @click="activeTab = 'errors'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeTab === 'errors'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-red-700 hover:bg-red-100/50',
                  ]"
                >
                  ข้อผิดพลาด ({{ formatNum(summaryStats.errors) }})
                </button>
              </div>

              <!-- Search input inside modal -->
              <div class="relative min-w-[220px]">
                <Search class="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ค้นหารหัส/ชื่อสินค้า หรือ รหัสลูกค้า..."
                  class="w-full pl-9 pr-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <!-- Informational Banners -->
            <div
              v-if="activeTab === 'has_existing_price'"
              class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2"
            >
              <RefreshCw class="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>ข้อมูล:</strong> รายการในหมวดนี้มีราคาเสนอขายในระบบอยู่แล้ว การยืนยันนำเข้าจะทำการอัปเดตเป็นราคาใหม่ที่ระบุจากไฟล์ Excel
              </span>
            </div>
            <div
              v-else-if="activeTab === 'below_cost'"
              class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2"
            >
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>คำเตือน:</strong> รายการในหมวดนี้เป็นราคาที่ต่ำกว่าราคาทุน ไม่สามารถนำเข้าข้อมูลได้ (แสดงผลลัพธ์เพื่อการตรวจสอบเท่านั้น)
              </span>
            </div>
            <div
              v-else-if="activeTab === 'errors'"
              class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2"
            >
              <XCircle class="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>คำเตือน:</strong> รายการในหมวดนี้มีข้อผิดพลาด หรือยังไม่ได้ระบุราคาทุนในระบบ ไม่สามารถนำเข้าข้อมูลได้
              </span>
            </div>

            <!-- Table Controls Bar (Only in Importable/HasExisting/All tab) -->
            <div
              v-if="activeTab === 'importable' || activeTab === 'has_existing_price' || activeTab === 'all'"
              class="flex items-center justify-between px-1 text-xs text-secondary-600"
            >
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="toggleIncludeAllCurrentFiltered(true)"
                  class="hover:text-teal-700 font-medium underline transition-colors"
                >
                  เลือกทั้งหมดในแท็บนี้
                </button>
                <span>|</span>
                <button
                  type="button"
                  @click="toggleIncludeAllCurrentFiltered(false)"
                  class="hover:text-amber-700 font-medium underline transition-colors"
                >
                  ยกเลิกการเลือกทั้งหมดในแท็บนี้
                </button>
              </div>
              <span class="text-secondary-400">
                แสดง {{ formatNum(filteredItems.length) }} รายการ
              </span>
            </div>

            <!-- Table of Preview Items -->
            <div class="border border-secondary-200 rounded-xl overflow-hidden min-h-[260px] max-h-[360px] flex flex-col bg-white">
              <div class="overflow-x-auto overflow-y-auto flex-1">
                <table class="w-full text-xs text-left border-collapse">
                  <thead class="bg-secondary-50 text-secondary-600 font-semibold sticky top-0 z-10 border-b border-secondary-200">
                    <tr>
                      <th class="py-2.5 px-3 w-10 text-center">
                        <input
                          v-if="activeTab === 'importable' || activeTab === 'has_existing_price' || activeTab === 'all'"
                          type="checkbox"
                          class="rounded text-teal-600 focus:ring-teal-500"
                          :checked="isAllFilteredSelected"
                          @change="(e) => toggleIncludeAllCurrentFiltered((e.target as HTMLInputElement).checked)"
                        />
                        <span v-else class="text-secondary-300">—</span>
                      </th>
                      <th class="py-2.5 px-3 min-w-[160px]">สินค้า (Product)</th>
                      <th class="py-2.5 px-3 min-w-[150px]">ลูกค้า (User)</th>
                      <th class="py-2.5 px-3 text-right w-24">ราคาทุน</th>
                      <th class="py-2.5 px-3 text-right w-28">ราคาเสนอขาย</th>
                      <th class="py-2.5 px-3 text-right w-24">% กำไร</th>
                      <th class="py-2.5 px-3 text-center w-28">สถานะ</th>
                      <th class="py-2.5 px-3 text-center w-24">รายละเอียด</th>
                      <th class="py-2.5 px-3 text-center w-16">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-secondary-100">
                    <template v-for="item in filteredItems" :key="item.id">
                      <tr
                        :class="[
                          'hover:bg-secondary-50/80 transition-colors',
                          !item.isMatched ? 'bg-red-50/30' : item.isBelowCost ? 'bg-amber-50/40' : item.hasExistingPrice ? 'bg-blue-50/20' : '',
                        ]"
                      >
                        <!-- Checkbox (ONLY shown for valid importable items) -->
                        <td class="py-2.5 px-3 text-center">
                          <input
                            v-if="item.isMatched && !item.isBelowCost"
                            type="checkbox"
                            v-model="item.isIncluded"
                            class="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span v-else class="text-secondary-300 font-mono">—</span>
                        </td>

                        <!-- Product -->
                        <td class="py-2.5 px-3">
                          <div class="font-medium text-secondary-900">
                            {{ item.product_name }}
                          </div>
                          <div class="text-[11px] text-secondary-400 font-mono">
                            {{ item.product_code || "-" }}
                          </div>
                        </td>

                        <!-- User -->
                        <td class="py-2.5 px-3">
                          <div class="font-medium text-secondary-800">
                            {{ item.user_name }}
                          </div>
                          <div class="text-[11px] text-secondary-400 font-mono">
                            {{ item.user_code || "-" }}
                          </div>
                        </td>

                        <!-- Cost Price -->
                        <td class="py-2.5 px-3 text-right font-mono">
                          <span v-if="item.costPrice != null" class="text-secondary-700">
                            ฿{{ formatPrice(item.costPrice) }}
                          </span>
                          <span v-else class="text-secondary-400">—</span>
                        </td>

                        <!-- Excel Price -->
                        <td class="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            :class="
                              item.isBelowCost
                                ? 'text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded'
                                : 'text-teal-700'
                            "
                          >
                            ฿{{ formatPrice(item.excel_price) }}
                          </span>
                          <div v-if="item.baseUnitName" class="text-[10px] text-secondary-400 font-normal">
                            ({{ item.baseUnitName }})
                          </div>
                        </td>

                        <!-- Profit Percentage (% กำไร) -->
                        <td class="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            v-if="item.markupPercent != null"
                            :class="
                              item.markupPercent >= 0
                                ? 'text-green-700 font-medium'
                                : 'text-red-600 font-medium'
                            "
                          >
                            {{ item.markupPercent >= 0 ? '+' : '' }}{{ formatNum(item.markupPercent, 2) }}%
                          </span>
                          <span v-else class="text-secondary-400 font-normal">—</span>
                        </td>

                        <!-- Status Badge -->
                        <td class="py-2.5 px-3 text-center">
                          <span
                            v-if="!item.isMatched"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700"
                            :title="item.matchErrorReason"
                          >
                            <XCircle class="w-3 h-3" />
                            {{ item.costPrice == null ? 'ไม่มีราคาทุน' : 'ไม่พบข้อมูล' }}
                          </span>
                          <span
                            v-else-if="item.isBelowCost"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800"
                          >
                            <AlertTriangle class="w-3 h-3" />
                            ต่ำกว่าทุน
                          </span>
                          <div v-else class="flex flex-col items-center gap-0.5">
                            <span
                              class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-700"
                            >
                              <CheckCircle2 class="w-3 h-3" />
                              ถูกต้อง
                            </span>
                            <span
                              v-if="item.hasExistingPrice && item.existingPriceValue"
                              class="text-[10px] text-blue-700 font-medium bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200"
                              :title="`ราคาเดิมในระบบ ฿${formatPrice(item.existingPriceValue)}`"
                            >
                              มีราคาเดิม (฿{{ formatPrice(item.existingPriceValue) }})
                            </span>
                          </div>
                        </td>

                        <!-- Detail expand button -->
                        <td class="py-2.5 px-3 text-center">
                          <button
                            v-if="item.calculatedUnits.length > 0"
                            type="button"
                            @click="item.expanded = !item.expanded"
                            class="text-xs text-teal-600 hover:text-teal-800 hover:underline flex items-center justify-center gap-0.5 mx-auto"
                          >
                            <span>{{ item.calculatedUnits.length }} หน่วย</span>
                            <ChevronDown v-if="!item.expanded" class="w-3 h-3" />
                            <ChevronUp v-else class="w-3 h-3" />
                          </button>
                          <span v-else class="text-secondary-300">-</span>
                        </td>

                        <!-- Delete / Exclude Action Button (ONLY for importable items) -->
                        <td class="py-2.5 px-3 text-center">
                          <button
                            v-if="item.isMatched && !item.isBelowCost && item.isIncluded"
                            type="button"
                            @click="excludeItemFromImport(item)"
                            title="ไม่นำเข้ารายการนี้"
                            class="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                          <button
                            v-else-if="item.isMatched && !item.isBelowCost"
                            type="button"
                            @click="includeItemInImport(item)"
                            title="นำเข้ารายการนี้"
                            class="p-1.5 text-secondary-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Check class="w-4 h-4" />
                          </button>
                          <span v-else class="text-secondary-300">—</span>
                        </td>
                      </tr>

                      <!-- Collapsible Row for calculated units -->
                      <tr v-if="item.expanded && item.calculatedUnits.length > 0" :key="item.id + '-expanded'" class="bg-teal-50/30">
                        <td colspan="9" class="py-2 px-6">
                          <div class="p-2.5 bg-white border border-teal-100 rounded-lg text-xs">
                            <p class="font-bold text-teal-900 mb-1.5">
                              คำนวณราคาสำหรับหน่วยขายย่อยและหน่วยใหญ่อื่นๆ:
                            </p>
                            <div class="flex flex-wrap gap-3">
                              <div
                                v-for="cu in item.calculatedUnits"
                                :key="cu.product_unit_id"
                                class="px-2.5 py-1 bg-teal-50 border border-teal-200 rounded text-teal-900 font-mono text-[11px]"
                              >
                                <span class="font-bold">{{ cu.unit_name }}</span>
                                <span class="text-teal-600 font-normal"> (×{{ cu.multiplier_to_base }})</span>:
                                <span class="font-bold text-teal-700">฿{{ formatPrice(cu.price) }}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>

                    <tr v-if="filteredItems.length === 0">
                      <td colspan="9" class="py-8 text-center text-secondary-400">
                        ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-secondary-100 bg-secondary-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
        >
          <div v-if="parsedItems.length > 0" class="flex items-center gap-2">
            <button
              type="button"
              @click="resetModalState"
              class="px-3 py-1.5 bg-white border border-secondary-200 hover:bg-secondary-100 text-secondary-700 rounded-xl text-xs font-semibold transition-colors"
            >
              เปลี่ยนไฟล์ Excel
            </button>
          </div>
          <div v-else></div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-100 rounded-xl text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>

            <button
              v-if="parsedItems.length > 0"
              type="button"
              @click="handleConfirmImport"
              :disabled="isSaving || summaryStats.included === 0"
              class="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <RefreshCw v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>ยืนยันการนำเข้าข้อมูล ({{ formatNum(summaryStats.included) }} รายการ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
