<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Users, DollarSign, ChevronRight } from "lucide-vue-next";

const settingsMenuItems = [
  {
    to: "/admin/settings/users",
    label: "ผู้ใช้งาน",
    description: "จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    to: "/admin/settings/product-price",
    label: "ราคาสินค้า",
    description: "กำหนดราคาสินค้าตาม Role และส่วนลด",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
  },
];
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">ตั้งค่าระบบ</h1>
      <p class="text-sm text-secondary-500 mt-1">
        จัดการการตั้งค่าต่างๆ ของระบบ
      </p>
    </div>

    <!-- Settings Menu Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in settingsMenuItems"
        :key="item.to"
        :to="item.to"
        class="card hover:shadow-md transition-shadow group"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              item.color,
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h3 class="font-semibold text-secondary-900">
                {{ item.label }}
              </h3>
              <ChevronRight
                class="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors shrink-0"
              />
            </div>
            <p class="text-sm text-secondary-500">
              {{ item.description }}
            </p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
