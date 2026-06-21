<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue?: string | number | null;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: any;
  iconRight?: any;
  readonly?: boolean;
  /** อนุญาตให้กรอกค่าติดลบได้ (ใช้เฉพาะ type="number") */
  allowNegative?: boolean;
  size?: "sm" | "md";
  prefix?: string | any;
  suffix?: string | any;
  prefixClickable?: boolean;
  suffixClickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  required: false,
  readonly: false,
  allowNegative: false,
  size: "md",
  prefixClickable: false,
  suffixClickable: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  iconRightClick: [];
  prefixClick: [];
  suffixClick: [];
}>();

const inputClasses = computed(() => [
  "input",
  props.size === "sm" ? "input-sm" : "",
  {
    "pl-9": props.icon,
    "pr-10": props.iconRight,
    "border-red-300 focus:border-red-500 focus:ring-red-500": props.error,
    "no-spinner": props.type === "number",
    "opacity-50 cursor-not-allowed": props.disabled,
  },
]);

/** ค่าที่แสดงใน input (เป็น string เพื่อ format ทศนิยม) */
const displayValue = ref<string>(
  props.modelValue != null && props.modelValue !== "" && props.type === "number"
    ? Number(props.modelValue).toFixed(2)
    : (props.modelValue ?? "")?.toString() ?? ""
);

/** เมื่อ props เปลี่ยนจากข้างนอก (ไม่ได้ focus อยู่) */
const isFocused = ref(false);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const raw = target.value;

  if (props.type === "number") {
    // อัปเดต displayValue ทุกครั้งที่ user พิม เพื่อให้ boundValue สะท้อนค่าล่าสุด
    displayValue.value = raw;

    if (raw === "" || raw === "-") {
      emit("update:modelValue", raw === "" ? null : raw);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      emit("update:modelValue", num);
    }
  } else {
    emit("update:modelValue", raw);
  }
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true;
  if (props.type === "number") {
    // แสดงค่าดิบขณะกรอก (ไม่ format)
    const raw = props.modelValue;
    displayValue.value =
      raw != null && raw !== "" ? String(raw) : "";
  }
  emit("focus", event);
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false;
  if (props.type === "number") {
    // Format ทศนิยม 2 ตำแหน่งเมื่อออกจาก input
    const num = parseFloat(String(props.modelValue ?? ""));
    if (!isNaN(num)) {
      displayValue.value = num.toFixed(2);
      emit("update:modelValue", num);
    } else {
      displayValue.value = "";
      emit("update:modelValue", null);
    }
  }
  emit("blur", event);
}

function handleKeydown(event: KeyboardEvent) {
  if (props.type !== "number") return;

  const input = event.target as HTMLInputElement;
  const isDigit = event.key >= "0" && event.key <= "9";
  const isMinus = event.key === "-" && props.allowNegative;
  const isCtrlCmd = event.ctrlKey || event.metaKey; // copy/paste/select-all
  const allowedKeys = [
    "Backspace", "Delete", "ArrowLeft", "ArrowRight",
    "Tab", "Home", "End",
  ];

  // บล็อกแป้นที่ไม่อนุญาต
  if (!isDigit && !isMinus && event.key !== "." && !allowedKeys.includes(event.key) && !isCtrlCmd) {
    event.preventDefault();
    return;
  }

  // ป้องกันกด "." ซ้ำ (มี . อยู่แล้ว)
  if (event.key === ".") {
    if (input.value.includes(".")) {
      event.preventDefault();
      return;
    }
  }

  // ป้องกันกด "-" ซ้ำ หรือกด "-" ที่ไม่ใช่ตำแหน่งแรก
  if (event.key === "-") {
    if (!props.allowNegative || input.selectionStart !== 0 || input.value.includes("-")) {
      event.preventDefault();
    }
  }
}

/** Computed value สำหรับ bind กับ input */
const boundValue = computed(() => {
  if (props.type !== "number") return props.modelValue ?? "";
  if (isFocused.value) return displayValue.value;
  // แสดง format ทศนิยม 2 ตำแหน่งขณะไม่ focus
  const num = parseFloat(String(props.modelValue ?? ""));
  return !isNaN(num) ? num.toFixed(2) : (props.modelValue ?? "");
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- With Prefix / Suffix (Input Group Style) -->
    <div
      v-if="prefix || suffix"
      class="w-full flex items-stretch overflow-hidden border border-secondary-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400 bg-white"
      :class="[
        size === 'sm' ? 'rounded-lg text-xs' : 'rounded-xl text-sm',
        error ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' : ''
      ]"
    >
      <!-- Prefix -->
      <button
        v-if="prefix && prefixClickable"
        type="button"
        @click="emit('prefixClick')"
        class="flex items-center justify-center border-r border-secondary-200 bg-secondary-50 text-secondary-600 hover:bg-secondary-100 transition-colors font-semibold"
        :class="size === 'sm' ? 'px-2.5 text-xs' : 'px-3.5 text-sm'"
      >
        <component :is="prefix" v-if="typeof prefix !== 'string'" />
        <span v-else>{{ prefix }}</span>
      </button>
      <div
        v-else-if="prefix"
        class="flex items-center justify-center border-r border-secondary-200 bg-secondary-50 text-secondary-505 select-none whitespace-nowrap"
        :class="size === 'sm' ? 'px-2.5 text-xs font-semibold' : 'px-3.5 text-sm font-semibold'"
      >
        <component :is="prefix" v-if="typeof prefix !== 'string'" />
        <span v-else>{{ prefix }}</span>
      </div>

      <!-- Input -->
      <input
        :type="type === 'number' ? 'text' : type"
        :inputmode="type === 'number' ? 'decimal' : undefined"
        :value="boundValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        class="flex-1 min-w-0 border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-secondary-400 text-secondary-900 transition-all duration-200"
        :class="[
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
          {
            'opacity-50 cursor-not-allowed': disabled,
            'no-spinner': type === 'number'
          }
        ]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Suffix -->
      <button
        v-if="suffix && suffixClickable"
        type="button"
        @click="emit('suffixClick')"
        class="flex items-center justify-center border-l border-secondary-200 transition-colors font-semibold"
        :class="[
          size === 'sm' ? 'px-2.5 text-xs' : 'px-3.5 text-sm',
          suffix === 'ใช้'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200'
            : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
        ]"
      >
        <component :is="suffix" v-if="typeof suffix !== 'string'" />
        <span v-else>{{ suffix }}</span>
      </button>
      <div
        v-else-if="suffix"
        class="flex items-center justify-center border-l border-secondary-200 bg-secondary-50 text-secondary-505 select-none whitespace-nowrap"
        :class="size === 'sm' ? 'px-2.5 text-xs font-semibold' : 'px-3.5 text-sm font-semibold'"
      >
        <component :is="suffix" v-if="typeof suffix !== 'string'" />
        <span v-else>{{ suffix }}</span>
      </div>
    </div>

    <!-- Standard Input (No Prefix/Suffix) -->
    <div v-else class="w-full relative">
      <component
        v-if="icon"
        :is="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
      />
      <input
        :type="type === 'number' ? 'text' : type"
        :inputmode="type === 'number' ? 'decimal' : undefined"
        :value="boundValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
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

<style scoped>
/* ซ่อนลูกศรเพิ่มลด (spinner) สำหรับ number input */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner[type="number"] {
  -moz-appearance: textfield;
}
</style>
