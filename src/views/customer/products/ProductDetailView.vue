<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { MOCK_PRODUCTS, MOCK_PRICES } from "@/__mocks__/products";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/customer/cart.store";
import { DrugTypeBadge } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";
import {
  ShoppingCart,
  Heart,
  AlertTriangle,
  Package,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-vue-next";
import { ref } from "vue";

const route = useRoute();
const auth = useAuthStore();
const cart = useCartStore();

const productId = route.params.id as string;
// TODO: replace with GET /products/:id (triggers view_log server-side)
const product = computed(() => MOCK_PRODUCTS.find((p) => p.id === productId));
// TODO: replace with GET /products/:id/price (auth required)
const price = computed(() => {
  if (!product.value) return 0;
  const prices = MOCK_PRICES[productId];
  const role = auth.roleName as "retail" | "wholesale" | "clinic";
  return prices?.[role] ?? product.value.base_price;
});

const related = computed(() =>
  MOCK_PRODUCTS.filter(
    (p) => p.drug_type === product.value?.drug_type && p.id !== productId,
  ).slice(0, 4),
);

const inWishlist = ref(false); // TODO: check from wishlist store
const qty = ref(1);
const addedToCart = ref(false);

function addToCart() {
  if (!product.value || product.value.stock === 0) return;
  cart.addToCart(productId, qty.value);
  addedToCart.value = true;
  setTimeout(() => (addedToCart.value = false), 2000);
}

function formatPrice(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

// TODO: record view_log via API (fire-and-forget)
onMounted(() => {
  console.log("[TODO] POST /view-logs { product_id:", productId, "}");
});
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

      <div v-if="!product" class="text-center py-20">
        <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่พบสินค้า</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Image -->
        <div class="space-y-4">
          <div class="card p-0 overflow-hidden">
            <img
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-80 object-cover"
            />
          </div>
        </div>

        <!-- Right: Details -->
        <div class="space-y-5">
          <div>
            <DrugTypeBadge :type="product.drug_type" />
            <h1 class="text-2xl font-bold text-secondary-900 mt-2">
              {{ product.name }}
            </h1>
            <p class="text-secondary-500 text-sm mt-1">
              {{ product.generic_name }}
            </p>
          </div>

          <!-- Prescription alert -->
          <div
            v-if="product.drug_type === 'prescription'"
            class="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <AlertTriangle class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-yellow-800 text-sm">
                ยานี้ต้องใช้ใบสั่งแพทย์
              </p>
              <p class="text-yellow-700 text-xs mt-0.5">
                กรุณาอัปโหลดใบสั่งแพทย์เมื่อชำระเงิน
              </p>
            </div>
          </div>

          <!-- Controlled drug alert -->
          <div
            v-if="product.drug_type === 'controlled'"
            class="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <AlertTriangle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-red-800 text-sm">ยาควบคุมพิเศษ</p>
              <p class="text-red-700 text-xs mt-0.5">
                ต้องผ่านการอนุมัติจากเภสัชกรก่อนจัดส่ง
              </p>
            </div>
          </div>

          <!-- Price & stock -->
          <div class="card bg-primary-50 border-primary-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-secondary-500 mb-1">
                  ราคา ({{ auth.currentUser?.role_label }})
                </p>
                <p class="text-3xl font-bold text-primary-700">
                  ฿{{ formatPrice(price) }}
                </p>
                <p class="text-xs text-secondary-400 mt-0.5">
                  / {{ product.unit }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-secondary-500 mb-1">สถานะสินค้า</p>
                <div
                  v-if="product.stock > 0"
                  class="flex items-center gap-1.5 text-success font-medium text-sm"
                >
                  <CheckCircle class="w-4 h-4" /> มีสินค้า
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

          <!-- Drug info table -->
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              ข้อมูลผลิตภัณฑ์
            </h3>
            <div class="space-y-2 text-sm">
              <div
                v-for="row in [
                  { label: 'ชื่อสามัญทางยา', value: product.generic_name },
                  { label: 'ชื่อการค้า', value: product.brand_name },
                  { label: 'รูปแบบยา', value: product.dosage_form },
                  { label: 'ความแรง', value: product.strength },
                  { label: 'หน่วย', value: product.unit },
                  { label: 'เลขทะเบียน อย.', value: product.registration_no },
                  { label: 'ผู้ผลิต', value: product.manufacturer },
                ]"
                :key="row.label"
                class="flex gap-3"
              >
                <span class="text-secondary-400 w-36 shrink-0">{{
                  row.label
                }}</span>
                <span class="text-secondary-700 font-medium">{{
                  row.value
                }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-secondary-600 text-sm leading-relaxed">
            {{ product.description }}
          </p>

          <!-- Add to cart / Controls -->
          <div v-if="product.drug_type !== 'controlled'" class="space-y-3">
            <div v-if="product.stock > 0" class="flex items-center gap-3">
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
                  @click="qty = Math.min(product.stock, qty + 1)"
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
            <p v-else class="text-sm text-secondary-400 text-center py-2">
              สินค้าหมดชั่วคราว
            </p>
          </div>

          <!-- Controlled send request -->
          <div v-else>
            <button class="btn-outline w-full">ส่งคำขอซื้อยาควบคุม</button>
            <!-- TODO: POST /orders with controlled drug approval flow -->
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="related.length > 0" class="mt-12">
        <h2 class="text-lg font-bold text-secondary-900 mb-4">
          สินค้าที่เกี่ยวข้อง
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <RouterLink
            v-for="p in related"
            :key="p.id"
            :to="`/products/${p.id}`"
            class="card-hover p-0 overflow-hidden"
          >
            <img
              :src="p.image_url"
              :alt="p.name"
              class="w-full h-32 object-cover"
            />
            <div class="p-3">
              <p class="text-xs text-secondary-400">{{ p.generic_name }}</p>
              <p
                class="text-sm font-medium text-secondary-800 line-clamp-2 mt-0.5"
              >
                {{ p.name }}
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
