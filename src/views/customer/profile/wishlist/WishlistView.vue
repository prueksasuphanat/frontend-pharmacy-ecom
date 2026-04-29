<script setup lang="ts">
import { ref, computed } from "vue";
import { MOCK_PRODUCTS, MOCK_PRICES } from "@/__mocks__/products";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/customer/cart.store";
import { RouterLink } from "vue-router";
import { ShoppingCart, Trash2, Search, Heart } from "lucide-vue-next";

const auth = useAuthStore();
const cart = useCartStore();

// TODO: GET /api/v1/wishlist
const wishlist = ref(MOCK_PRODUCTS.slice(0, 6));
const searchQuery = ref("");

const filtered = computed(() => {
  if (!searchQuery.value) return wishlist.value;
  const q = searchQuery.value.toLowerCase();
  return wishlist.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.generic_name.toLowerCase().includes(q),
  );
});

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function getPrice(productId: string) {
  const prices = MOCK_PRICES[productId];
  const role = (auth as any).roleName as
    | "retail"
    | "wholesale"
    | "clinic"
    | undefined;
  return prices?.[role ?? "retail"] ?? 0;
}

function remove(id: string) {
  // TODO: DELETE /api/v1/wishlist/:productId
  wishlist.value = wishlist.value.filter((p) => p.id !== id);
}

function addToCart(productId: string) {
  cart.addToCart(productId);
}

function addAllToCart() {
  wishlist.value.forEach((p) => cart.addToCart(p.id));
}
</script>

<template>
  <div class="card">
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
    >
      <div>
        <h2 class="text-lg font-bold text-secondary-900">
          สินค้าที่บันทึกไว้
          <Heart class="inline w-4 h-4 text-red-500 fill-red-500 ml-1" />
        </h2>
        <p class="text-sm text-secondary-500 mt-0.5">
          {{ wishlist.length }} รายการ
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-initial">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาสินค้า..."
            class="input pl-9 text-sm w-full sm:w-48"
          />
        </div>
        <button
          v-if="wishlist.length > 0"
          @click="addAllToCart"
          class="btn-outline text-xs whitespace-nowrap gap-1"
        >
          <ShoppingCart class="w-3.5 h-3.5" /> เพิ่มทั้งหมด
        </button>
      </div>
    </div>

    <div v-if="wishlist.length === 0" class="text-center py-16">
      <div
        class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <Heart class="w-8 h-8 text-red-300" />
      </div>
      <p class="text-secondary-600 font-medium mb-1">
        ยังไม่มีสินค้าที่บันทึกไว้
      </p>
      <p class="text-sm text-secondary-400 mb-4">
        กดไอคอนหัวใจเพื่อบันทึกสินค้าที่สนใจ
      </p>
      <RouterLink to="/products" class="btn-primary text-sm"
        >เลือกซื้อสินค้า</RouterLink
      >
    </div>

    <div v-else-if="filtered.length === 0" class="text-center py-12">
      <Search class="w-10 h-10 text-secondary-300 mx-auto mb-3" />
      <p class="text-secondary-500 text-sm">
        ไม่พบสินค้าที่ตรงกับ "{{ searchQuery }}"
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="group rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-sm overflow-hidden transition-all"
      >
        <div class="relative">
          <RouterLink :to="`/products/${p.id}`">
            <img
              :src="p.image_url"
              :alt="p.name"
              class="w-full h-40 object-cover"
            />
          </RouterLink>
          <button
            @click="remove(p.id)"
            class="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-secondary-400 hover:text-red-500 transition-colors"
            title="ลบออกจากรายการ"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
          <span
            v-if="p.drug_type !== 'otc'"
            :class="[
              'absolute top-2 left-2 badge text-xs',
              p.drug_type === 'prescription'
                ? 'badge-yellow'
                : p.drug_type === 'controlled'
                  ? 'badge-red'
                  : p.drug_type === 'supplement'
                    ? 'badge-green'
                    : 'badge-purple',
            ]"
          >
            {{ p.drug_type_label }}
          </span>
        </div>

        <div class="p-3.5">
          <RouterLink :to="`/products/${p.id}`">
            <p
              class="text-sm font-medium text-secondary-900 line-clamp-2 hover:text-primary-700 transition-colors mb-1"
            >
              {{ p.name }}
            </p>
          </RouterLink>
          <p class="text-xs text-secondary-400 mb-2">{{ p.generic_name }}</p>
          <div class="flex items-center justify-between gap-2">
            <p class="text-primary-700 font-bold">฿{{ fmt(getPrice(p.id)) }}</p>
            <span
              :class="[
                'text-xs',
                p.stock > 0 ? 'text-green-600' : 'text-red-500',
              ]"
            >
              {{ p.stock > 0 ? "มีสินค้า" : "สินค้าหมด" }}
            </span>
          </div>
          <button
            @click="addToCart(p.id)"
            :disabled="p.stock === 0"
            class="btn-primary w-full text-xs py-2 mt-3 gap-1.5"
          >
            <ShoppingCart class="w-3.5 h-3.5" />
            {{ p.stock > 0 ? "ใส่ตะกร้า" : "สินค้าหมด" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
