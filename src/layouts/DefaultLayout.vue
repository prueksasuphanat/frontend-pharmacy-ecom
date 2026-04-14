<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'

defineProps<{ showFooter?: boolean }>()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-secondary-50">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="mt-auto bg-white border-t border-secondary-100 py-8 px-4">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
            <span class="text-white font-bold text-xs">Rx</span>
          </div>
          <span class="text-sm text-secondary-500">© 2026 ฟาร์มาช็อป. สงวนลิขสิทธิ์.</span>
        </div>
        <p class="text-xs text-secondary-400">ระบบขายยาออนไลน์สำหรับมืออาชีพ</p>
      </div>
    </footer>
  </div>
</template>
