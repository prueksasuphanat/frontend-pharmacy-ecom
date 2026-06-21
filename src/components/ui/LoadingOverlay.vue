<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

interface Props {
  loading?: boolean;
  text?: string;
  blur?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  text: "กำลังโหลด...",
  blur: true,
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="loading"
      :class="[
        'absolute inset-0 z-10 bg-white/60 rounded-xl flex items-center justify-center',
        { 'backdrop-blur-[1px]': blur },
      ]"
    >
      <div
        class="flex items-center gap-2 bg-white shadow-md rounded-lg px-4 py-2.5"
      >
        <Loader2 class="w-4 h-4 text-teal-600 animate-spin" />
        <span class="text-sm text-secondary-600">{{ text }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
