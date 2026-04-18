<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: any; // Lucide icon component
  iconRight?: any; // Icon on the right side
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  required: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  iconRightClick: [];
}>();

const inputClasses = computed(() => [
  "input",
  {
    "pl-9": props.icon,
    "pr-10": props.iconRight,
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
      <component
        v-if="icon"
        :is="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
      />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <button
        v-if="iconRight"
        type="button"
        @click="emit('iconRightClick')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
      >
        <component :is="iconRight" class="w-4 h-4" />
      </button>
    </div>
    <p v-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
