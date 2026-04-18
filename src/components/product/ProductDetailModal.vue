<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { MOCK_PRODUCTS, MOCK_PRICES } from "@/__mocks__/products";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { DrugTypeBadge } from "@/components/ui";
import {
  ShoppingCart,
  Heart,
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  Package,
  Building2,
  Pill,
  FileText,
} from "lucide-vue-next";

const props = defineProps<{
  productId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const auth = useAuthStore();
const cart = useCartStore();

const product = computed(() =>
  props.productId ? MOCK_PRODUCTS.find((p) => p.id === props.productId) : null,
);

// TODO: replace with GET /products/:id/price (auth required)
const price = computed(() => {
  if (!product.value) return 0;
  const prices = MOCK_PRICES[props.productId!];
  const role = auth.roleName as "retail" | "wholesale" | "clinic";
  return prices?.[role] ?? product.value.base_price;
});

const inWishlist = ref(false); // TODO: check from wishlist store
const qty = ref(1);
const addedToCart = ref(false);

function addToCart() {
  if (!product.value || product.value.stock === 0) return;
  cart.addToCart(props.productId!, qty.value);
  addedToCart.value = true;
  setTimeout(() => (addedToCart.value = false), 2000);
}

function formatPrice(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

// Handle ESC key to close modal
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    emit("close");
  }
}

