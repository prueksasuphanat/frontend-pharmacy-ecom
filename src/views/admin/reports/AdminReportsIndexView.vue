<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Tag, ChevronRight } from "lucide-vue-next";

const reportMenuItems = [
  {
    to: "/admin/reports/user-pricing",
    label: "รายงานการตั้งราคา",
    description: "ตรวจสอบและติดตามรายการราคาสินค้าสำหรับผู้ใช้งานแต่ละราย",
    icon: Tag,
    color: "bg-teal-100 text-teal-600",
  },
];
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="page-title">รายงาน</h1>
      <p class="text-sm text-secondary-500 mt-1">
        ติดตามและตรวจสอบรายงานสรุปต่างๆ ของระบบ
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in reportMenuItems"
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
