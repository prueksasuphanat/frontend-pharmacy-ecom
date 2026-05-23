<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useToast } from "vue-toastification";
import { useWishlistStore } from "@/stores/customer/wishlist.store";
import { Heart, ShoppingCart, X, Loader2, ShoppingBag } from "lucide-vue-next";
import { formatPrice } from "@/utils/format";

const wishlist = useWishlistStore();
const toast = useToast();

async function handleMoveToCart(productId: number, unitId: number) {
  try {
    await wishlist.moveToCart(productId, unitId);
    toast.success("ย้ายสินค้าไปที่ตะกร้าสำเร็จ");
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "ไม่สามารถย้ายสินค้าไปที่ตะกร้าได้",
    );
  }
}

onMounted(() => {
  wishlist.fetchWishlist();
});
</script>

<template>
  <div>
    <div class="page-header mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-lg font-bold text-secondary-900">รายการที่ถูกใจ</h2>
        <p class="text-sm text-secondary-500 mt-0.5">
          บันทึกสินค้าที่สนใจไว้เลือกซื้อภายหลัง
        </p>
      </div>
      <span v-if="wishlist.items.length > 0" class="badge badge-teal shrink-0">
        {{ wishlist.items.length }} รายการ
      </span>
    </div>

    <div v-if="wishlist.isLoading" class="card flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <div v-else-if="wishlist.items.length === 0" class="card text-center py-16">
      <div
        class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <Heart class="w-8 h-8 text-red-300" />
      </div>
      <p class="text-secondary-600 font-medium mb-1">ยังไม่มีรายการที่ถูกใจ</p>
      <p class="text-sm text-secondary-400 mb-6">
        กดไอคอน ♡ ที่สินค้าเพื่อเพิ่มในรายการนี้
      </p>
      <RouterLink to="/products" class="btn-primary text-sm gap-2">
        <ShoppingBag class="w-4 h-4" /> เลือกซื้อสินค้า
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="item in wishlist.items"
        :key="item.id"
        class="card flex flex-col gap-3 relative"
      >
        <button
          @click="wishlist.toggle(item.product_id)"
          class="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-secondary-400 hover:text-danger transition-colors shadow-sm z-10"
          title="ลบออกจากรายการที่ถูกใจ"
        >
          <X class="w-4 h-4" />
        </button>

        <div
          class="w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-teal-50 flex items-center justify-center"
        >
          <img
            v-if="item.product.image_url"
            :src="item.product.image_url"
            :alt="item.product.name"
            class="w-full h-full object-contain"
          />
          <span
            v-else
            class="text-xs text-primary-400 font-medium text-center p-2 leading-snug"
          >
            {{ item.product.name }}
          </span>
        </div>

        <div class="flex-1">
          <p
            class="font-semibold text-secondary-900 text-sm leading-snug line-clamp-2"
          >
            {{ item.product.name }}
          </p>
          <p class="text-xs text-secondary-400 mt-0.5">
            {{ item.product.code }}
          </p>

          <p
            v-if="item.product.units.length > 0"
            class="text-primary-700 font-bold mt-1.5"
          >
            ฿{{ formatPrice(item.product.units[0].price) }}
            <span class="text-xs font-normal text-secondary-400"
              >/ {{ item.product.units[0].unit.name }}</span
            >
          </p>

          <span
            v-if="item.product.quantity === 0"
            class="badge badge-red text-xs mt-1 inline-block"
            >สินค้าหมด</span
          >
        </div>

        <button
          @click="handleMoveToCart(item.product_id, item.product.units[0]?.id)"
          :disabled="item.product.quantity === 0 || !item.product.units.length"
          class="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
        >
          <ShoppingCart class="w-4 h-4" />
          {{ item.product.quantity === 0 ? "สินค้าหมด" : "ย้ายไปตะกร้า" }}
        </button>
      </div>
    </div>
  </div>
</template>
