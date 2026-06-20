<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

defineOptions({
  inheritAttrs: false,
});

interface Props {
  loading?: boolean;
  text?: string;
  fullPage?: boolean;
  inline?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: true,
  text: "กำลังโหลดข้อมูล...",
  fullPage: false,
  inline: false,
});
</script>

<template>
  <template v-if="loading">
    <!-- Inline loader (e.g. for buttons, small icons) -->
    <Loader2 
      v-if="inline" 
      v-bind="$attrs"
      class="animate-spin"
    />

    <!-- Full page loader overlay -->
    <div 
      v-else-if="fullPage" 
      v-bind="$attrs"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm space-y-4 animate-[fadeIn_0.2s_ease-out]"
    >
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 border-4 border-teal-200 rounded-full animate-ping"></div>
        <Loader2 class="w-10 h-10 text-teal-600 animate-spin relative z-10" />
      </div>
      <p class="text-sm font-semibold text-secondary-600 tracking-wide">{{ text }}</p>
    </div>

    <!-- Sectional/Block loader -->
    <div 
      v-else 
      v-bind="$attrs"
      class="flex flex-col items-center justify-center py-20 sm:py-32 space-y-4 w-full"
    >
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 border-4 border-teal-200 rounded-full animate-ping"></div>
        <Loader2 class="w-10 h-10 text-teal-600 animate-spin relative z-10" />
      </div>
      <p class="text-xs sm:text-sm font-medium text-secondary-500 tracking-wide">{{ text }}</p>
    </div>
  </template>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
