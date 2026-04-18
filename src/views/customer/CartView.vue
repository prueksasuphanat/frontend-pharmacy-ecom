<script setup lang="ts">
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import { useCartStore } from "@/stores/cart.store";
import { RouterLink } from "vue-router";
import {
  Trash2,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  ArrowRight,
} from "lucide-vue-next";

const cart = useCartStore();
function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="page-title mb-6">ตะกร้าสินค้า</h1>

      <div v-if="cart.items.length === 0" class="text-center py-20">
        <ShoppingBag class="w-16 h-16 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400 text-lg font-medium mb-2">
          ตะกร้าว่างเปล่า
        </p>
        <p class="text-secondary-400 text-sm mb-6">
          เพิ่มสินค้าที่คุณต้องการเพื่อดำเนินการสั่งซื้อ
        </p>
        <RouterLink to="/products" class="btn-primary">เลือกสินค้า</RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cart items -->
        <div class="lg:col-span-2 space-y-3">
          <div
            v-for="item in cart.items"
            :key="item.product_id"
            class="card flex gap-4 items-start"
          >
            <img
              :src="item.product_image"
              :alt="item.product_name"
              class="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-secondary-900 leading-snug">
                {{ item.product_name }}
              </p>
              <p class="text-xs text-secondary-400 mt-0.5">
                {{ item.sku }} · {{ item.unit }}
              </p>
              <p
                class="text-warning text-xs mt-1 font-medium"
                v-if="item.requires_prescription"
              >
                ⚠️ ต้องใช้ใบสั่งแพทย์
              </p>
              <div class="flex items-center justify-between mt-3">
                <!-- Qty control -->
                <div
                  class="flex items-center border border-secondary-200 rounded-lg overflow-hidden"
                >
                  <button
                    @click="cart.updateQty(item.product_id, item.quantity - 1)"
                    class="w-8 h-8 flex items-center justify-center hover:bg-secondary-50 text-secondary-600"
                  >
                    <Minus class="w-3 h-3" />
                  </button>
                  <span class="w-10 text-center text-sm font-medium">{{
                    item.quantity
                  }}</span>
                  <button
                    @click="cart.updateQty(item.product_id, item.quantity + 1)"
                    :disabled="item.quantity >= item.stock"
                    class="w-8 h-8 flex items-center justify-center hover:bg-secondary-50 text-secondary-600 disabled:opacity-30"
                  >
                    <Plus class="w-3 h-3" />
                  </button>
                </div>
                <p class="font-bold text-primary-700">
                  ฿{{ fmt(item.unit_price * item.quantity) }}
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
              <button
                @click="cart.moveToWishlist(item.product_id)"
                class="p-1.5 rounded-lg text-secondary-300 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                title="ย้ายไป Wishlist"
              >
                <Heart class="w-4 h-4" />
              </button>
              <button
                @click="cart.removeItem(item.product_id)"
                class="p-1.5 rounded-lg text-secondary-300 hover:text-danger hover:bg-red-50 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="space-y-4">
          <div class="card">
            <h3 class="font-bold text-secondary-900 mb-4">สรุปคำสั่งซื้อ</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-secondary-600">
                <span>ยอดรวม ({{ cart.totalItems }} รายการ)</span>
                <span>฿{{ fmt(cart.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-secondary-600">
                <span>ค่าจัดส่ง</span>
                <span
                  v-if="cart.shippingFee === 0"
                  class="text-success font-medium"
                  >ฟรี</span
                >
                <span v-else>฿{{ fmt(cart.shippingFee) }}</span>
              </div>
              <div
                class="border-t pt-2 mt-2 flex justify-between font-bold text-base text-secondary-900"
              >
                <span>ยอดรวมทั้งหมด</span>
                <span class="text-primary-700">฿{{ fmt(cart.total) }}</span>
              </div>
            </div>

            <div
              v-if="cart.shippingFee > 0"
              class="mt-3 p-3 bg-primary-50 rounded-lg"
            >
              <p class="text-xs text-primary-700">
                🚚 สั่งอีก ฿{{ fmt(1000 - cart.subtotal) }} รับสิทธิ์จัดส่งฟรี
              </p>
            </div>

            <RouterLink
              to="/checkout"
              class="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              ดำเนินการชำระเงิน <ArrowRight class="w-4 h-4" />
            </RouterLink>
            <RouterLink
              to="/products"
              class="btn-secondary w-full mt-2 text-center text-sm"
              >เลือกสินค้าเพิ่ม</RouterLink
            >
          </div>

          <div
            v-if="cart.hasPrescriptionItem"
            class="card bg-yellow-50 border border-yellow-200"
          >
            <p class="text-xs text-yellow-800">
              ⚠️ มีสินค้าที่ต้องใช้ใบสั่งแพทย์ กรณาเตรียมไว้ก่อนชำระเงิน
            </p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
