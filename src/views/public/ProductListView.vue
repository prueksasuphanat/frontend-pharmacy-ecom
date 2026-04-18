<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { MOCK_PRODUCTS } from "@/__mocks__/products";
import { DrugTypeBadge } from "@/components/ui";
import { ProductDetailModal } from "@/components/product";
import { useAuthStore } from "@/stores/auth.store";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Package,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";
import { Navbar, Footer } from "@/components/layout";
import { BaseInput, BaseSelect, BaseCheckbox } from "@/components/ui";

const auth = useAuthStore();
const router = useRouter();

const search = ref("");
const filterType = ref("");
const filterStock = ref(false);
const sortBy = ref("newest");
const page = ref(1);
const PAGE_SIZE = 12;

const selectedProductId = ref<string | null>(null);

const drugTypes = [
  { value: "", label: "ทุกประเภท" },
  { value: "otc", label: "ยาสามัญประจำบ้าน" },
  { value: "prescription", label: "ยาต้องใช้ใบสั่งแพทย์" },
  { value: "controlled", label: "ยาควบคุมพิเศษ" },
  { value: "supplement", label: "ผลิตภัณฑ์เสริมอาหาร" },
  { value: "cosmetic", label: "เวชสำอาง" },
];

// TODO: replace with GET /products?search=&drug_type=&sort=&page=
const filtered = computed(() => {
  let list = [...MOCK_PRODUCTS].filter((p) => !p.is_deleted);
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.generic_name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }
  if (filterType.value)
    list = list.filter((p) => p.drug_type === filterType.value);
  if (filterStock.value) list = list.filter((p) => p.stock > 0);
  if (sortBy.value === "az")
    list.sort((a, b) => a.name.localeCompare(b.name, "th"));
  if (sortBy.value === "newest")
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return list;
});

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)),
);

// Pagination helpers
const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const delta = 2; // จำนวนหน้าที่แสดงรอบๆ หน้าปัจจุบัน
  const pages: (number | string)[] = [];

  if (total <= 7) {
    // แสดงทุกหน้าถ้าไม่เกิน 7 หน้า
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // แสดงหน้าแรก
    pages.push(1);

    // คำนวณช่วงที่จะแสดง
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);

    // เพิ่ม ... ถ้าห่างจากหน้าแรก
    if (start > 2) {
      pages.push("...");
    }

    // เพิ่มหน้าในช่วง
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // เพิ่ม ... ถ้าห่างจากหน้าสุดท้าย
    if (end < total - 1) {
      pages.push("...");
    }

    // แสดงหน้าสุดท้าย
    pages.push(total);
  }

  return pages;
});

