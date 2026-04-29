<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
import { ChevronDown } from "lucide-vue-next";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: any;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
}>();

// ── Refs ──────────────────────────────────────────────────
const containerRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const isOpen = ref(false);
const activeIndex = ref(-1);

const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });

// ── Dropdown position ─────────────────────────────────────
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

  const top =
    spaceBelow >= Math.min(maxDropdownHeight, 120) || spaceBelow >= spaceAbove
      ? rect.bottom + vpOffsetTop + 4
      : rect.top + vpOffsetTop - Math.min(maxDropdownHeight, spaceAbove) - 4;

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left + vpOffsetLeft}px`,
    width: `${width}px`,
  };
}

// ── Selected label ────────────────────────────────────────
const selectedLabel = computed(() => {
  if (props.modelValue === undefined || props.modelValue === "") return "";
  return (
    props.options.find((o) => o.value === props.modelValue)?.label ??
    String(props.modelValue)
  );
});

// ── Close on outside click / scroll / resize ──────────────
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

// ── Open / Close / Select ─────────────────────────────────
function open() {
  if (props.disabled) return;
  isOpen.value = true;
  activeIndex.value = props.options.findIndex(
    (o) => o.value === props.modelValue,
  );
  nextTick(updateDropdownPosition);
}

function close() {
  isOpen.value = false;
  activeIndex.value = -1;
}

function toggle() {
  isOpen.value ? close() : open();
}

function select(option: SelectOption) {
  if (option.disabled) return;
  emit("update:modelValue", option.value);
  emit("change", option.value);
  close();
}

// ── Keyboard navigation ───────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
    return;
  }
  const len = props.options.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % len;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + len) % len;
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (activeIndex.value >= 0 && props.options[activeIndex.value]) {
      select(props.options[activeIndex.value]);
    }
  } else if (e.key === "Escape") {
    close();
  }
}
</script>

<template>
  <div ref="containerRef" class="w-full">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      ref="triggerRef"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      tabindex="0"
      class="input flex items-center gap-2 cursor-pointer select-none pr-9"
      :class="{
        'pl-9': icon,
        'border-red-300 focus:border-red-500 focus:ring-red-500': error,
        'opacity-50 cursor-not-allowed pointer-events-none': disabled,
        'border-primary-400 ring-2 ring-primary-400': isOpen,
      }"
      @click="toggle"
      @keydown="onKeydown"
    >
      <!-- Left icon -->
      <component
        v-if="icon"
        :is="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none"
      />

      <!-- Selected value / placeholder -->
      <span
        class="flex-1 text-sm truncate"
        :class="selectedLabel ? 'text-secondary-900' : 'text-secondary-400'"
      >
        {{ selectedLabel || placeholder || "เลือก..." }}
      </span>

      <!-- Chevron -->
      <ChevronDown
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <!-- Dropdown — Teleport to body เหมือน BaseAutocomplete -->
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
              v-for="(option, i) in options"
              :key="option.value"
              class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              :class="{
                'bg-primary-50 text-primary-700 font-medium':
                  option.value === modelValue,
                'bg-secondary-50':
                  i === activeIndex && option.value !== modelValue,
                'text-secondary-400 cursor-not-allowed': option.disabled,
                'hover:bg-secondary-50 text-secondary-700':
                  !option.disabled && option.value !== modelValue,
              }"
              @click="select(option)"
              @mouseenter="activeIndex = i"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p v-if="error" class="error-msg mt-1.5">{{ error }}</p>
  </div>
</template>