// Reset state when product changes
watch(
  () => props.productId,
  (newId) => {
    if (newId) {
      qty.value = 1;
      addedToCart.value = false;
      document.body.style.overflow = "hidden";
      // TODO: record view_log via API (fire-and-forget)
      console.log("[TODO] POST /view-logs { product_id:", newId, "}");
    } else {
      document.body.style.overflow = "";
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="productId"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />

        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="productId"
            class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <!-- Header with close button -->
            <div class="absolute top-0 right-0 z-10 p-4">
              <button
                @click="$emit('close')"
                class="p-2 rounded-full bg-white/95 hover:bg-white shadow-lg transition-all hover:scale-110"
              >
                <X class="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div v-if="!product" class="p-12 text-center">
              <Package class="w-16 h-16 text-secondary-200 mx-auto mb-4" />
              <p class="text-secondary-400">ไม่พบสินค้า</p>
            </div>

            <div v-else class="overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
                <!-- Left: Image -->
                <div
                  class="relative bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 flex items-center justify-center min-h-[400px]"
                >
                  <img
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-full h-full max-h-[500px] object-contain drop-shadow-2xl"
                  />
                  <div class="absolute top-6 left-6">
                    <DrugTypeBadge :type="product.drug_type" />
                  </div>
                </div>

                <!-- Right: Details -->
                <div class="p-8 flex flex-col">
                  <!-- Title -->
                  <div class="mb-6">
                    <h1 class="text-2xl font-bold text-secondary-900 mb-2">
                      {{ product.name }}
                    </h1>
                    <p class="text-secondary-500 text-sm">
                      {{ product.generic_name }}
                    </p>
                  </div>

                  <!-- Prescription alert -->
                  <div
                    v-if="product.drug_type === 'prescription'"
                    class="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4"
                  >
                    <AlertTriangle
                      class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                    />
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
                    class="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-4"
                  >
                    <AlertTriangle
                      class="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <p class="font-semibold text-red-800 text-sm">
                        ยาควบคุมพิเศษ
                      </p>
                      <p class="text-red-700 text-xs mt-0.5">
                        ต้องผ่านการอนุมัติจากเภสัชกรก่อนจัดส่ง
                      </p>
                    </div>
                  </div>

                  <!-- Price & Stock Card -->
                  <div
                    class="bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100 rounded-2xl p-5 mb-6"
                  >
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <p class="text-xs text-secondary-500 mb-1">
                          ราคา ({{ auth.currentUser?.role_label }})
                        </p>
                        <div class="flex items-baseline gap-2">
                          <p class="text-4xl font-bold text-primary-700">
                            {{ formatPrice(price) }}
                          </p>
                          <p class="text-sm text-secondary-500">บาท</p>
                        </div>
                        <p class="text-xs text-secondary-400 mt-1">
                          / {{ product.unit }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-secondary-500 mb-2">
                          สถานะสินค้า
                        </p>
                        <div
                          v-if="product.stock > 0"
                          class="inline-flex items-center gap-1.5 bg-green-100 text-green-700 font-medium text-sm px-3 py-1.5 rounded-full"
                        >
                          <CheckCircle class="w-4 h-4" /> มีสินค้า
                        </div>
                        <div
                          v-else
                          class="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-medium text-sm px-3 py-1.5 rounded-full"
                        >
                          <Clock class="w-4 h-4" /> สินค้าหมด
                        </div>
                      </div>
                    </div>

                    <!-- Add to cart controls -->
                    <div
                      v-if="product.drug_type !== 'controlled'"
                      class="space-y-3"
                    >
                      <div
                        v-if="product.stock > 0"
                        class="flex items-center gap-3"
                      >
                        <div
                          class="flex items-center gap-0 bg-white border-2 border-secondary-200 rounded-xl overflow-hidden"
                        >
                          <button
                            @click="qty = Math.max(1, qty - 1)"
                            class="w-11 h-11 flex items-center justify-center hover:bg-secondary-50 text-lg font-semibold text-secondary-600 transition-colors"
                          >
                            −
                          </button>
                          <span
                            class="w-14 text-center font-bold text-secondary-900"
                            >{{ qty }}</span
                          >
                          <button
                            @click="qty = Math.min(product.stock, qty + 1)"
                            class="w-11 h-11 flex items-center justify-center hover:bg-secondary-50 text-lg font-semibold text-secondary-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          @click="addToCart"
                          :disabled="addedToCart"
                          :class="[
                            'flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                            addedToCart
                              ? 'bg-green-600 text-white'
                              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30 hover:shadow-xl',
                          ]"
                        >
                          <ShoppingCart class="w-4 h-4" />
                          {{ addedToCart ? "✓ เพิ่มแล้ว!" : "เพิ่มลงตะกร้า" }}
                        </button>
                        <button
                          @click="inWishlist = !inWishlist"
                          :class="[
                            'p-3 rounded-xl border-2 transition-all',
                            inWishlist
                              ? 'bg-red-50 border-red-300 text-red-500'
                              : 'bg-white border-secondary-200 text-secondary-400 hover:text-red-400 hover:border-red-200',
                          ]"
                        >
                          <Heart
                            :class="['w-5 h-5', inWishlist && 'fill-red-500']"
                          />
                        </button>
                      </div>
                      <p
                        v-else
                        class="text-sm text-secondary-400 text-center py-2"
                      >
                        สินค้าหมดชั่วคราว
                      </p>
                    </div>

                    <!-- Controlled send request -->
                    <div v-else>
                      <button
                        class="w-full h-11 rounded-xl font-semibold text-sm bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        ส่งคำขอซื้อยาควบคุม
                      </button>
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="space-y-4 mb-6">
                    <h3
                      class="font-bold text-secondary-900 text-sm flex items-center gap-2"
                    >
                      <FileText class="w-4 h-4 text-primary-600" />
                      ข้อมูลผลิตภัณฑ์
                    </h3>
                    <div class="grid grid-cols-1 gap-3 text-sm">
                      <div
                        class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                      >
                        <Pill
                          class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                        />
                        <div class="flex-1">
                          <p class="text-xs text-secondary-500 mb-0.5">
                            ชื่อการค้า
                          </p>
                          <p class="text-secondary-900 font-medium">
                            {{ product.brand_name }}
                          </p>
                        </div>
                      </div>
                      <div
                        class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                      >
                        <Package
                          class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                        />
                        <div class="flex-1">
                          <p class="text-xs text-secondary-500 mb-0.5">
                            รูปแบบยา / ความแรง
                          </p>
                          <p class="text-secondary-900 font-medium">
                            {{ product.dosage_form }} • {{ product.strength }}
                          </p>
                        </div>
                      </div>
                      <div
                        class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                      >
                        <Building2
                          class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                        />
                        <div class="flex-1">
                          <p class="text-xs text-secondary-500 mb-0.5">
                            ผู้ผลิต
                          </p>
                          <p class="text-secondary-900 font-medium">
                            {{ product.manufacturer }}
                          </p>
                        </div>
                      </div>
                      <div
                        class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                      >
                        <FileText
                          class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                        />
                        <div class="flex-1">
                          <p class="text-xs text-secondary-500 mb-0.5">
                            เลขทะเบียน อย.
                          </p>
                          <p class="text-secondary-900 font-medium">
                            {{ product.registration_no }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="pt-4 border-t border-secondary-100">
                    <h3 class="font-bold text-secondary-900 text-sm mb-2">
                      รายละเอียด
                    </h3>
                    <p class="text-secondary-600 text-sm leading-relaxed">
                      {{ product.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
