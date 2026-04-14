<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  LayoutDashboard, ShoppingBag, Package, BarChart2,
  Settings, ClipboardList, Bell
} from 'lucide-vue-next'

const route = useRoute()

const links = [
  { to: '/admin/dashboard', label: 'แดชบอร์ด',     icon: LayoutDashboard },
  { to: '/admin/orders',    label: 'คำสั่งซื้อ',    icon: ShoppingBag     },
  { to: '/admin/inventory', label: 'คลังสินค้า',    icon: Package         },
  { to: '/admin/logs',      label: 'บันทึกกิจกรรม', icon: BarChart2       },
  { to: '/admin/settings',  label: 'ตั้งค่าระบบ',   icon: Settings        },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <aside class="w-60 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-secondary-100">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-5 h-16 border-b border-secondary-100">
      <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">Rx</span>
      </div>
      <div>
        <p class="font-bold text-sm text-secondary-900">ฟาร์มาช็อป</p>
        <p class="text-xs text-secondary-400">Admin Panel</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="['sidebar-link', { 'active': isActive(link.to) }]"
      >
        <component :is="link.icon" class="w-4.5 h-4.5 shrink-0" />
        {{ link.label }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-4 border-t border-secondary-100">
      <RouterLink to="/products" class="sidebar-link text-xs text-secondary-400">
        ← กลับหน้าร้าน
      </RouterLink>
    </div>
  </aside>
</template>
