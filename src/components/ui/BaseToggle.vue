<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  activeColor?: "green" | "primary" | "blue";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: "md",
  activeColor: "green",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
  emit("change", !props.modelValue);
}

const trackClass = {
  green: "bg-green-500",
  primary: "bg-primary-600",
  blue: "bg-blue-500",
};

const sizeTrack = {
  sm: "w-8 h-4",
  md: "w-11 h-6",
};

const sizeThumb = {
  sm: "w-3 h-3",
  md: "w-5 h-5",
};

const thumbTranslate = {
  sm: "translate-x-4",
  md: "translate-x-5",
};
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
    :class="[
      'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none',
      sizeTrack[size],
      modelValue ? trackClass[activeColor] : 'bg-secondary-200',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
  >
    <span
      :class="[
        'inline-block rounded-full bg-white shadow transition-transform duration-200',
        sizeThumb[size],
        modelValue ? thumbTranslate[size] : 'translate-x-0.5',
      ]"
    />
  </button>
</template>
