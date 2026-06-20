<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useToast } from "vue-toastification";
import { publicProductsApi } from "@/api/public/products";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/customer/cart.store";
import { Navbar, Footer } from "@/components/layout";
import {
  ShoppingCart,
  Heart,
  Package,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-vue-next";
import { BaseLoading } from "@/components/ui";
import type { Product } from "@/types";

const route = useRoute();
const auth = useAuthStore();
const cart = useCartStore();
const toast = useToast();

const productId = parseInt(route.params.id as string, 10);
const product = ref<Product | null>(null);
const loading = ref(true);
const selectedUnitId = ref<number | null>(null);

onMounted(async () => {
  try {
    const res = await publicProductsApi.getById(productId);
    product.value = res.data.data;

    if (product.value.units && product.value.units.length > 0) {
      selectedUnitId.value = product.value.units[0].id;
    }
  } catch {
  } finally {
    loading.value = false;
  }
});

const selectedUnit = computed(() => {
  if (!product.value?.units || !selectedUnitId.value) return null;
  return product.value.units.find((u) => u.id === selectedUnitId.value) ?? null;
});

const displayPrice = computed(() => {
  if (!selectedUnit.value) return 0;
  return selectedUnit.value.price ?? Number(selectedUnit.value.default_price);
});

const isSpecialPrice = computed(
  () => selectedUnit.value?.is_special_price ?? false,
);

const inStock = computed(() => (product.value?.quantity ?? 0) > 0);

const inWishlist = ref(false);
const qty = ref(1);
const addedToCart = ref(false);

async function addToCart() {
  if (!product.value || !selectedUnitId.value || !inStock.value) return;
  try {
    await cart.addToCart(selectedUnitId.value, qty.value);
    addedToCart.value = true;
    setTimeout(() => (addedToCart.value = false), 2000);
  } catch (err: any) {
    toast.error(err.response?.data?.message || "ไม่สามารถเพิ่มลงตะกร้าได้");
  }
}

function formatPrice(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterLink
        to="/products"
        class="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-700 mb-6"
      >
        <ArrowLeft class="w-4 h-4" />กลับ
      </RouterLink>

      <!-- Loading state -->
      <BaseLoading v-if="loading" :loading="loading" text="กำลังดาวน์โหลดรายละเอียดสินค้า..." />

      <div v-else-if="!product" class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้า</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="card p-0 overflow-hidden">
            <div
              v-if="product.attachments && product.attachments.length > 0"
              class="w-full h-80 bg-cover bg-center"
              :style="{ backgroundImage: `url(${product.attachments[0].url})` }"
            />
            <div
              v-else
              class="w-full h-80 bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center"
            >
              <span class="text-3xl font-bold text-primary-400">
                {{ product.name.slice(0, 2) }}
              </span>
            </div>
          </div>

          <div
            v-if="product.attachments && product.attachments.length > 1"
            class="flex gap-2"
          >
            <div
              v-for="(att, i) in product.attachments.slice(0, 5)"
              :key="att.id"
              class="w-16 h-16 rounded-lg overflow-hidden border-2 border-secondary-100 cursor-pointer"
            >
              <img
                :src="att.url"
                :alt="att.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div>
            <span class="badge badge-teal text-xs">{{ product.code }}</span>
            <h1 class="text-2xl font-bold text-secondary-900 mt-2">
              {{ product.name }}
            </h1>
            <p
              v-if="product.generic_name"
              class="text-secondary-500 text-sm mt-1"
            >
              {{ product.generic_name }}
            </p>
          </div>

          <div v-if="product.units && product.units.length > 1" class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              เลือกหน่วย
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="unit in product.units"
                :key="unit.id"
                @click="selectedUnitId = unit.id"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
                  selectedUnitId === unit.id
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-secondary-200 text-secondary-600 hover:border-primary-300',
                ]"
              >
                {{ unit.unit?.name || "หน่วย" }}
              </button>
            </div>
          </div>

          <div class="card bg-primary-50 border-primary-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-secondary-500 mb-1">ราคา</p>
                <p
                  v-if="displayPrice > 0"
                  class="text-3xl font-bold text-primary-700"
                >
                  ฿{{ formatPrice(displayPrice) }}
                </p>
                <p v-else class="text-lg font-medium text-secondary-500">
                  ติดต่อสอบถาม
                </p>
                <p
                  v-if="isSpecialPrice"
                  class="text-xs text-primary-600 mt-0.5 font-medium"
                >
                  ✨ ราคาพิเศษสำหรับคุณ
                </p>
                <p
                  v-if="selectedUnit"
                  class="text-xs text-secondary-400 mt-0.5"
                >
                  / {{ selectedUnit.unit?.name || "หน่วย" }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-secondary-500 mb-1">สถานะสินค้า</p>
                <div
                  v-if="inStock"
                  class="flex items-center gap-1.5 text-success font-medium text-sm"
                >
                  <CheckCircle class="w-4 h-4" /> มีสินค้า ({{
                    product.quantity
                  }})
                </div>
                <div
                  v-else
                  class="flex items-center gap-1.5 text-danger font-medium text-sm"
                >
                  <Clock class="w-4 h-4" /> สินค้าหมด
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              ข้อมูลผลิตภัณฑ์
            </h3>
            <div class="space-y-2 text-sm">
              <div
                v-for="row in [
                  { label: 'รหัสสินค้า', value: product.code },
                  { label: 'ชื่อสามัญ', value: product.generic_name },
                  { label: 'ผู้จำหน่าย', value: product.vendor?.name },
                  {
                    label: 'หมวดหมู่',
                    value: product.categories
                      ?.map((c) => c.category.name)
                      .join(', '),
                  },
                ].filter((r) => r.value)"
                :key="row.label"
                class="flex gap-3"
              >
                <span class="text-secondary-400 w-28 shrink-0">{{
                  row.label
                }}</span>
                <span class="text-secondary-700 font-medium">{{
                  row.value
                }}</span>
              </div>
            </div>
          </div>

          <p
            v-if="product.using"
            class="text-secondary-600 text-sm leading-relaxed"
          >
            <span class="font-medium text-secondary-800">วิธีใช้:</span>
            {{ product.using }}
          </p>
          <p
            v-if="product.warning"
            class="text-orange-600 text-sm leading-relaxed"
          >
            <span class="font-medium">⚠️ คำเตือน:</span> {{ product.warning }}
          </p>

          <div v-if="auth.isLoggedIn" class="space-y-3">
            <div
              v-if="inStock && displayPrice > 0"
              class="flex items-center gap-3"
            >
              <div
                class="flex items-center gap-0 border border-secondary-200 rounded-xl overflow-hidden"
              >
                <button
                  @click="qty = Math.max(1, qty - 1)"
                  class="w-10 h-10 flex items-center justify-center hover:bg-secondary-50 text-lg"
                >
                  −
                </button>
                <span class="w-12 text-center font-medium text-sm">{{
                  qty
                }}</span>
                <button
                  @click="qty = Math.min(product.quantity, qty + 1)"
                  class="w-10 h-10 flex items-center justify-center hover:bg-secondary-50 text-lg"
                >
                  +
                </button>
              </div>
              <button
                @click="addToCart"
                :disabled="addedToCart"
                :class="[
                  'btn-primary flex-1 gap-2',
                  addedToCart && 'bg-green-600',
                ]"
              >
                <ShoppingCart class="w-4 h-4" />
                {{ addedToCart ? "✓ เพิ่มแล้ว!" : "เพิ่มลงตะกร้า" }}
              </button>
              <button
                @click="inWishlist = !inWishlist"
                :class="[
                  'p-2.5 rounded-xl border transition-colors',
                  inWishlist
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-secondary-200 text-secondary-400 hover:text-red-400',
                ]"
              >
                <Heart :class="['w-5 h-5', inWishlist && 'fill-red-500']" />
              </button>
            </div>
            <p
              v-else-if="!inStock"
              class="text-sm text-secondary-400 text-center py-2"
            >
              สินค้าหมดชั่วคราว
            </p>
          </div>
          <div v-else class="card bg-secondary-50 text-center">
            <p class="text-sm text-secondary-500 mb-2">
              เข้าสู่ระบบเพื่อสั่งซื้อ
            </p>
            <RouterLink to="/auth/login" class="btn-primary text-sm"
              >เข้าสู่ระบบ</RouterLink
            >
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
