<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
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
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const query = ref("");
const activeIndex = ref(-1);

const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });

function updateDropdownPosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();

  // Use visualViewport when available (accounts for mobile keyboard)
  const vp = window.visualViewport;
  const viewportWidth = vp ? vp.width : window.innerWidth;
  const viewportHeight = vp ? vp.height : window.innerHeight;
  const vpOffsetTop = vp ? vp.offsetTop : 0;
  const vpOffsetLeft = vp ? vp.offsetLeft : 0;

  // Clamp left so dropdown doesn't overflow right edge, min 8px from left edge
  const left = Math.max(
    8,
    Math.min(rect.left - vpOffsetLeft, viewportWidth - rect.width - 8),
  );
  // Cap width so it never exceeds viewport
  const width = Math.min(rect.width, viewportWidth - left - 8);

  // Decide whether to open above or below based on available space
  const spaceBelow = viewportHeight - (rect.bottom - vpOffsetTop);
  const spaceAbove = rect.top - vpOffsetTop;
  const maxDropdownHeight = 240; // max-h-60 = 15rem = 240px

  let top: number;
  if (
    spaceBelow >= Math.min(maxDropdownHeight, 120) ||
    spaceBelow >= spaceAbove
  ) {
    top = rect.bottom + vpOffsetTop + 4;
  } else {
    // Open upward
    top = rect.top + vpOffsetTop - Math.min(maxDropdownHeight, spaceAbove) - 4;
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left + vpOffsetLeft}px`,
    width: `${width}px`,
  };
}

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

// Close when clicking outside both trigger and teleported dropdown
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

// Handle mobile keyboard resize via visualViewport API
if (typeof window !== "undefined" && window.visualViewport) {
  useEventListener(window.visualViewport, "resize", () => {
    if (isOpen.value) updateDropdownPosition();
  });
  useEventListener(window.visualViewport, "scroll", () => {
    if (isOpen.value) updateDropdownPosition();
  });
}

function open() {
  if (props.disabled) return;
  isOpen.value = true;
  query.value = "";
  activeIndex.value = -1;
  nextTick(() => {
    updateDropdownPosition();
    inputRef.value?.focus();
  });
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
      ref="triggerRef"
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

    <!-- Teleport to body — escapes overflow:hidden / stacking context of any parent -->
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
              class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              :class="{
                'bg-primary-50 text-primary-700': option.value === modelValue,
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
