<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ title?: string; size?: 'sm' | 'md' | 'lg' }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div :class="[
        'relative bg-white rounded-2xl shadow-2xl w-full',
        size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'
      ]">
        <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
          <h3 class="font-bold text-lg text-secondary-900">{{ title }}</h3>
          <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-secondary-50 transition-colors">
            <X class="w-5 h-5 text-secondary-400" />
          </button>
        </div>
        <div class="px-6 py-5">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-secondary-50 flex justify-end gap-3">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
