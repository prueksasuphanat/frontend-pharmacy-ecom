<script setup lang="ts">
import type { DrugType } from '@/mocks/products'

const props = defineProps<{ type: DrugType }>()

const config: Record<DrugType, { label: string; class: string }> = {
  otc:          { label: 'OTC',   class: 'badge-green'  },
  prescription: { label: 'Rx',    class: 'badge-yellow' },
  controlled:   { label: 'ยาควบคุม', class: 'badge-red' },
  supplement:   { label: 'อาหารเสริม', class: 'badge-blue' },
  cosmetic:     { label: 'เวชสำอาง',   class: 'badge-purple' },
}
</script>

<template>
  <span :class="['badge', config[type].class]">{{ config[type].label }}</span>
</template>
