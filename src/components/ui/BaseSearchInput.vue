<script setup lang="ts">
import { computed } from "vue";
import { Search, X } from "lucide-vue-next";

defineOptions({
  inheritAttrs: false,
});

interface Props {
  modelValue?: string | null;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "ค้นหา...",
  disabled: false,
  clearable: true,
  size: "md",
  inputClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  input: [value: string];
  submit: [value: string];
  clear: [];
}>();

const currentValue = computed({
  get: () => props.modelValue ?? "",
  set: (val: string) => {
    emit("update:modelValue", val);
  },
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "py-1 text-xs pl-8 pr-7";
    case "lg":
      return "py-2.5 text-base pl-10 pr-9";
    case "md":
    default:
      return "py-1.5 text-sm pl-9 pr-8";
  }
});

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-3.5 h-3.5 left-2.5";
    case "lg":
      return "w-5 h-5 left-3.5";
    case "md":
    default:
      return "w-4 h-4 left-3";
  }
});

const clearBtnSizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "right-2";
    case "lg":
      return "right-3";
    case "md":
    default:
      return "right-2.5";
  }
});

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  emit("update:modelValue", val);
  emit("input", val);
}

function handleSubmit() {
  emit("submit", currentValue.value);
}

function handleClear() {
  emit("update:modelValue", "");
  emit("input", "");
  emit("clear");
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="relative w-full">
    <input
      v-bind="$attrs"
      :value="currentValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      aria-label="ค้นหาสินค้า"
      :class="[
        'w-full bg-secondary-50 border border-secondary-200 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition-colors duration-150',
        sizeClasses,
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        inputClass,
      ]"
      @input="handleInput"
    />
    <Search
      :class="[
        'text-secondary-400 absolute top-1/2 -translate-y-1/2 pointer-events-none',
        iconSizeClasses,
      ]"
    />
    <button
      v-if="clearable && currentValue"
      type="button"
      @click="handleClear"
      :class="[
        'absolute top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 p-0.5 rounded-full hover:bg-secondary-100 transition-colors',
        clearBtnSizeClasses,
      ]"
      title="ล้างคำค้นหา"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </form>
</template>
