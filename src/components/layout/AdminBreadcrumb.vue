<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Home, ChevronRight } from 'lucide-vue-next'

const route = useRoute()

const labelMap: Record<string, string> = {
  dashboard: 'ภาพรวม',
  orders: 'คำสั่งซื้อ',
  logs: 'บันทึกกิจกรรม',
  'set-up-pricing': 'บันทึกราคา',
  'user-sessions': 'ประวัติเข้าใช้งาน',
  'product-views': 'การดูสินค้า',
  settings: 'ตั้งค่าระบบ',
  products: 'สินค้า',
  category: 'หมวดหมู่',
  units: 'หน่วยนับ',
  users: 'ผู้ใช้งาน',
  'product-price': 'ราคาสินค้า',
  vendor: 'ผู้จำหน่าย',
}

const crumbs = computed(() => {
  const segments = route.path.split('/').filter((s) => s && s !== 'admin')
  let path = '/admin'
  return segments.map((seg) => {
    path = `${path}/${seg}`
    const isId = /^\d+$/.test(seg)
    return {
      label: isId ? `#${seg}` : (labelMap[seg] ?? seg),
      to: path,
    }
  })
})
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm mb-6">
    <RouterLink
      to="/admin/dashboard"
      class="text-secondary-400 hover:text-secondary-600 transition-colors flex items-center"
    >
      <Home class="w-4 h-4" />
    </RouterLink>

    <template v-for="(crumb, i) in crumbs" :key="crumb.to">
      <ChevronRight class="w-3.5 h-3.5 text-secondary-300 shrink-0" />
      <span v-if="i === crumbs.length - 1" class="text-secondary-700 font-medium">
        {{ crumb.label }}
      </span>
      <RouterLink
        v-else
        :to="crumb.to"
        class="text-secondary-400 hover:text-secondary-600 transition-colors"
      >
        {{ crumb.label }}
      </RouterLink>
    </template>
  </nav>
</template>
