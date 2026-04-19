<script setup lang="ts">
import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";

const router = useRouter();
</script>

<template>
  <div>
    <!-- Back Button (Mobile) -->
    <button
      @click="router.push('/admin/settings')"
      class="lg:hidden flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-4 -ml-2"
    >
      <ChevronLeft class="w-5 h-5" />
      <span class="text-sm font-medium">กลับไปตั้งค่าระบบ</span>
    </button>

    <div class="mb-6">
      <h1 class="page-title">ราคาสินค้า</h1>
      <p class="text-sm text-secondary-500 mt-1">
        กำหนดราคาสินค้าตาม Role และส่วนลด
      </p>
    </div>

    <!-- TODO: Add content here -->
    <div class="card">
      <div class="text-center py-12">
        <p class="text-secondary-400">กำลังพัฒนา...</p>
      </div>
    </div>
  </div>
</template>
