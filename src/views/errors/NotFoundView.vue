<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { PackageSearch } from 'lucide-vue-next'
</script>
<template>
  <div class="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <PackageSearch class="w-10 h-10 text-secondary-400" />
      </div>
      <h1 class="text-4xl font-bold text-secondary-900 mb-2">404</h1>
      <p class="text-secondary-500 mb-6">ไม่พบหน้าที่คุณค้นหา</p>
      <RouterLink to="/products" class="btn-primary">กลับหน้าหลัก</RouterLink>
    </div>
  </div>
</template>
