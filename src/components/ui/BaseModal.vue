<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{ title?: string; size?: "sm" | "md" | "lg" }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="$emit('close')"
      />
      <div
        :class="[
          'relative bg-white w-full flex flex-col',
          'rounded-t-2xl sm:rounded-2xl shadow-2xl',
          'max-h-[92dvh] sm:max-h-[90vh]',
          size === 'lg'
            ? 'sm:max-w-2xl'
            : size === 'sm'
              ? 'sm:max-w-sm'
              : 'sm:max-w-lg',
        ]"
      >
        <!-- Header -->
        <div
          v-if="title"
          class="flex items-center justify-between px-6 py-4 border-b border-secondary-100 shrink-0"
        >
          <h3 class="font-bold text-lg text-secondary-900">{{ title }}</h3>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <X class="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div class="px-6 py-5 overflow-y-auto flex-1 min-h-0">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="px-6 py-4 border-t border-secondary-100 flex gap-3 shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
