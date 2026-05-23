<script setup lang="ts">
import type { ProductAttachment } from "@/types";

const props = defineProps<{
  attachments?: ProductAttachment[];
  name: string;
  imgClass?: string;
}>();

const imageUrl = props.attachments?.[0]?.url ?? null;
</script>

<template>
  <img v-if="imageUrl" :src="imageUrl" :alt="name" :class="imgClass" />

  <div
    v-else
    :class="imgClass"
    class="bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center p-4"
  >
    <span
      class="text-sm font-semibold text-primary-500 text-center leading-snug line-clamp-4 select-none"
    >
      {{ name }}
    </span>
  </div>
</template>
