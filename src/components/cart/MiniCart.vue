<script setup lang="ts">
import { ref, watch } from "vue";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { useCartStore } from "@/stores/customer/cart.store";

const cart = useCartStore();
const isOpen = ref(false);

function formatPrice(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
</script>

<template>
  <!-- Trigger button -->
  <button
    @click="isOpen = !isOpen"
    class="relative p-2 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
  >
    <ShoppingCart class="w-5 h-5" />
    <span
      v-if="cart.totalItems > 0"
      class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
    >
      {{ cart.totalItems > 9 ? "9+" : cart.totalItems }}
    </span>
  </button>

  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/30 z-40"
      @click="isOpen = false"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="slide-cart">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="font-bold text-lg flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-primary-600" />
          ตะกร้าสินค้า
          <span class="badge badge-teal">{{ cart.totalItems }}</span>
        </h2>
        <button
          @click="isOpen = false"
          class="p-2 rounded-lg hover:bg-secondary-50"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Items -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div v-if="cart.items.length === 0" class="text-center py-12">
          <ShoppingBag class="w-14 h-14 text-secondary-200 mx-auto mb-3" />
          <p class="text-secondary-400 text-sm">ตะกร้าว่างเปล่า</p>
          <RouterLink
            to="/products"
            @click="isOpen = false"
            class="btn-primary mt-4 text-sm"
          >
            ดูสินค้า
          </RouterLink>
        </div>

        <div
          v-for="item in cart.items"
          :key="item.product_id"
          class="flex gap-3 p-3 bg-secondary-50 rounded-xl"
        >
          <img
            :src="item.product_image"
            :alt="item.product_name"
            class="w-14 h-14 rounded-lg object-cover shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-secondary-800 line-clamp-2 leading-snug"
            >
              {{ item.product_name }}
            </p>
            <p class="text-xs text-secondary-400 mt-0.5">{{ item.unit }}</p>
            <p class="text-primary-600 font-semibold text-sm mt-1">
              ฿{{ formatPrice(item.unit_price) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <button
              @click="cart.removeItem(item.product_id)"
              class="p-1 text-secondary-300 hover:text-danger transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
            <div
              class="flex items-center gap-1.5 border border-secondary-200 rounded-lg"
            >
              <button
                @click="cart.updateQty(item.product_id, item.quantity - 1)"
                class="w-6 h-6 flex items-center justify-center hover:bg-secondary-50 rounded-md transition-colors"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="text-sm font-medium w-6 text-center">{{
                item.quantity
              }}</span>
              <button
                @click="cart.updateQty(item.product_id, item.quantity + 1)"
                :disabled="item.quantity >= item.stock"
                class="w-6 h-6 flex items-center justify-center hover:bg-secondary-50 rounded-md transition-colors disabled:opacity-30"
              >
                <Plus class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cart.items.length > 0" class="border-t px-5 py-4 space-y-3">
        <div class="space-y-1.5 text-sm">
          <div class="flex justify-between text-secondary-600">
            <span>ยอดรวม</span><span>฿{{ formatPrice(cart.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-secondary-600">
            <span>ค่าจัดส่ง</span>
            <span v-if="cart.shippingFee === 0" class="text-success font-medium"
              >ฟรี</span
            >
            <span v-else>฿{{ formatPrice(cart.shippingFee) }}</span>
          </div>
          <div
            class="flex justify-between font-bold text-secondary-900 text-base border-t pt-1.5"
          >
            <span>ยอดรวมทั้งหมด</span
            ><span class="text-primary-600"
              >฿{{ formatPrice(cart.total) }}</span
            >
          </div>
        </div>
        <p v-if="cart.shippingFee > 0" class="text-xs text-secondary-400">
          สั่งซื้อครบ ฿1,000 รับสิทธิ์จัดส่งฟรี
        </p>
        <RouterLink
          to="/checkout"
          @click="isOpen = false"
          class="btn-primary w-full text-center"
        >
          ดำเนินการชำระเงิน
        </RouterLink>
        <RouterLink
          to="/cart"
          @click="isOpen = false"
          class="btn-secondary w-full text-center text-sm"
        >
          ดูตะกร้าทั้งหมด
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-cart-enter-active,
.slide-cart-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-cart-enter-from,
.slide-cart-leave-to {
  transform: translateX(100%);
}
</style>
