<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { usePublicProductStore } from "@/stores/public/product.store";
import { useCartStore } from "@/stores/customer/cart.store";
import { useWishlistStore } from "@/stores/customer/wishlist.store";
import { ProductImage } from "@/components/product";
import {
  ShoppingCart,
  Heart,
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  Package,
  Pill,
  Tag,
} from "lucide-vue-next";
import { formatPrice as _formatPrice } from "@/utils/format";

const props = defineProps<{
  productId: number | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const cart = useCartStore();
const store = usePublicProductStore();
const wishlistStore = useWishlistStore();

const product = computed(() => store.selectedProduct);
const isLoading = computed(() => store.isLoadingDetail);

const selectedUnitId = ref<number | null>(null);
const qty = ref(1);
const addedToCart = ref(false);

const inWishlist = computed(() =>
  product.value ? wishlistStore.isInWishlist(product.value.id) : false,
);

const selectedUnit = computed(() => {
  if (!product.value?.units?.length) return null;
  return (
    product.value.units.find((u) => u.id === selectedUnitId.value) ??
    product.value.units[0]
  );
});

function formatPrice(n: number) {
  if (n === 0) return "ติดต่อสอบถาม";
  return _formatPrice(n);
}

function addToCart() {
  if (!product.value || product.value.quantity === 0 || !selectedUnit.value)
    return;
  cart.addToCart(selectedUnit.value.id, qty.value);
  addedToCart.value = true;
  setTimeout(() => (addedToCart.value = false), 2000);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

watch(
  () => props.productId,
  (newId) => {
    if (newId !== null) {
      store.fetchProductById(newId);
      qty.value = 1;
      selectedUnitId.value = null;
      addedToCart.value = false;
      document.body.style.overflow = "hidden";
    } else {
      store.clearSelectedProduct();
      document.body.style.overflow = "";
    }
  },
);

watch(product, (p) => {
  if (p?.units?.length) selectedUnitId.value = p.units[0].id;
});

onMounted(() => document.addEventListener("keydown", handleKeydown));
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
        v-if="productId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />

        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="productId !== null"
            class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div class="absolute top-0 right-0 z-10 p-4">
              <button
                @click="$emit('close')"
                class="p-2 rounded-full bg-white/95 hover:bg-white shadow-lg transition-all hover:scale-110"
              >
                <X class="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div
              v-if="isLoading"
              class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse"
            >
              <div class="w-full h-80 bg-secondary-100 rounded-2xl" />
              <div class="space-y-4 pt-4">
                <div class="h-6 bg-secondary-100 rounded w-3/4" />
                <div class="h-4 bg-secondary-100 rounded w-1/2" />
                <div class="h-4 bg-secondary-100 rounded w-1/3" />
                <div class="h-24 bg-secondary-100 rounded-2xl mt-6" />
                <div class="h-11 bg-secondary-100 rounded-xl mt-4" />
              </div>
            </div>

            <div v-else-if="!product" class="p-12 text-center">
              <Package class="w-16 h-16 text-secondary-200 mx-auto mb-4" />
              <p class="text-secondary-400">ไม่พบสินค้า</p>
            </div>

            <div v-else class="overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div
                  class="relative bg-gradient-to-br from-teal-50 to-primary-50 flex items-center justify-center min-h-[360px] md:min-h-full"
                >
                  <ProductImage
                    :attachments="product.attachments"
                    :name="product.name"
                    img-class="w-full h-full max-h-[480px] object-contain"
                    class="w-full h-full max-h-[480px] flex items-center justify-center"
                  />

                  <div
                    v-if="product.categories?.length"
                    class="absolute top-4 left-4 flex flex-wrap gap-1"
                  >
                    <span
                      v-for="cat in product.categories"
                      :key="cat.category_id"
                      class="bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm"
                    >
                      {{ cat.category.name }}
                    </span>
                  </div>
                </div>

                <div class="p-6 md:p-8 flex flex-col gap-4 overflow-y-auto">
                  <div>
                    <h1
                      class="text-xl md:text-2xl font-bold text-secondary-900 leading-tight"
                    >
                      {{ product.name }}
                    </h1>
                    <p class="text-secondary-500 text-sm mt-1">
                      {{ product.generic_name || "-" }}
                    </p>
                    <p class="text-xs text-secondary-400 mt-0.5">
                      รหัส: {{ product.code }}
                    </p>
                  </div>

                  <div v-if="product.units?.length">
                    <p
                      class="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-2"
                    >
                      เลือกหน่วย
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="unit in product.units"
                        :key="unit.id"
                        @click="
                          selectedUnitId = unit.id;
                          qty = 1;
                        "
                        :class="[
                          'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                          selectedUnitId === unit.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                            : 'border-secondary-200 bg-white text-secondary-600 hover:border-primary-300 hover:bg-primary-50/50',
                        ]"
                      >
                        {{ unit.unit?.name }}
                      </button>
                    </div>

                    <p
                      v-if="selectedUnit && (selectedUnit as any).unit_label"
                      class="text-xs text-secondary-400 mt-1.5"
                    >
                      {{ (selectedUnit as any).unit_label }}
                    </p>
                  </div>

                  <div
                    class="bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100 rounded-2xl p-4"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <p
                          class="text-xs text-secondary-500 mb-0.5 flex items-center gap-1"
                        >
                          ราคา
                        </p>
                        <div class="flex items-baseline gap-1.5">
                          <p
                            class="text-3xl md:text-4xl font-bold text-primary-700"
                          >
                            {{
                              selectedUnit
                                ? formatPrice((selectedUnit as any).price ?? 0)
                                : "—"
                            }}
                          </p>
                          <p
                            v-if="
                              selectedUnit && (selectedUnit as any).price > 0
                            "
                            class="text-sm text-secondary-500"
                          >
                            บาท
                          </p>
                        </div>
                        <p
                          v-if="selectedUnit"
                          class="text-xs text-secondary-400 mt-0.5"
                        >
                          / {{ selectedUnit.unit?.name }}
                        </p>
                      </div>
                      <div>
                        <div
                          v-if="product.quantity > 0"
                          class="inline-flex items-center gap-1.5 bg-green-100 text-green-700 font-medium text-xs px-3 py-1.5 rounded-full"
                        >
                          <CheckCircle class="w-3.5 h-3.5" /> มีสินค้า
                        </div>
                        <div
                          v-else
                          class="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-medium text-xs px-3 py-1.5 rounded-full"
                        >
                          <Clock class="w-3.5 h-3.5" /> สินค้าหมด
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="product.quantity > 0"
                      class="flex items-center gap-2"
                    >
                      <div
                        class="flex items-center bg-white border-2 border-secondary-200 rounded-xl overflow-hidden"
                      >
                        <button
                          @click="qty = Math.max(1, qty - 1)"
                          class="w-10 h-10 flex items-center justify-center hover:bg-secondary-50 text-lg font-semibold text-secondary-600 transition-colors"
                        >
                          −
                        </button>
                        <span
                          class="w-12 text-center font-bold text-secondary-900 text-sm"
                          >{{ qty }}</span
                        >
                        <button
                          @click="qty = Math.min(product.quantity, qty + 1)"
                          class="w-10 h-10 flex items-center justify-center hover:bg-secondary-50 text-lg font-semibold text-secondary-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        @click="addToCart"
                        :disabled="addedToCart"
                        :class="[
                          'flex-1 h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                          addedToCart
                            ? 'bg-green-600 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/30',
                        ]"
                      >
                        <ShoppingCart class="w-4 h-4" />
                        {{ addedToCart ? "✓ เพิ่มแล้ว!" : "เพิ่มลงตะกร้า" }}
                      </button>
                      <button
                        @click="
                          inWishlist
                            ? wishlistStore.toggle(product.id)
                            : wishlistStore.toggle(product.id)
                        "
                        :class="[
                          'w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all',
                          inWishlist
                            ? 'bg-red-50 border-red-300 text-red-500'
                            : 'bg-white border-secondary-200 text-secondary-400 hover:text-red-400 hover:border-red-200',
                        ]"
                      >
                        <Heart
                          :class="['w-4 h-4', inWishlist && 'fill-red-500']"
                        />
                      </button>
                    </div>
                    <p
                      v-else
                      class="text-sm text-secondary-400 text-center py-1"
                    >
                      สินค้าหมดชั่วคราว
                    </p>
                  </div>

                  <div class="space-y-2">
                    <div
                      class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                    >
                      <Pill
                        class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p
                          class="text-xs text-secondary-500 mb-0.5 font-medium"
                        >
                          วิธีใช้
                        </p>
                        <p class="text-secondary-800 text-sm leading-relaxed">
                          {{ product.using || "-" }}
                        </p>
                      </div>
                    </div>

                    <div
                      class="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl"
                    >
                      <AlertTriangle
                        class="w-4 h-4 text-yellow-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p class="text-xs text-yellow-600 mb-0.5 font-semibold">
                          คำเตือน
                        </p>
                        <p class="text-yellow-800 text-sm leading-relaxed">
                          {{ product.warning || "-" }}
                        </p>
                      </div>
                    </div>

                    <div
                      class="flex items-start gap-3 p-3 bg-secondary-50 rounded-xl"
                    >
                      <Tag class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                      <div>
                        <p class="text-xs text-secondary-500 mb-1 font-medium">
                          หมวดหมู่
                        </p>
                        <div
                          v-if="product.categories?.length"
                          class="flex flex-wrap gap-1"
                        >
                          <span
                            v-for="cat in product.categories"
                            :key="cat.category_id"
                            class="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full"
                          >
                            {{ cat.category.name }}
                          </span>
                        </div>
                        <p v-else class="text-secondary-400 text-sm">-</p>
                      </div>
                    </div>
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
