<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    title?: string;
    icon?: Component;
    size?: "sm" | "base";
    variant?: "default" | "gradient";
  }>(),
  { size: "sm", variant: "default" }
);
</script>

<template>
  <div
    :class="[
      'border rounded-3xl p-6 shadow-sm space-y-4',
      variant === 'gradient'
        ? 'bg-gradient-to-br from-white to-secondary-50 border-secondary-200 relative overflow-hidden'
        : 'bg-white border-secondary-100',
    ]"
  >
    <div v-if="variant === 'gradient'" class="absolute -right-6 -bottom-6 w-24 h-24 bg-teal-500/5 rounded-full pointer-events-none" />

    <h3
      :class="[
        'font-bold text-secondary-900 flex items-center border-b border-secondary-50',
        size === 'base' ? 'gap-2.5 text-base pb-3' : 'gap-2 text-sm pb-2',
      ]"
    >
      <template v-if="icon">
        <span v-if="size === 'base'" class="p-1.5 rounded-lg bg-teal-50 text-teal-600">
          <component :is="icon" class="w-4 h-4" />
        </span>
        <component v-else :is="icon" class="w-4 h-4 text-teal-600" />
      </template>
      <slot name="title">{{ title }}</slot>
    </h3>

    <slot />
  </div>
</template>
