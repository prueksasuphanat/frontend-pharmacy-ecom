<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
import { ChevronDown, X } from "lucide-vue-next";

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: (string | number)[];
  options: MultiSelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: any;
  noResultText?: string;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
  required: false,
  noResultText: "ไม่พบข้อมูล",
});

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
  change: [value: (string | number)[]];
  search: [query: string];
}>();

const containerRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const query = ref("");
const activeIndex = ref(-1);

// Detect touch/mobile device — suppress keyboard on touch devices
const isTouchDevice =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });

function updateDropdownPosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();

  const vp = window.visualViewport;
  const viewportWidth = vp ? vp.width : window.innerWidth;
  const viewportHeight = vp ? vp.height : window.innerHeight;
  const vpOffsetTop = vp ? vp.offsetTop : 0;
  const vpOffsetLeft = vp ? vp.offsetLeft : 0;

  const left = Math.max(
    8,
    Math.min(rect.left - vpOffsetLeft, viewportWidth - rect.width - 8),
  );
  const width = Math.min(rect.width, viewportWidth - left - 8);

  const spaceBelow = viewportHeight - (rect.bottom - vpOffsetTop);
  const spaceAbove = rect.top - vpOffsetTop;
  const maxDropdownHeight = 240;

  let top: number;
  if (
    spaceBelow >= Math.min(maxDropdownHeight, 120) ||
    spaceBelow >= spaceAbove
  ) {
    top = rect.bottom + vpOffsetTop + 4;
  } else {
    top = rect.top + vpOffsetTop - Math.min(maxDropdownHeight, spaceAbove) - 4;
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left + vpOffsetLeft}px`,
    width: `${width}px`,
  };
}

const selectedOptions = computed(
  () =>
    (props.modelValue ?? [])
      .map((v) => props.options.find((o) => o.value === v))
      .filter(Boolean) as MultiSelectOption[],
);

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.options.filter((o) => !q || o.label.toLowerCase().includes(q));
});

const isMaxReached = computed(
  () => props.max !== undefined && (props.modelValue ?? []).length >= props.max,
);

// Close when clicking outside
useEventListener(document, "mousedown", (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as Node;
  if (containerRef.value?.contains(target)) return;
  if (dropdownRef.value?.contains(target)) return;
  close();
});

useEventListener(
  window,
  "scroll",
  () => {
    if (isOpen.value) updateDropdownPosition();
  },
  { capture: true, passive: true },
);

useEventListener(window, "resize", () => {
  if (isOpen.value) updateDropdownPosition();
});

if (typeof window !== "undefined" && window.visualViewport) {
  useEventListener(window.visualViewport, "resize", () => {
    if (isOpen.value) updateDropdownPosition();
  });
  useEventListener(window.visualViewport, "scroll", () => {
    if (isOpen.value) updateDropdownPosition();
  });
}

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => {
      updateDropdownPosition();
      // Only focus input on non-touch devices to avoid keyboard popup
      if (!isTouchDevice) inputRef.value?.focus();
    });
  }
});

function toggle() {
  if (props.disabled) return;
  isOpen.value ? close() : open();
}

function open() {
  if (props.disabled) return;
  isOpen.value = true;
  query.value = "";
  activeIndex.value = -1;
}

function close() {
  isOpen.value = false;
  query.value = "";
  activeIndex.value = -1;
}

function isSelected(value: string | number) {
  return (props.modelValue ?? []).includes(value);
}

function select(option: MultiSelectOption) {
  if (option.disabled) return;
  const current = [...(props.modelValue ?? [])];
  const idx = current.indexOf(option.value);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    if (isMaxReached.value) return;
    current.push(option.value);
  }
  emit("update:modelValue", current);
  emit("change", current);
  query.value = "";
  if (!isTouchDevice) nextTick(() => inputRef.value?.focus());
}

function removeTag(value: string | number, e: MouseEvent) {
  e.stopPropagation();
  const current = (props.modelValue ?? []).filter((v) => v !== value);
  emit("update:modelValue", current);
  emit("change", current);
}

function clearAll(e: MouseEvent) {
  e.stopPropagation();
  emit("update:modelValue", []);
  emit("change", []);
}

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  emit("search", query.value);
  activeIndex.value = -1;
  if (!isOpen.value) isOpen.value = true;
}

function onKeydown(e: KeyboardEvent) {
  const len = filteredOptions.value.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen.value) {
      open();
      return;
    }
    activeIndex.value = (activeIndex.value + 1) % len;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + len) % len;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (
      isOpen.value &&
      activeIndex.value >= 0 &&
      filteredOptions.value[activeIndex.value]
    ) {
      select(filteredOptions.value[activeIndex.value]);
    }
  } else if (e.key === "Backspace" && !query.value) {
    const current = [...(props.modelValue ?? [])];
    if (current.length) {
      current.pop();
      emit("update:modelValue", current);
      emit("change", current);
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

    <!-- Trigger box -->
    <div
      ref="triggerRef"
      class="input min-h-[42px] h-auto flex items-stretch gap-1.5 cursor-pointer py-1.5 pr-2"
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
        class="absolute left-3 top-3.5 w-4 h-4 text-secondary-400 pointer-events-none"
      />

      <!-- Tags + input -->
      <div class="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary-100 text-primary-700 text-xs font-medium"
        >
          {{ opt.label }}
          <button
            type="button"
            class="hover:text-primary-900 transition-colors"
            @click="removeTag(opt.value, $event)"
          >
            <X class="w-3 h-3" />
          </button>
        </span>

        <!-- Search input — readonly on touch to prevent keyboard popup -->
        <input
          v-if="!disabled"
          ref="inputRef"
          :value="query"
          :readonly="isTouchDevice"
          class="flex-1 min-w-[80px] outline-none bg-transparent text-sm"
          :class="{
            'cursor-pointer caret-transparent select-none': isTouchDevice,
          }"
          :placeholder="selectedOptions.length === 0 ? placeholder : ''"
          :disabled="disabled"
          @input="onInput"
          @keydown="onKeydown"
          @focus="open"
        />
      </div>

      <!-- Right icons -->
      <div class="flex items-center gap-1 shrink-0 self-center">
        <button
          v-if="(modelValue ?? []).length > 0"
          type="button"
          class="text-secondary-400 hover:text-secondary-600"
          @click="clearAll"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          class="text-secondary-400 hover:text-secondary-600"
          @click.stop="toggle"
        >
          <ChevronDown
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Teleport to body — escapes overflow:hidden / stacking context -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :style="dropdownStyle"
          class="fixed z-[9999] bg-white border border-secondary-200 rounded-xl shadow-lg overflow-hidden"
        >
          <div class="max-h-60 overflow-y-auto py-1">
            <div
              v-if="filteredOptions.length === 0"
              class="px-4 py-2.5 text-sm text-secondary-400"
            >
              {{ noResultText }}
            </div>
            <div
              v-for="(option, i) in filteredOptions"
              :key="option.value"
              class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2"
              :class="{
                'bg-primary-50 text-primary-700': isSelected(option.value),
                'bg-secondary-50':
                  i === activeIndex && !isSelected(option.value),
                'text-secondary-400 cursor-not-allowed':
                  option.disabled ||
                  (isMaxReached && !isSelected(option.value)),
                'hover:bg-secondary-50 text-secondary-700':
                  !option.disabled &&
                  !isSelected(option.value) &&
                  !isMaxReached,
              }"
              @click="select(option)"
              @mouseenter="activeIndex = i"
            >
              <span>{{ option.label }}</span>
              <svg
                v-if="isSelected(option.value)"
                class="w-4 h-4 shrink-0 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p v-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
