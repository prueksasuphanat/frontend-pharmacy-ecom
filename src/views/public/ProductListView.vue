<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePublicProductStore } from "@/stores/public/product.store";
import { usePublicCategoryStore } from "@/stores/public/category.store";
import { ProductDetailModal, ProductImage } from "@/components/product";
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
import { BaseInput, BaseSelect } from "@/components/ui";

const auth = useAuthStore();
const router = useRouter();
const productStore = usePublicProductStore();
const categoryStore = usePublicCategoryStore();

const search = ref("");
const categoryId = ref<number | "">("");
const page = ref(1);
const PAGE_SIZE = 12;

const selectedProductId = ref<number | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    fetchProducts();
  }, 300);
}

const categoryOptions = computed(() => [
  { value: "", label: "ทุกหมวดหมู่" },
  ...categoryStore.categories.map((c) => ({ value: c.id, label: c.name })),
]);

const pagination = computed(() => productStore.pagination);
const totalPages = computed(() => pagination.value?.totalPages ?? 1);
const totalItems = computed(() => pagination.value?.total ?? 0);

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const delta = 2;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);
  }
  return pages;
});

function fetchProducts() {
  productStore.fetchProducts({
    page: page.value,
    limit: PAGE_SIZE,
    search: search.value || undefined,
    category_id:
      categoryId.value !== "" ? (categoryId.value as number) : undefined,
  });
}

function goToPage(p: number) {
  page.value = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchProducts();
}

function nextPage() {
  if (page.value < totalPages.value) goToPage(page.value + 1);
}

function prevPage() {
  if (page.value > 1) goToPage(page.value - 1);
}

watch(categoryId, () => {
  page.value = 1;
  fetchProducts();
});

function goToProduct(id: number) {
  if (!auth.isLoggedIn) {
    router.push(`/login?redirect=/products/${id}`);
  } else {
    selectedProductId.value = id;
  }
}

onMounted(() => {
  fetchProducts();
  categoryStore.fetchCategories();
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        class="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-8 mb-8 text-white"
      >
        <h1 class="text-3xl font-bold mb-2">ยาและผลิตภัณฑ์เพื่อสุขภาพ</h1>
        <p class="text-primary-100 mb-6">
          สินค้าคุณภาพจากผู้ผลิตชั้นนำ พร้อมส่ง ราคาพิเศษตามกลุ่มลูกค้า
        </p>
        <div class="relative max-w-xl">
          <BaseInput
            v-model="search"
            type="text"
            placeholder="ค้นหาชื่อยา, รหัสสินค้า..."
            :icon="Search"
            class="w-full"
            @input="onSearchInput"
          />
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        <div class="flex items-center gap-3 flex-1 flex-wrap w-full sm:w-auto">
          <div class="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal class="h-4 w-4 text-secondary-400" />
            <span class="text-sm text-secondary-500">หมวดหมู่:</span>
          </div>
          <BaseSelect
            v-model="categoryId"
            :options="categoryOptions"
            class="w-full sm:w-56 shrink-0"
          />
        </div>
      </div>

      <p class="text-sm text-secondary-500 mb-4">
        พบ <strong class="text-secondary-900">{{ totalItems }}</strong> รายการ
      </p>

      <div v-if="productStore.isLoading" class="min-h-[600px]">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="n in PAGE_SIZE"
            :key="n"
            class="rounded-2xl overflow-hidden border border-secondary-100 bg-white animate-pulse"
          >
            <div
              class="w-full h-40 bg-gradient-to-br from-secondary-100 to-secondary-50 relative"
            >
              <div
                class="absolute top-2 left-2 h-5 w-16 bg-secondary-200 rounded-full"
              />
            </div>

            <div class="p-3 space-y-2">
              <div class="h-3 bg-secondary-100 rounded w-2/5" />

              <div class="h-4 bg-secondary-150 rounded w-full" />

              <div class="h-4 bg-secondary-100 rounded w-3/4" />

              <div class="flex gap-1 pt-0.5">
                <div class="h-5 w-10 bg-secondary-100 rounded" />
                <div class="h-5 w-12 bg-secondary-100 rounded" />
              </div>

              <div class="h-8 bg-secondary-100 rounded-lg w-full mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="productStore.error" class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">{{ productStore.error }}</p>
        <button @click="fetchProducts" class="btn-secondary mt-4 text-sm">
          ลองใหม่
        </button>
      </div>

      <div v-else-if="productStore.products.length > 0" class="min-h-[600px]">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="product in productStore.products"
            :key="product.id"
            @click="goToProduct(product.id)"
            class="card-hover p-0 overflow-hidden group cursor-pointer"
          >
            <div class="relative">
              <ProductImage
                :attachments="product.attachments"
                :name="product.name"
                img-class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                class="w-full h-40 overflow-hidden"
              />

              <div
                v-if="product.categories?.[0]"
                class="absolute top-2 left-2 bg-white/90 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm"
              >
                {{ product.categories[0].category.name }}
              </div>

              <div
                v-if="product.quantity === 0"
                class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl"
              >
                <span
                  class="bg-white text-secondary-700 text-xs font-bold px-3 py-1 rounded-full"
                >
                  สินค้าหมด
                </span>
              </div>
            </div>

            <div class="p-3">
              <p class="text-xs text-secondary-400 mb-0.5 truncate">
                {{ product.generic_name || "—" }}
              </p>
              <h3
                class="font-semibold text-sm text-secondary-900 line-clamp-2 leading-snug mb-2"
              >
                {{ product.name }}
              </h3>

              <div
                v-if="product.units?.length"
                class="flex flex-wrap gap-1 mb-2"
              >
                <span
                  v-for="u in product.units"
                  :key="u.id"
                  class="text-xs bg-secondary-100 text-secondary-500 px-1.5 py-0.5 rounded"
                >
                  {{ (u as any).unit_label ?? u.unit?.name }}
                </span>
              </div>

              <div
                v-if="!auth.isLoggedIn"
                class="bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2 text-center"
              >
                <p class="text-xs text-secondary-500">
                  🔒 เข้าสู่ระบบเพื่อดูราคา
                </p>
              </div>

              <div
                v-else-if="product.quantity === 0"
                class="text-sm font-medium text-secondary-400"
              >
                สินค้าหมด
              </div>

              <div v-else class="flex items-center justify-between">
                <p class="text-xs font-medium text-primary-600">
                  ดูรายละเอียดและราคา
                </p>
                <ChevronRight class="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้าที่ค้นหา</p>
        <button
          @click="
            search = '';
            categoryId = '';
            page = 1;
            fetchProducts();
          "
          class="btn-secondary mt-4 text-sm"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <div v-if="totalPages > 1 && !productStore.isLoading" class="mt-8">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p class="text-sm text-secondary-500">
            แสดงหน้า <strong class="text-secondary-900">{{ page }}</strong> จาก
            <strong class="text-secondary-900">{{ totalPages }}</strong> หน้า
            ({{ totalItems }} รายการ)
          </p>

          <div class="flex items-center gap-2">
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

    <ProductDetailModal
      :product-id="selectedProductId"
      @close="selectedProductId = null"
    />

    <Footer />
  </div>
</template>
