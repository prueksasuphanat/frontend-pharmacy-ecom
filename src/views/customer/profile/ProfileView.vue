<script setup lang="ts">
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

const menuItems = [
  {
    to: "/profile/information",
    label: "ข้อมูลส่วนตัว",
    icon: User,
    desc: "แก้ไขชื่อ เบอร์โทร ที่อยู่",
  },
  {
    to: "/profile/orders",
    label: "คำสั่งซื้อของฉัน",
    icon: Package,
    desc: "ติดตามสถานะคำสั่งซื้อ",
  },
  {
    to: "/profile/address",
    label: "ที่อยู่จัดส่ง",
    icon: MapPin,
    desc: "จัดการที่อยู่สำหรับจัดส่ง",
  },
  {
    to: "/profile/security",
    label: "เปลี่ยนรหัสผ่าน",
    icon: Lock,
    desc: "อัปเดตรหัสผ่านของคุณ",
  },
  {
    to: "/profile/wishlist",
    label: "สินค้าที่บันทึกไว้",
    icon: Heart,
    desc: "รายการสินค้าที่สนใจ",
  },
];
</script>

<template>
  <div class="card space-y-1 p-2">
    <RouterLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary-50 transition-colors"
    >
      <div
        class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0"
      >
        <component :is="item.icon" class="w-4.5 h-4.5 text-primary-600" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-secondary-900">{{ item.label }}</p>
        <p class="text-xs text-secondary-400 mt-0.5">{{ item.desc }}</p>
      </div>
      <ChevronRight class="w-4 h-4 text-secondary-300 shrink-0" />
    </RouterLink>
  </div>
</template>
