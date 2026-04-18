<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
  emit("change", target.checked);
}
</script>

<template>
  <div class="w-full">
    <label class="flex items-start gap-3 cursor-pointer group">
      <div class="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          :required="required"
          @change="handleChange"
          class="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div class="flex-1">
        <div
          v-if="label"
          class="text-sm font-medium text-secondary-700 group-hover:text-secondary-900 transition-colors"
        >
          {{ label }}
          <span v-if="required" class="text-red-500 ml-0.5">*</span>
        </div>
        <div v-if="description" class="text-xs text-secondary-500 mt-0.5">
          {{ description }}
        </div>
        <slot />
      </div>
    </label>
    <p v-if="error" class="error-msg mt-1.5 ml-8">{{ error }}</p>
  </div>
</template>
