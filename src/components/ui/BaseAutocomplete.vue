<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { onClickOutside } from "@vueuse/core";
import { ChevronDown, X } from "lucide-vue-next";

export interface AutocompleteOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | null;
  options: AutocompleteOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  icon?: any;
  noResultText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  clearable: false,
  noResultText: "ไม่พบข้อมูล",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  change: [value: string | number | null];
  search: [query: string];
}>();

const containerRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const query = ref("");
const activeIndex = ref(-1);

// Sync display text when modelValue changes externally
const selectedLabel = computed(() => {
  if (
    props.modelValue === null ||
    props.modelValue === undefined ||
    props.modelValue === ""
  )
    return "";
  return (
    props.options.find((o) => o.value === props.modelValue)?.label ??
    String(props.modelValue)
  );
});

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) query.value = selectedLabel.value;
  },
  { immediate: true },
);

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

onClickOutside(containerRef, () => close());

function open() {
  if (props.disabled) return;
  isOpen.value = true;
  query.value = "";
  activeIndex.value = -1;
  nextTick(() => inputRef.value?.focus());
}

function close() {
  isOpen.value = false;
  query.value = selectedLabel.value;
  activeIndex.value = -1;
}

function select(option: AutocompleteOption) {
  if (option.disabled) return;
  emit("update:modelValue", option.value);
  emit("change", option.value);
  close();
}

function clear(e: MouseEvent) {
  e.stopPropagation();
  emit("update:modelValue", null);
  emit("change", null);
  query.value = "";
}

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  emit("search", query.value);
  activeIndex.value = -1;
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === "ArrowDown" || e.key === "Enter") open();
    return;
  }
  const len = filteredOptions.value.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % len;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + len) % len;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex.value >= 0 && filteredOptions.value[activeIndex.value]) {
      select(filteredOptions.value[activeIndex.value]);
    }
  } else if (e.key === "Escape") {
    close();
  }
}
</script>

<template>
  <div ref="containerRef" class="w-full relative">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      class="input flex items-center gap-2 cursor-pointer"
      :class="{
        'pl-9': icon,
        'border-red-300 focus-within:border-red-500 focus-within:ring-red-500':
          error,
        'opacity-50 cursor-not-allowed': disabled,
      }"
      @click="open"
    >
      <component
        v-if="icon"
        :is="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none"
      />

      <input
        v-if="isOpen"
        ref="inputRef"
        :value="query"
        class="flex-1 outline-none bg-transparent text-sm min-w-0"
        :placeholder="placeholder"
        @input="onInput"
        @keydown="onKeydown"
      />
      <span
        v-else
        class="flex-1 text-sm truncate"
        :class="
          modelValue !== null && modelValue !== undefined && modelValue !== ''
            ? 'text-secondary-900'
            : 'text-secondary-400'
        "
      >
        {{ selectedLabel || placeholder }}
      </span>

      <!-- Right icons -->
      <div class="flex items-center gap-1 shrink-0 ml-auto">
        <button
          v-if="
            clearable &&
            modelValue !== null &&
            modelValue !== undefined &&
            modelValue !== ''
          "
          type="button"
          @click="clear"
          class="text-secondary-400 hover:text-secondary-600"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          class="text-secondary-400 hover:text-secondary-600"
          @click.stop="isOpen ? close() : open()"
        >
          <ChevronDown
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Dropdown -->
    <Transition name="slide-up">
      <ul
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white border border-secondary-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1"
      >
        <li
          v-if="filteredOptions.length === 0"
          class="px-4 py-2.5 text-sm text-secondary-400"
        >
          {{ noResultText }}
        </li>
        <li
          v-for="(option, i) in filteredOptions"
          :key="option.value"
          class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
          :class="{
            'bg-primary-50 text-primary-700': option.value === modelValue,
            'bg-secondary-50': i === activeIndex && option.value !== modelValue,
            'text-secondary-400 cursor-not-allowed': option.disabled,
            'hover:bg-secondary-50 text-secondary-700':
              !option.disabled && option.value !== modelValue,
          }"
          @click="select(option)"
          @mouseenter="activeIndex = i"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>

    <p v-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
