<script setup lang="ts">
import { ref, computed } from "vue";
import { Calendar } from "lucide-vue-next";

interface Props {
  modelValue?: string; // ISO date string (YYYY-MM-DD)
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string; // ISO date string
  max?: string; // ISO date string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "เลือกวันที่",
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputClasses = computed(() => [
  "input pl-9 cursor-pointer",
  {
    "border-red-300 focus:border-red-500 focus:ring-red-500": props.error,
  },
]);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <Calendar
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none"
      />
      <input
        type="date"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :class="inputClasses"
        @input="handleInput"
      />
    </div>
    <p v-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
