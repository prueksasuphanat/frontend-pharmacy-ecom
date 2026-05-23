<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxlength?: number;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  readonly: false,
  rows: 4,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const textareaClasses = computed(() => [
  "input resize-none",
  {
    "border-red-300 focus:border-red-500 focus:ring-red-500": props.error,
  },
]);

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :readonly="readonly"
      :rows="rows"
      :maxlength="maxlength"
      :class="textareaClasses"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <div v-if="maxlength" class="flex justify-between items-center mt-1">
      <p v-if="error" class="error-msg">{{ error }}</p>
      <p class="text-xs text-secondary-400 ml-auto">
        {{ modelValue?.length || 0 }}/{{ maxlength }}
      </p>
    </div>
    <p v-else-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
