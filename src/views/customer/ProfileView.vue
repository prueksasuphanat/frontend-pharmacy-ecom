<script setup lang="ts">
import { Navbar, Footer } from "@/components/layout";
import { useAuthStore } from "@/stores/auth.store";
import { RouterLink } from "vue-router";
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  ChevronRight,
} from "lucide-vue-next";
const auth = useAuthStore();
</script>
<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
      <h1 class="page-title mb-6">โปรไฟล์ของฉัน</h1>
      <div class="card mb-4 flex items-center gap-4">
        <div
          class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <User class="w-8 h-8 text-primary-600" />
        </div>
        <div class="flex-1">
          <p class="font-bold text-secondary-900">
            {{ auth.currentUser?.full_name || "ผู้ใช้งาน" }}
          </p>
          <p class="text-sm text-secondary-500">
            {{ auth.currentUser?.email }}
          </p>
          <span class="badge badge-teal mt-1">{{
            auth.currentUser?.role_label
          }}</span>
        </div>
      </div>
      <div class="card space-y-1 p-2">
        <RouterLink
          v-for="item in [
            { to: '/profile', label: 'แก้ไขข้อมูลส่วนตัว', icon: User },
            { to: '/orders', label: 'คำสั่งซื้อของฉัน', icon: Package },
            { to: '/profile/addresses', label: 'ที่อยู่จัดส่ง', icon: MapPin },
            { to: '/profile/security', label: 'เปลี่ยนรหัสผ่าน', icon: Lock },
            { to: '/wishlist', label: 'สินค้าที่บันทึกไว้', icon: Heart },
          ]"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary-50 transition-colors"
        >
          <component :is="item.icon" class="w-4.5 h-4.5 text-secondary-400" />
          <span class="text-sm text-secondary-700 flex-1">{{
            item.label
          }}</span>
          <ChevronRight class="w-4 h-4 text-secondary-300" />
        </RouterLink>
      </div>
      <p class="text-xs text-secondary-300 text-center mt-4">
        TODO: เชื่อม PATCH /profile
      </p>
    </div>

    <Footer />
  </div>
</template>
