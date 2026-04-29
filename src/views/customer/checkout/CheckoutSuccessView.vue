<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import { CheckCircle, Package, ArrowRight } from 'lucide-vue-next'

const orderId = 'ORD-2026-' + String(Math.floor(Math.random() * 99999)).padStart(5, '0')
</script>

<template>
  <div>
    <Navbar />
    <div class="max-w-lg mx-auto px-4 py-16 text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle class="w-10 h-10 text-success" />
      </div>
      <h1 class="text-3xl font-bold text-secondary-900 mb-2">สั่งซื้อสำเร็จ! 🎉</h1>
      <p class="text-secondary-500 mb-3">ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งโดยเร็วที่สุด</p>
      <div class="bg-primary-50 border border-primary-100 rounded-2xl px-6 py-4 mb-8 inline-block">
        <p class="text-xs text-secondary-400">หมายเลขคำสั่งซื้อ</p>
        <p class="text-xl font-bold text-primary-700 font-mono">{{ orderId }}</p>
      </div>
      <div class="space-y-3">
        <RouterLink :to="`/orders/${orderId}`" class="btn-primary w-full flex items-center justify-center gap-2">
          <Package class="w-4 h-4" /> ดูสถานะคำสั่งซื้อ
        </RouterLink>
        <RouterLink to="/products" class="btn-secondary w-full text-center">
          เลือกสินค้าเพิ่มเติม
        </RouterLink>
      </div>
    </div>
  </div>
</template>
