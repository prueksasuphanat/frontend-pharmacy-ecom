<script setup lang="ts">
import { Heart, ShoppingBag } from "lucide-vue-next";
import { RouterLink } from "vue-router";
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h2 class="text-lg font-bold text-secondary-900">รายการที่ถูกใจ</h2>
      <p class="text-sm text-secondary-500 mt-0.5">
        บันทึกสินค้าที่สนใจไว้เลือกซื้อภายหลัง
      </p>
    </div>

    <!-- Coming soon / Empty state -->
    <div class="card text-center py-16">
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
  </div>
</template>