function goToPage(p: number) {
  page.value = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextPage() {
  if (page.value < totalPages.value) {
    goToPage(page.value + 1);
  }
}

function prevPage() {
  if (page.value > 1) {
    goToPage(page.value - 1);
  }
}

// Reset page เมื่อเปลี่ยน filter
watch([search, filterType, filterStock, sortBy], () => {
  page.value = 1;
});

function goToProduct(id: string) {
  if (!auth.isLoggedIn) {
    router.push(`/login?redirect=/products/${id}`);
  } else {
    selectedProductId.value = id;
  }
}

function openProductModal(id: string) {
  selectedProductId.value = id;
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero banner -->
      <div
        class="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-8 mb-8 text-white"
      >
        <h1 class="text-3xl font-bold mb-2">ยาและผลิตภัณฑ์เพื่อสุขภาพ</h1>
        <p class="text-primary-100 mb-6">
          สินค้าคุณภาพจากผู้ผลิตชั้นนำ พร้อมส่ง ราคาพิเศษตามกลุ่มลูกค้า
        </p>
        <!-- Search bar in hero -->
        <div class="relative max-w-xl">
          <BaseInput
            v-model="search"
            type="text"
            placeholder="ค้นหาชื่อยา, generic name, ผู้ผลิต, SKU..."
            :icon="Search"
            class="w-full"
          />
        </div>
      </div>

      <!-- Filters bar -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        <!-- Left: filter controls -->
        <div class="flex items-center gap-3 flex-1 flex-wrap w-full sm:w-auto">
          <div class="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal class="h-4 w-4 text-secondary-400" />
            <span class="text-sm text-secondary-500">กรอง:</span>
          </div>
          <BaseSelect
            v-model="filterType"
            :options="drugTypes"
            class="w-full sm:w-48 shrink-0"
          />
        </div>

        <!-- Right: sort control -->
        <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <span class="text-sm text-secondary-500 whitespace-nowrap"
            >เรียงโดย:</span
          >
          <BaseSelect
            v-model="sortBy"
            :options="[
              { value: 'newest', label: 'ใหม่ล่าสุด' },
              { value: 'az', label: 'ชื่อ A-Z' },
            ]"
            class="w-full sm:w-[150px]"
          />
        </div>
      </div>

      <div class="w-fit">
        <BaseCheckbox v-model="filterStock" label="มีสินค้า" class="mb-4" />
      </div>

      <!-- Count -->
      <p class="text-sm text-secondary-500 mb-4">
        พบ
        <strong class="text-secondary-900">{{ filtered.length }}</strong> รายการ
      </p>

      <!-- Product grid -->
      <div v-if="paginated.length > 0" class="min-h-[1000px]">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="product in paginated"
            :key="product.id"
            @click="goToProduct(product.id)"
            class="card-hover p-0 overflow-hidden group cursor-pointer"
          >
            <!-- Image -->
            <div class="relative">
              <img
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <DrugTypeBadge
                :type="product.drug_type"
                class="absolute top-2 left-2"
              />
              <div
                v-if="product.stock === 0"
                class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl"
              >
                <span
                  class="bg-white text-secondary-700 text-xs font-bold px-3 py-1 rounded-full"
                  >สินค้าหมด</span
                >
              </div>
            </div>
            <!-- Info -->
            <div class="p-3">
              <p class="text-xs text-secondary-400 mb-0.5">
                {{ product.generic_name }}
              </p>
              <h3
                class="font-semibold text-sm text-secondary-900 line-clamp-2 leading-snug mb-2"
              >
                {{ product.name }}
              </h3>
              <p class="text-xs text-secondary-400 mb-3">
                {{ product.manufacturer }}
              </p>
              <!-- Price locked -->
              <div
                v-if="!auth.isLoggedIn"
                class="bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 text-center"
              >
                <p class="text-xs text-secondary-500">
                  🔒 เข้าสู่ระบบเพื่อดูราคา
                </p>
              </div>
              <div
                v-else-if="product.stock === 0"
                class="text-sm font-medium text-secondary-400"
              >
                สินค้าหมด
              </div>
              <div v-else class="flex items-center justify-between">
                <p class="text-xs font-medium text-secondary-500">
                  ดูรายละเอียด
                </p>
                <ChevronRight class="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้าที่ค้นหา</p>
        <button
          @click="
            search = '';
            filterType = '';
            filterStock = false;
          "
          class="btn-secondary mt-4 text-sm"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <!-- Page info -->
          <p class="text-sm text-secondary-500">
            แสดงหน้า <strong class="text-secondary-900">{{ page }}</strong> จาก
            <strong class="text-secondary-900">{{ totalPages }}</strong> หน้า
            ({{ filtered.length }} รายการ)
          </p>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- First page -->
            <button
              @click="goToPage(1)"
              :disabled="page === 1"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === 1
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
              title="หน้าแรก"
            >
              <ChevronsLeft class="w-4 h-4" />
            </button>

            <!-- Previous page -->
            <button
              @click="prevPage"
              :disabled="page === 1"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === 1
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <!-- Page numbers -->
            <template v-for="(p, index) in pageNumbers" :key="index">
              <button
                v-if="typeof p === 'number'"
                @click="goToPage(p)"
                :class="[
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                  p === page
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50 hover:border-primary-300',
                ]"
              >
                {{ p }}
              </button>
              <span
                v-else
                class="w-9 h-9 flex items-center justify-center text-secondary-400"
              >
                {{ p }}
              </span>
            </template>

            <!-- Next page -->
            <button
              @click="nextPage"
              :disabled="page === totalPages"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === totalPages
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
              title="หน้าถัดไป"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <!-- Last page -->
            <button
              @click="goToPage(totalPages)"
              :disabled="page === totalPages"
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                page === totalPages
                  ? 'text-secondary-300 cursor-not-allowed'
                  : 'text-secondary-600 hover:bg-secondary-100',
              ]"
              title="หน้าสุดท้าย"
            >
              <ChevronsRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <ProductDetailModal
      :product-id="selectedProductId"
      @close="selectedProductId = null"
    />

    <Footer />
  </div>
</template>
