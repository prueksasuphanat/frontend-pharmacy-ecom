<script setup lang="ts">
import { Navbar, Footer } from "@/components/layout";
import { MOCK_PRODUCTS, MOCK_PRICES } from "@/__mocks__/products";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { RouterLink } from "vue-router";
import { Heart, ShoppingCart, Trash2 } from "lucide-vue-next";
import { ref } from "vue";

const auth = useAuthStore();
const cart = useCartStore();
// TODO: GET /wishlist
const wishlist = ref(MOCK_PRODUCTS.slice(0, 4));

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
function getPrice(productId: string) {
  const prices = MOCK_PRICES[productId];
  const role = auth.roleName as "retail" | "wholesale" | "clinic";
  return prices?.[role] ?? 0;
}
function remove(id: string) {
  // TODO: DELETE /wishlist/:productId
  wishlist.value = wishlist.value.filter((p) => p.id !== id);
}
</script>
<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <h1 class="page-title mb-6">
        รายการที่บันทึกไว้
        <Heart class="inline w-5 h-5 text-red-500 fill-red-500" />
      </h1>
      <div v-if="wishlist.length === 0" class="text-center py-20">
        <Heart class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ยังไม่มีสินค้าที่บันทึกไว้</p>
        <RouterLink to="/products" class="btn-primary mt-4"
          >เลือกสินค้า</RouterLink
        >
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="p in wishlist" :key="p.id" class="card p-0 overflow-hidden">
          <img
            :src="p.image_url"
            :alt="p.name"
            class="w-full h-36 object-cover"
          />
          <div class="p-3 space-y-2">
            <p class="text-sm font-medium text-secondary-900 line-clamp-2">
              {{ p.name }}
            </p>
            <p class="text-primary-700 font-bold text-sm">
              ฿{{ fmt(getPrice(p.id)) }}
            </p>
            <div class="flex gap-2">
              <button
                @click="cart.addToCart(p.id)"
                class="btn-primary flex-1 text-xs py-1.5 gap-1"
              >
                <ShoppingCart class="w-3 h-3" /> ใส่ตะกร้า
              </button>
              <button
                @click="remove(p.id)"
                class="p-1.5 rounded-lg border border-secondary-200 text-secondary-400 hover:text-danger hover:border-red-200 transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
