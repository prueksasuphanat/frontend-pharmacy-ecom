<script setup lang="ts">
import { RouterLink } from "vue-router";
import { DollarSign, Users, ShoppingCart, ChevronRight } from "lucide-vue-next";

const logMenuItems = [
  {
    to: "/admin/logs/set-up-pricing",
    label: "บันทึกการตั้งราคา",
    description: "ติดตามการเปลี่ยนแปลงราคาสินค้าทั้งหมดในระบบ",
    icon: DollarSign,
    color: "bg-blue-100 text-blue-600",
  },
  {
    to: "/admin/logs/user",
    label: "บันทึกกิจกรรมผู้ใช้",
    description: "ดูประวัติการดำเนินการของผู้ดูแลระบบ",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    to: "/admin/logs/order",
    label: "บันทึกคำสั่งซื้อ",
    description: "ติดตามการเปลี่ยนแปลงสถานะคำสั่งซื้อ",
    icon: ShoppingCart,
    color: "bg-orange-100 text-orange-600",
  },
];
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">บันทึกกิจกรรม</h1>
      <p class="text-sm text-secondary-500 mt-1">
        ติดตามและตรวจสอบกิจกรรมต่างๆ ในระบบ
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in logMenuItems"
        :key="item.to"
        :to="item.to"
        class="card hover:shadow-md transition-shadow group"
      >
        <div class="flex items-start gap-4">
          <div
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              item.color,
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
          </div>

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
